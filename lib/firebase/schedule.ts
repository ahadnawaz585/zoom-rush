// lib/schedules.ts
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase'; // Assuming this is where your Firestore instance is initialized

export interface Bot {
  id: number;
  name: string;
  status: string;
  countryCode: string;
  country?: string;
  flag?: string;
}

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
  bots: any[];
  userId: string;
  createdAt: any; // Using any to match serverTimestamp type compatibility
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

export const getPreviousSchedules = async (userId: string) => {
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
export const saveUpcomingMeeting = async (meeting: Omit<Schedule, 'id' | 'createdAt'>) => {
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

export const getUpcomingMeetings = async (userId: string) => {
  try {
    const q = query(
      upcomingMeetingsCollection,
      where('userId', '==', userId)
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

export const updateUpcomingMeeting = async (meetingId: string, updates: Partial<Schedule>) => {
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

export const deleteUpcomingMeeting = async (meetingId: string) => {
  try {
    const meetingRef = doc(upcomingMeetingsCollection, meetingId);
    await deleteDoc(meetingRef);
  } catch (error) {
    console.error('Error deleting upcoming meeting:', error);
    throw error;
  }
};

// Additional utility function similar to getUserById
export const getMeetingById = async (meetingId: string) => {
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

// Optional: Get all upcoming meetings (similar to getAllUsers)
export const getAllUpcomingMeetings = async () => {
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