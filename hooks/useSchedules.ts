import { useEffect, useState } from 'react';
import { Schedule, getPreviousSchedules, getUpcomingMeetings } from '@/lib/firebase/schedule'
import Cookies from 'js-cookie';

export const useSchedules = () => {
  const [previousSchedules, setPreviousSchedules] = useState<Schedule[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const userId = Cookies.get('session');
        if (!userId) {
          setError('No user session found');
          setLoading(false);
          return;
        }

        const [previous, upcoming] = await Promise.all([
          getPreviousSchedules(userId),
          getUpcomingMeetings(userId)
        ]);

        setPreviousSchedules(previous);
        setUpcomingMeetings(upcoming);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError('Failed to fetch schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  return {
    previousSchedules,
    upcomingMeetings,
    loading,
    error,
    setPreviousSchedules,
    setUpcomingMeetings
  };
};