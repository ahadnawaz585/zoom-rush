import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase'; // Assuming this is where your Firestore instance is initialized

// Define Bot interface
export interface Bot {
  id: string; // Changed from number to string to match MeetingForm generation
  name: string;
  countryCode: string;
  country?: string;
  status?: string; // Made optional as it's not always used
  flag?: string;
}

// Define Schedule interface matching MeetingForm and UpcomingMeetings
export interface Schedule {
  id: string;
  meetingId: string;
  password: string;
  quantity: number;
  duration: number;
  countryCode: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  bots: any;
  userId: string;
  createdAt: any; // Compatible with serverTimestamp
  updatedAt?: any; // Optional field for updates
}

// Collections
export const previousSchedulesCollection = collection(firestore, 'previousSchedules');
export const upcomingMeetingsCollection = collection(firestore, 'upcomingMeetings');

// Previous Schedules
export const savePreviousSchedule = async (schedule: Omit<Schedule, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(previousSchedulesCollection, {
      ...schedule,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving previous schedule:', error);
    throw error;
  }
};

export const getPreviousSchedules = async (userId: string): Promise<Schedule[]> => {
  try {
    const q = query(
      previousSchedulesCollection,
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Schedule[];
  } catch (error) {
    console.error('Error getting previous schedules:', error);
    throw error;
  }
};

// Upcoming Meetings
export const saveUpcomingMeeting = async (meeting: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(upcomingMeetingsCollection, {
      ...meeting,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving upcoming meeting:', error);
    throw error;
  }
};

export const getUpcomingMeetings = async (userId: string): Promise<Schedule[]> => {
  try {
    const q = query(
      upcomingMeetingsCollection,
      where('userId', '==', userId),
      where('status', '!=', 'completed') // Only get non-completed meetings
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Schedule[];
  } catch (error) {
    console.error('Error getting upcoming meetings:', error);
    throw error;
  }
};

export const updateUpcomingMeeting = async (meetingId: string, updates: Partial<Omit<Schedule, 'id'>>): Promise<void> => {
  try {
    const meetingRef = doc(upcomingMeetingsCollection, meetingId);
    await updateDoc(meetingRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating upcoming meeting:', error);
    throw error;
  }
};

export const deleteUpcomingMeeting = async (meetingId: string): Promise<void> => {
  try {
    const meetingRef = doc(upcomingMeetingsCollection, meetingId);
    await deleteDoc(meetingRef);
  } catch (error) {
    console.error('Error deleting upcoming meeting:', error);
    throw error;
  }
};

export const getMeetingById = async (meetingId: string): Promise<Schedule | null> => {
  try {
    const meetingRef = doc(upcomingMeetingsCollection, meetingId);
    const meetingSnap = await getDoc(meetingRef);
    
    if (meetingSnap.exists()) {
      return { 
        id: meetingSnap.id,
        ...meetingSnap.data() 
      } as Schedule;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching meeting by ID:', error);
    throw error;
  }
};

export const getAllUpcomingMeetings = async (): Promise<Schedule[]> => {
  try {
    const querySnapshot = await getDocs(upcomingMeetingsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Schedule[];
  } catch (error) {
    console.error('Error getting all upcoming meetings:', error);
    throw error;
  }
};

// New function to move completed meetings to previous schedules
export const completeUpcomingMeeting = async (meetingId: string): Promise<void> => {
  try {
    const meeting = await getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    // Update status in upcoming meetings
    await updateUpcomingMeeting(meetingId, { status: 'completed' });

    // Save to previous schedules
    const { id, ...meetingWithoutId } = meeting;
    await savePreviousSchedule({
      ...meetingWithoutId,
      status: 'completed'
    });

    // Optional: Delete from upcoming meetings after moving
    // await deleteUpcomingMeeting(meetingId);
  } catch (error) {
    console.error('Error completing upcoming meeting:', error);
    throw error;
  }
};