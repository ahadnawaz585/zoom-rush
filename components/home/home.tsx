"use client";

import { useEffect, useState, useCallback } from "react";
import { Home, Video } from "lucide-react";

import { withUserEnabled } from '@/components/HOC/withUserEnabled';
import { toast } from "sonner";
import MeetingForm from "@/components/shared/meeting-form";
import BotList from "@/components/shared/bot-list";
import PreviousSchedule from "@/components/shared/previous-schedule";
import Navbar from "@/components/Navbar";
import { generateBotName, generateUniqueBotNames } from "@/lib/botUtils";
import { Country } from "../../services/countryApi";
import Cookies from "js-cookie";
import DashboardGraphs from "@/components/dashboard/DashboardGraphs";
import UpcomingMeetings, { Schedule } from "@/components/shared/upcoming";
import { getUserById } from "@/lib/firebase/users";
import { savePreviousSchedule, getPreviousSchedules, saveUpcomingMeeting, getUpcomingMeetings } from "@/lib/firebase/schedule";
import { format } from "date-fns";
import { CountryCode } from "@/app/data/constants";

interface Bot {
  id: string;
  name: string;
  status: string;
  country?: string;
  countryCode: string;
  flag?: string;
}

interface FormValues {
  meetingId: string;
  password: string;
  quantity: number;
  duration: number;
  countryCode: string;
  isScheduled?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

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
            } catch (e) {}
          })();
        `,
      }}
    />
  );
};

function Page() {
  const [generatedBots, setGeneratedBots] = useState<any[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [isGeneratingBots, setIsGeneratingBots] = useState(false);
  const [countryMap, setCountryMap] = useState<Record<string, Country>>({});
  const [dashboardData, setDashboardData] = useState<Schedule[]>([]);
  const [previousScheduleData, setPreviousScheduleData] = useState<Schedule[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Schedule[]>([]); // New state for upcoming meetings
  const [formValues, setFormValues] = useState<FormValues>({
    meetingId: "",
    password: "",
    quantity: 10,
    duration: 60,
    countryCode: "IN"
  });

  const refreshScheduleData = useCallback(async () => {
    try {
      const userId = Cookies.get('session');
      if (!userId) return;
      
      const schedules = await getPreviousSchedules(userId);
      setPreviousScheduleData(schedules);
      setDashboardData(schedules);
    } catch (error) {
      console.error("Failed to refresh schedule data:", error);
    }
  }, []);

  const refreshUpcomingMeetings = useCallback(async () => {
    try {
      const userId = Cookies.get('session');
      if (!userId) return;
      const meetings = await getUpcomingMeetings(userId);
      setUpcomingMeetings(meetings.filter(m => m.status !== 'completed'));
    } catch (error) {
      console.error("Failed to refresh upcoming meetings:", error);
    }
  }, []);

  useEffect(() => {
    const userId = Cookies.get('session');
    if (userId) {
      setUserId(userId);
      refreshScheduleData();
      refreshUpcomingMeetings();
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!('darkMode' in localStorage)) {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [refreshScheduleData, refreshUpcomingMeetings]);

  useEffect(() => {
    async function loadCountries() {
      setIsLoading(true);
      try {
        const cachedData = sessionStorage.getItem('countries');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setCountries(parsedData);
          const countryMapData = parsedData.reduce((acc: Record<string, Country>, country: Country) => ({
            ...acc,
            [country.code]: country
          }), {});
          setCountryMap(countryMapData);
        } else {
          const response = await fetch('/api/countries');
          if (!response.ok) throw new Error('Failed to load countries');
          const countriesData = await response.json();
          sessionStorage.setItem('countries', JSON.stringify(countriesData));
          setCountries(countriesData);
          const countryMapData = countriesData.reduce((acc: Record<string, Country>, country: Country) => ({
            ...acc,
            [country.code]: country
          }), {});
          setCountryMap(countryMapData);
        }
      } catch (error) {
        console.error("Failed to load countries:", error);
        toast.error("Failed to load countries data");
      } finally {
        setIsLoading(false);
      }
    }
    loadCountries();
  }, []);

  const getCountryByCode = useCallback((code: string): Country | undefined => countryMap[code], [countryMap]);

  const generateBotsForCountry = useCallback((countryCode: CountryCode | string, quantity: number) => {
    const country = getCountryByCode(countryCode);
    if (!country) return;
  
    const botNames = generateUniqueBotNames(countryCode, quantity);
  
    const bots = botNames.map((name, i) => ({
      id: i.toString(),
      name,
      status: "Ready",
      country: country.name,
      countryCode: country.code,
      flag: country.flag,
    }));
  
    setGeneratedBots(bots);
  }, [getCountryByCode]);

  const handleFormChange = useCallback((newValues: Partial<FormValues>) => {
    setFormValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const handleBotsGenerated = useCallback(async (
    quantity: number,
    countryCode: string,
    importedBots?: Array<{ name: string; countryCode: string; country?: string }>
  ) => {
    setIsGeneratingBots(true);
    setGeneratedBots([]);

    try {
      if (importedBots) {
        const processedBots = importedBots.map((bot, index) => {
          const country = getCountryByCode(bot.countryCode);
          return {
            id: index.toString(),
            name: bot.name,
            status: "Ready",
            country: bot.country || country?.name || bot.countryCode,
            countryCode: bot.countryCode,
            flag: country?.flag
          };
        });
        setGeneratedBots(processedBots);
        toast.success(`Imported ${processedBots.length} bots successfully`);
      } else {
        await new Promise(resolve => setTimeout(resolve, 400));
        generateBotsForCountry(countryCode, quantity);
        const country = getCountryByCode(countryCode);
        toast.success(`Generated ${quantity} bots from ${country?.name || countryCode}`);
      }
    } catch (error) {
      console.error("Error generating bots:", error);
      toast.error("Error processing bots");
    } finally {
      setIsGeneratingBots(false);
    }
  }, [generateBotsForCountry, getCountryByCode]);

  const joinMeeting = useCallback(async (joinFormValues: FormValues) => {
    if (!generatedBots.length) {
      toast.error("No bots generated");
      return;
    }

    setIsJoining(true);
    try {
      const userId = Cookies.get('session');
      if (!userId) {
        toast.error("Please log in to join meeting");
        return;
      }

      const user = await getUserById(userId);
      if (!user || user.isDeleted || !user.isAllowed) {
        toast.error("You don't have permission to join meetings");
        Cookies.remove('session');
        Cookies.remove('adminSession');
        window.location.reload();
        return;
      }

      const requestBody = {
        bots: generatedBots,
        meetingId: joinFormValues.meetingId,
        password: joinFormValues.password,
        duration: joinFormValues.duration
      };

      const url  =  process.env.NEXT_PUBLIC_SERVER_URL || "https://zoomnrush.com/zoombotic";
      const response = await fetch(`${url}/join-meeting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const scheduleData = {
        meetingId: joinFormValues.meetingId,
        password: joinFormValues.password,
        quantity: generatedBots.length,
        duration: joinFormValues.duration,
        countryCode: joinFormValues.countryCode,
        status: 'completed' as const,
        bots: generatedBots,
        userId
      };

      await savePreviousSchedule(scheduleData);
      await refreshScheduleData();

      if (!response.ok) throw new Error("API request failed");

      const result = await response.json();
      if (result.success) {
        toast.success("Bots are joining the meeting", {
          description: `${generatedBots.length} bots are connecting`
        });
        setGeneratedBots(prev => prev.map(bot => ({ ...bot, status: "Connected" })));
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      toast.error("Failed to join meeting", { description: "An error occurred" });
      console.error("Error in joinMeeting:", error);
    } finally {
      setIsJoining(false);
    }
  }, [generatedBots, refreshScheduleData]);

  const handleScheduleMeeting = useCallback(async (values: FormValues) => {
    const userId = Cookies.get('session');
    if (!userId) {
      toast.error("Please log in to schedule a meeting");
      return;
    }

    if (!values.scheduledDate || !values.scheduledTime) {
      toast.error("Please select both date and time");
      return;
    }

    const scheduledDateTime = new Date(`${values.scheduledDate}T${values.scheduledTime}`);
    if (scheduledDateTime < new Date()) {
      toast.error("Please select a future date and time");
      return;
    }

    const bots = Array.from({ length: values.quantity }, (_, index) => ({
      id: index.toString(),
      name: generateBotName(values.countryCode),
      status: 'Ready',
      countryCode: values.countryCode
    }));

    const newMeeting = {
      meetingId: values.meetingId,
      password: values.password,
      quantity: values.quantity,
      duration: values.duration,
      countryCode: values.countryCode,
      scheduledDate: values.scheduledDate,
      scheduledTime: values.scheduledTime,
      status: 'scheduled' as const,
      bots,
      userId,
      id: Date.now().toString(), // Temporary ID, Firebase will replace it
      createdAt: new Date().toISOString(),
    };

    try {
      await saveUpcomingMeeting(newMeeting);
      setUpcomingMeetings(prev => [...prev, newMeeting]); // Immediately update state
      toast.success("Meeting scheduled successfully", {
        description: `Scheduled for ${format(scheduledDateTime, 'MMM d, yyyy HH:mm')}`
      });
      setFormValues({
        meetingId: "",
        password: "",
        quantity: 10,
        duration: 60,
        countryCode: "IN"
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error("Failed to schedule meeting");
    }
  }, []);

  const handleJoinScheduledMeeting = useCallback(async (meeting: Schedule) => {
    setFormValues({
      meetingId: meeting.meetingId,
      password: meeting.password,
      quantity: meeting.quantity,
      duration: meeting.duration,
      countryCode: meeting.countryCode
    });

    const updatedBots = meeting.bots.map(bot => ({
      ...bot,
      country: countries.find(c => c.code === bot.countryCode)?.name,
      flag: countries.find(c => c.code === bot.countryCode)?.flag
    }));
    setGeneratedBots(updatedBots);

    toast.success("Joining scheduled meeting", {
      description: `Connecting ${meeting.quantity} bots`
    });

    await joinMeeting({
      meetingId: meeting.meetingId,
      password: meeting.password,
      quantity: meeting.quantity,
      duration: meeting.duration,
      countryCode: meeting.countryCode
    });
  }, [countries, joinMeeting]);

  const handleRejoin = useCallback((scheduleData: FormValues) => {
    setFormValues(scheduleData);
    handleBotsGenerated(scheduleData.quantity, scheduleData.countryCode);
    toast.success("Previous meeting configuration loaded");
  }, [handleBotsGenerated]);

  return (
    <>
      <DarkModeScript />
      <div className="min-h-screen flex flex-col bg-[#F5F8FC] dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Navbar />
        <div className="flex-grow overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex flex-col h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-stretch">
              <div className="flex flex-col">
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
              <div className="flex flex-col mt-4 lg:mt-0">
                <BotList
                  bots={generatedBots}
                  loading={isLoading || isGeneratingBots}
                />
              </div>
            </div>
            <div className="mt-4 md:mt-6">
              <UpcomingMeetings
                userId={userId}
                countries={countries.reduce((acc, country) => ({
                  ...acc,
                  [country.code]: country.name
                }), {})}
                onJoinMeeting={handleJoinScheduledMeeting}
                onRejoin={handleRejoin}
                meetings={upcomingMeetings} // Pass meetings as prop
                setMeetings={setUpcomingMeetings} // Pass setter to update meetings
              />
            </div>
            <div className="mt-4 md:mt-6">
              <DashboardGraphs  />
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