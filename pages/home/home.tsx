"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Home, Video } from "lucide-react";
import { withUserEnabled } from '@/components/HOC/withUserEnabled';
import { toast } from "sonner";
import MeetingForm from "@/components/shared/meeting-form";
import BotList from "@/components/shared/bot-list";
import PreviousSchedule from "@/components/shared/previous-schedule";
import Navbar from "@/components/Navbar";
import { generateBotName } from "@/lib/botUtils";
import { useRouter } from "next/navigation";
import { Country } from "../../services/countryApi";
import Cookies from "js-cookie";
import { previousSchedules } from '@/app/data/constants';
import DashboardGraphs from "@/components/dashboard/DashboardGraphs";
import Head from "next/head";
import { generateBotNames } from "../../services/generateNames";
import { format } from "util";
import UpcomingMeetings from "@/components/shared/upcoming";
import { getUserById } from "@/lib/firebase/users";
import { savePreviousSchedule, Schedule, getPreviousSchedules } from "@/lib/firebase/schedule";

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

function Page() {
  const [generatedBots, setGeneratedBots] = useState<Bot[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [isGeneratingBots, setIsGeneratingBots] = useState(false);
  const [countryMap, setCountryMap] = useState<Record<string, Country>>({});
  const [dashboardData, setDashboardData] = useState(previousSchedules);
  const [previousScheduleData, setPreviousScheduleData] = useState<Schedule[]>([]);
  const [formValues, setFormValues] = useState<FormValues>({
    meetingId: "",
    password: "",
    quantity: 10,
    duration: 60,
    countryCode: "IN"
  });
  const router = useRouter();
  
  // Function to fetch latest schedules and update state
  const refreshScheduleData = useCallback(async () => {
    try {
      const userId = Cookies.get('session');
      if (!userId) return;
      
      // Fetch latest previous schedules from Firebase
      const schedules = await getPreviousSchedules(userId);
      setPreviousScheduleData(schedules);
      
      // Also update dashboard data
      setDashboardData(schedules);
    } catch (error) {
      console.error("Failed to refresh schedule data:", error);
    }
  }, []);
  
  // Initial data fetch
  useEffect(() => {
    refreshScheduleData();
    const userId = Cookies.get('session');
    if (userId) setUserId(userId);
  }, [refreshScheduleData]);
  
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
                    flag: country?.flag // Ensure flag is assigned
                };
            });

            setGeneratedBots(processedBots);
            toast.success("Bots imported successfully", {
                description: `Imported ${processedBots.length} bots from Excel file`,
            });
        } else {
            const country = getCountryByCode(countryCode);

            if (countryCode === 'IN') {
                const botNames = generateBotNames({ 
                    quantity, 
                    gender: 'mixed' // Customizable
                });

                const generatedBots = botNames.map((name, index) => ({
                    id: index,
                    name,
                    status: 'Ready',
                    countryCode: 'IN',
                    country: 'India',
                    flag: country?.flag || '🇮🇳' // Ensure the Indian flag is included
                }));

                setGeneratedBots(generatedBots);
            } else {
                // Generate new bots
                await new Promise(resolve => setTimeout(resolve, 400));
                generateBotsForCountry(countryCode, quantity);

                toast.success("Bots generated successfully", {
                    description: `Generated ${quantity} bots from ${country?.name || countryCode}`,
                });
            }
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
    // Get userId from cookies
    const userId = Cookies.get('session');
    
    if (!userId) {
      console.log('No user session found');
      toast.error("Please log in to join meeting");
      setIsJoining(false);
      return;
    }

    // Check user status
    const user = await getUserById(userId);
    
    if (!user || user.isDeleted || !user.isAllowed) {
      console.log('User check failed:', {
        userExists: !!user,
        isDeleted: user?.isDeleted,
        isAllowed: user?.isAllowed
      });
      toast.error("You don't have permission to join meetings");
      setIsJoining(false);
      Cookies.remove('session');
      Cookies.remove('adminSession');
      window.location.reload();
      return;
    }

    // If we reach here, user is valid, enabled, and not deleted
    const requestBody = {
      bots: generatedBots,
      meetingId: joinFormValues.meetingId,
      password: joinFormValues.password,
      duration: joinFormValues.duration
    };

    const response = await fetch("/api/join-meeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    // Create a schedule data object
    const scheduleData: Omit<Schedule, 'id' | 'createdAt'> = {
      meetingId: joinFormValues.meetingId,
      password: joinFormValues.password,
      quantity: generatedBots.length,
      duration: joinFormValues.duration,
      countryCode: generatedBots[0]?.countryCode || '',
      status: 'completed',
      bots: generatedBots,
      userId: userId,
    };

    // Save the schedule to Firebase
    await savePreviousSchedule(scheduleData);
    
    // Refresh dashboard and previous schedule data
    await refreshScheduleData();

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const result = await response.json();

    if (result.success) {
      toast.success("Bots are joining the meeting", {
        description: `${generatedBots.length} bots are connecting to the meeting`,
      });

      setGeneratedBots((prevBots) =>
        prevBots.map((bot) => ({ ...bot, status: "Connected" }))
      );
    } else {
      throw new Error(result.error || "Unknown error");
    }
  } catch (error) {
    toast.error("Failed to join meeting", {
      description: "An error occurred while connecting bots",
    });
    console.error("Error in joinMeeting:", error);
  } finally {
    setIsJoining(false);
  }
}, [generatedBots, refreshScheduleData]);

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
      refreshScheduleData(); // Refresh data after status updates
    }, 4500);
  }

  const handleRejoin = useCallback((scheduleData: FormValues) => {
    // Update form values with the schedule data
    setFormValues(scheduleData);
    
    // Generate bots with the saved configuration
    handleBotsGenerated(scheduleData.quantity, scheduleData.countryCode);
    
    toast.success("Previous meeting configuration loaded", {
      description: "Form has been filled with the saved meeting details",
    });
  }, [handleBotsGenerated]);

  const [upcomingMeetings, setUpcomingMeetings] = useState<Array<{
    id: string;
    meetingId: string;
    password: string;
    quantity: number;
    duration: number;
    countryCode: string;
    scheduledDate: string;
    scheduledTime: string;
    status: 'scheduled' | 'cancelled';
    bots: Array<{
      id: number;
      name: string;
      status: string;
      countryCode: string;
    }>;
  }>>([]);

  const handleScheduleMeeting = useCallback((values: FormValues & { scheduledDate?: string; scheduledTime?: string }) => {
    if (!values.scheduledDate || !values.scheduledTime) {
      toast.error("Please select both date and time");
      return;
    }

    // Generate bot names for the scheduled meeting
    const bots = Array.from({ length: values.quantity }, (_, index) => ({
      id: index + 1,
      name: generateBotName(values.countryCode),
      status: 'Ready',
      countryCode: values.countryCode
    }));

    const newMeeting = {
      id: Math.random().toString(36).substr(2, 9),
      meetingId: values.meetingId,
      password: values.password,
      quantity: values.quantity,
      duration: values.duration,
      countryCode: values.countryCode,
      scheduledDate: values.scheduledDate,
      scheduledTime: values.scheduledTime,
      status: 'scheduled' as const,
      bots
    };

    setUpcomingMeetings(prev => [...prev, newMeeting]);
    
    toast.success("Meeting scheduled successfully", {
      description: `Meeting scheduled for ${format(
        new Date(`${values.scheduledDate}T${values.scheduledTime}`),
        'MMM d, yyyy HH:mm'
      )}`
    });
  }, []);

  const handleCancelMeeting = useCallback((meetingId: string) => {
    setUpcomingMeetings(prev =>
      prev.map(meeting =>
        meeting.id === meetingId
          ? { ...meeting, status: 'cancelled' as const }
          : meeting
      )
    );

    toast.success("Meeting cancelled successfully");
  }, []);

  const handleDeleteMeeting = useCallback((meetingId: string) => {
    setUpcomingMeetings(prev =>
      prev.filter(meeting => meeting.id !== meetingId)
    );

    toast.success("Meeting deleted successfully");
  }, []);

  const handleJoinScheduledMeeting = useCallback(async (meeting: any) => {
    // Update form values with the scheduled meeting details
    console.log(meeting);
    setFormValues({
      meetingId: meeting.meetingId,
      password: meeting.password,
      quantity: meeting.quantity,
      duration: meeting.duration,
      countryCode: meeting.countryCode
    });

    // Use the saved bots instead of generating new ones
    setGeneratedBots(meeting.bots.map((bot:any) => ({
      ...bot,
      country: countries.find(c => c.code === bot.countryCode)?.name,
      flag: countries.find(c => c.code === bot.countryCode)?.flag
    })));
    
    toast.success("Joining scheduled meeting", {
      description: `Connecting ${meeting.quantity} bots to the meeting`
    });
    
    // After joining meeting, refresh the dashboard and previous schedules
    await refreshScheduleData();
  }, [countries, refreshScheduleData]);

  return (
    <>
      <DarkModeScript />
      <div className="min-h-screen flex flex-col bg-[#F5F8FC] dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Navbar />
        
        <div className="flex-grow overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex flex-col h-full">
            {/* Two-column layout that stacks on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-stretch">
              <div className="flex flex-col">
                <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 shadow rounded-xl p-3 sm:p-4">
                  <MeetingForm
                    onBotsGenerated={handleBotsGenerated}
                    onJoinMeeting={joinMeeting}
                    onScheduleMeeting={handleScheduleMeeting}
                    onFormChange={handleFormChange}
                    formValues={formValues}
                    isJoining={isJoining}
                    isLoading={isLoading}
                    hasGeneratedBots={generatedBots.length > 0}
                    countries={countries}
                  />
                </div>
              </div>
              
              <div className="flex flex-col mt-4 lg:mt-0">
                <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 shadow rounded-xl p-3 sm:p-4">
                  <BotList
                    bots={generatedBots}
                    loading={isLoading || isGeneratingBots}
                  />
                </div>
              </div>
            </div>
            
            {/* Full-width sections */}
            <div className="mt-4 md:mt-6">
              <UpcomingMeetings
                userId={userId}
                countries={countries.reduce((acc, country) => ({
                  ...acc,
                  [country.code]: country.name
                }), {})}
                onJoinMeeting={handleJoinScheduledMeeting}
              />
            </div>
            
            <div className="mt-4 md:mt-6">
              <DashboardGraphs schedules={dashboardData} />
            </div>
            
            <div className="mt-4 md:mt-6">
              <PreviousSchedule
                onRejoin={handleRejoin}
                schedules={previousScheduleData}
                refreshData={refreshScheduleData}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const HomePage = withUserEnabled(Page);