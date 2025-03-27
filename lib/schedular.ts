// lib/scheduler.ts
import { scheduleJob, cancelJob } from 'node-schedule';
import { v4 as uuidv4 } from 'uuid';

export interface ScheduledMeeting {
  id: string;
  meetingId: string;
  password: string;
  startTime: Date;
  endTime: Date;
  title: string;
  status: 'scheduled' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  bots: {
    quantity: number;
    countryCode: string;
  };
}

export class MeetingScheduler {
  private scheduledMeetings: ScheduledMeeting[] = [];

  scheduleMeeting(meetingDetails: Omit<ScheduledMeeting, 'id' | 'status'>) {
    const newMeeting: ScheduledMeeting = {
      id: uuidv4(),
      status: 'scheduled',
      ...meetingDetails
    };

    // Schedule the meeting start
    const startJob = scheduleJob(meetingDetails.startTime, () => {
      this.updateMeetingStatus(newMeeting.id, 'in-progress');
      // Trigger bot joining logic here
    });

    // Schedule the meeting end
    const endJob = scheduleJob(meetingDetails.endTime, () => {
      this.updateMeetingStatus(newMeeting.id, 'completed');
      // Clean up bot connections
    });

    this.scheduledMeetings.push(newMeeting);
    return newMeeting;
  }

  cancelMeeting(meetingId: string) {
    const meetingIndex = this.scheduledMeetings.findIndex(m => m.id === meetingId);
    if (meetingIndex !== -1) {
      this.scheduledMeetings[meetingIndex].status = 'cancelled';
      // Cancel any scheduled jobs
    }
  }

  updateMeetingStatus(meetingId: string, status: ScheduledMeeting['status']) {
    const meeting = this.scheduledMeetings.find(m => m.id === meetingId);
    if (meeting) {
      meeting.status = status;
    }
  }

  getUpcomingMeetings(): ScheduledMeeting[] {
    const now = new Date();
    return this.scheduledMeetings
      .filter(meeting => 
        meeting.startTime > now && 
        (meeting.status === 'scheduled' || meeting.status === 'upcoming')
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
}

// Instantiate a global scheduler
export const meetingScheduler = new MeetingScheduler();
