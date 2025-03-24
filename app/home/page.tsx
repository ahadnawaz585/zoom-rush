"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Video } from "lucide-react";
import { toast } from "sonner";
import MeetingForm from "@/components/shared/meeting-form";
import BotList from "@/components/shared/bot-list";
import PreviousSchedule from "@/components/shared/previous-schedule";
import Navbar from "@/components/Navbar";
import { generateBotName } from "@/lib/botUtils";
import { useRouter } from "next/navigation";
import { Country } from "../services/countryApi";
import Cookies from "js-cookie";
import { previousSchedules } from '@/app/data/constants';
import DashboardGraphs from "@/components/dashboard/DashboardGraphs";
import Head from "next/head";

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

// Create a script to handle dark mode before page renders
const DarkModeScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                (!('darkMode' in localStorage) && 
                window.matchMedia('(prefers-color-scheme: dark)').matches);
              
              if (isDarkMode) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {
              // Fallback if localStorage is not available
            }
          })();
        `,
      }}
    />
  );
};

export default function Home() {
  const [generatedBots, setGeneratedBots] = useState<Bot[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingBots, setIsGeneratingBots] = useState(false);
  const [countryMap, setCountryMap] = useState<Record<string, Country>>({});
  const [formValues, setFormValues] = useState<FormValues>({
    meetingId: "",
    password: "",
    quantity: 3,
    duration: 5,
    countryCode: "US"
  });
  const router = useRouter();
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!('darkMode' in localStorage)) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleDarkMode = useCallback(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    }
  }, []);
  
  useEffect(() => {
    async function loadCountries() {
      setIsLoading(true);
      try {
        const cachedData = sessionStorage.getItem('countries');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setCountries(parsedData);
          
          const countryMapData: Record<string, Country> = {};
          parsedData.forEach((country: Country) => {
            countryMapData[country.code] = country;
          });
          setCountryMap(countryMapData);
          setIsLoading(false);
          return;
        }
        
        const response = await fetch('/api/countries');
        if (!response.ok) {
          throw new Error('Failed to load countries');
        }
        const countriesData = await response.json();
        
        sessionStorage.setItem('countries', JSON.stringify(countriesData));
        
        const countryMapData: Record<string, Country> = {};
        countriesData.forEach((country: Country) => {
          countryMapData[country.code] = country;
        });
        
        setCountries(countriesData);
        setCountryMap(countryMapData);
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
  
  const getCountryByCode = useCallback((code: string): Country | undefined => {
    return countryMap[code];
  }, [countryMap]);
  
  const generateBotsForCountry = useCallback((countryCode: string, quantity: number) => {
    const country = getCountryByCode(countryCode);
    
    if (!country) {
      console.error(`Country with code ${countryCode} not found`);
      return;
    }
    
    const botNames = Array.from({ length: quantity }, () => generateBotName(countryCode));
    
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
  
  const handleFormChange = useCallback((newValues: Partial<FormValues>) => {
    setFormValues(prev => {
      const updated = { ...prev, ...newValues };
      return updated;
    });
  }, []);
  
  const handleBotsGenerated = useCallback(async (
    quantity: number, 
    countryCode: string, 
    importedBots?: Array<{name: string, countryCode: string, country?: string}>
  ) => {
    setIsGeneratingBots(true);
    setGeneratedBots([]);
    
    try {
      if (importedBots) {
        // Handle imported bots
        const processedBots = importedBots.map((bot, index) => {
          const country = getCountryByCode(bot.countryCode);
          return {
            id: index + 1,
            name: bot.name,
            status: "Ready",
            country: bot.country || country?.name || bot.countryCode,
            countryCode: bot.countryCode,
            flag: country?.flag
          };
        });
        
        setGeneratedBots(processedBots);
        toast.success("Bots imported successfully", {
          description: `Imported ${processedBots.length} bots from Excel file`,
        });
      } else {
        // Generate new bots
        await new Promise(resolve => setTimeout(resolve, 400));
        generateBotsForCountry(countryCode, quantity);
        
        const country = getCountryByCode(countryCode);
        toast.success("Bots generated successfully", {
          description: `Generated ${quantity} bots from ${country?.name || countryCode}`,
        });
      }
    } catch (error) {
      console.error("Error generating/importing bots:", error);
      toast.error("Error processing bots", {
        description: "Please try again",
      });
    } finally {
      setIsGeneratingBots(false);
    }
  }, [generateBotsForCountry, getCountryByCode]);

  const joinMeeting = useCallback(async (joinFormValues: FormValues) => {
    if (generatedBots.length === 0) {
      toast.error("No bots generated");
      return;
    }

    setIsJoining(true);

    try {
      const data = {
        success: true,
        meetingId: joinFormValues.meetingId,
        password: joinFormValues.password,
      };

      if (data.success) {
        toast.success("Bots are joining the meeting", {
          description: `${joinFormValues.quantity} bots are connecting to the meeting`,
        });

        simulateStatusUpdates(joinFormValues.quantity);
        
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

  async function loadZoomSDK() {
    if (!ZoomMtg) {
      try {
        const zoomModule = await import("@zoomus/websdk");
        ZoomMtg = zoomModule.ZoomMtg;
        
        ZoomMtg.setZoomJSLib('https://source.zoom.us/2.11.0/lib', '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();
        
        return ZoomMtg;
      } catch (error) {
        console.error("Failed to load Zoom SDK:", error);
        throw error;
      }
    }
    return ZoomMtg;
  }

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
    
    setTimeout(() => {
      console.log("Meeting saved to previous schedules");
    }, 4500);
  }

  return (
    <>
      <DarkModeScript />
      
      <div className="h-screen flex flex-col bg-[#F5F8FC] dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Navbar />
        
        <div className="flex-grow overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-1xl mx-auto flex flex-col h-full">
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

              <BotList 
                bots={generatedBots} 
                loading={isLoading || isGeneratingBots}
              />
            </div>

            <div className="mt-6">
              <DashboardGraphs schedules={previousSchedules} />
            </div>

            <div className="mt-6">
              <PreviousSchedule />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}