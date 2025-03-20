"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Video } from "lucide-react";
import { toast } from "sonner";
import MeetingForm from "@/components/shared/meeting-form";
import BotList from "@/components/shared/bot-list";
import PreviousSchedule from "@/components/shared/previous-schedule";
import { generateBotName } from "@/lib/botUtils";
import { useRouter } from "next/navigation";
import { Country } from "../services/countryApi";
import Cookies from "js-cookie";
// Defer Zoom SDK imports
let ZoomMtg: any = null;

interface Bot {
  id: number;
  name: string;
  status: string;
  country?: string;
  countryCode?: string;
  flag?: string;
}

interface FormValues {
  meetingId: string;
  password: string;
  quantity: number;
  duration: number;
  countryCode: string;
}

export default function Home() {
  const [generatedBots, setGeneratedBots] = useState<Bot[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countryMap, setCountryMap] = useState<Record<string, Country>>({});
  const [formValues, setFormValues] = useState<FormValues>({
    meetingId: "",
    password: "",
    quantity: 3,
    duration: 5,
    countryCode: "US"
  });
  const router = useRouter();
  
  // Fetch countries on component mount
  useEffect(() => {
    async function loadCountries() {
      setIsLoading(true);
      try {
        // Fetch countries directly from the API endpoint
        const response = await fetch('/api/countries');
        if (!response.ok) {
          throw new Error('Failed to load countries');
        }
        const countriesData = await response.json();
        
        // Create a map for instant lookups
        const countryMapData: Record<string, Country> = {};
        countriesData.forEach((country: Country) => {
          countryMapData[country.code] = country;
        });
        
        setCountries(countriesData);
        setCountryMap(countryMapData);
        
        // Generate initial bots after loading countries
        if (countriesData.length > 0) {
          const initialCountryCode = formValues.countryCode || countriesData[0].code;
          generateBotsForCountry(initialCountryCode, formValues.quantity);
        }
      } catch (error) {
        console.error("Failed to load countries:", error);
        toast.error("Failed to load countries data", {
          description: "Using fallback country data instead",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCountries();
  }, []);
  
  // Memoized function to get country by code - instant lookup
  const getCountryByCode = useCallback((code: string): Country | undefined => {
    return countryMap[code];
  }, [countryMap]);
  
  // Function to generate bots for a specific country
  const generateBotsForCountry = useCallback((countryCode: string, quantity: number) => {
    const country = getCountryByCode(countryCode);
    
    if (!country) {
      console.error(`Country with code ${countryCode} not found`);
      return;
    }
    
    // Generate bot names in bulk for better performance
    const botNames = Array.from({ length: quantity }, () => generateBotName(countryCode));
    
    // Create bots with pre-fetched country data
    const bots = botNames.map((name, i) => ({
      id: i + 1,
      name,
      status: "Ready",
      country: country.name,
      countryCode: country.code,
      flag: country.flag,
    }));
    
    setGeneratedBots(bots);
  }, [getCountryByCode]);
  
  // Handle form value changes
  const handleFormChange = useCallback((newValues: Partial<FormValues>) => {
    setFormValues(prev => {
      const updated = { ...prev, ...newValues };
      
      // If country code changed, regenerate bots immediately
      if (newValues.countryCode && newValues.countryCode !== prev.countryCode) {
        generateBotsForCountry(newValues.countryCode, updated.quantity);
      }
      // If quantity changed, regenerate bots with current country code
      else if (newValues.quantity && newValues.quantity !== prev.quantity) {
        generateBotsForCountry(updated.countryCode, newValues.quantity);
      }
      
      return updated;
    });
  }, [generateBotsForCountry]);
  
  // Fast bot generation function (now just a wrapper around generateBotsForCountry)
  const handleBotsGenerated = useCallback(async (quantity: number, countryCode: string) => {
    setIsLoading(true);
    
    try {
      generateBotsForCountry(countryCode, quantity);
      
      const country = getCountryByCode(countryCode);
      toast.success("Bots generated successfully", {
        description: `Generated ${quantity} bots from ${country?.name || countryCode}`,
      });
    } catch (error) {
      console.error("Error generating bots:", error);
      toast.error("Error generating bots", {
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  }, [generateBotsForCountry, getCountryByCode]);

  // Optimized joining function
  const joinMeeting = useCallback(async (joinFormValues: FormValues) => {
    if (generatedBots.length === 0) {
      toast.error("No bots generated");
      return;
    }

    setIsJoining(true);

    try {
      // Simulate API call to join meeting
      const data = {
        success: true,
        meetingId: joinFormValues.meetingId,
        password: joinFormValues.password,
      };

      if (data.success) {
        toast.success("Bots are joining the meeting", {
          description: `${joinFormValues.quantity} bots are connecting to the meeting`,
        });

        // Start simulating status updates immediately
        simulateStatusUpdates(joinFormValues.quantity);
        
        // Load Zoom SDK in background
        loadZoomSDK().catch(error => {
          console.error("Error loading Zoom SDK:", error);
        });
      }
    } catch (error) {
      toast.error("Failed to join meeting", {
        description: "An error occurred while connecting to the server",
      });
    } finally {
      setIsJoining(false);
    }
  }, [generatedBots.length]);

  // Optimized Zoom SDK loading with caching
  async function loadZoomSDK() {
    if (!ZoomMtg) {
      try {
        // Dynamic import of Zoom SDK
        const zoomModule = await import("@zoomus/websdk");
        ZoomMtg = zoomModule.ZoomMtg;
        
        // Initialize Zoom Web SDK
        ZoomMtg.setZoomJSLib('https://source.zoom.us/2.11.0/lib', '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();
        
        // Assign to window for global access
        // window.ZoomMtg = ZoomMtg;
        
        return ZoomMtg;
      } catch (error) {
        console.error("Failed to load Zoom SDK:", error);
        throw error;
      }
    }
    return ZoomMtg;
  }

  // Optimized status update function
  function simulateStatusUpdates(botCount: number) {
    const statuses = ['Initializing', 'Joining', 'Connected'];
    let currentStatusIndex = 0;

    const interval = setInterval(() => {
      if (currentStatusIndex >= statuses.length) {
        clearInterval(interval);
        return;
      }

      const currentStatus = statuses[currentStatusIndex];

      setGeneratedBots(prevBots =>
        prevBots.map(bot => ({ ...bot, status: currentStatus }))
      );

      currentStatusIndex++;
    }, 1500);
    
    // Save to "previous schedules" after connected
    setTimeout(() => {
      console.log("Meeting saved to previous schedules");
    }, 4500);
  }

  return (
    <div className="h-screen overflow-auto bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto min-h-full flex flex-col">
        <div className="flex items-center justify-center mb-8">
          <Video className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Zoom Meeting Bot Manager
          </h1>
          <button onClick={()=>{
             Cookies.remove("session");
             window.location.reload();
          }}>Logout</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
          <MeetingForm
            onBotsGenerated={handleBotsGenerated}
            onJoinMeeting={joinMeeting}
            onFormChange={handleFormChange}
            formValues={formValues}
            isJoining={isJoining}
            isLoading={isLoading}
            hasGeneratedBots={generatedBots.length > 0}
            countries={countries}
          />

          <BotList bots={generatedBots} />
        </div>

        <div className="mt-6">
          <PreviousSchedule />
        </div>
      </div>
    </div>
  );
}