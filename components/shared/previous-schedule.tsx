import React, { useState, useEffect } from 'react';
import { Video, Users, Globe, Clock, Calendar, Play, RefreshCw, X, MoreHorizontal, Info } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { countries } from '@/app/data/constants';
import { getPreviousSchedules, Schedule } from '@/lib/firebase/schedule';
import Cookies from 'js-cookie';
import { toast } from "sonner";
import { formatDate } from '../../lib/date';

interface PreviousScheduleProps {
  onRejoin: (schedule: { meetingId: string; password: string; quantity: number; duration: number; countryCode: string }) => void;
}

const PreviousSchedule: React.FC<PreviousScheduleProps> = ({ onRejoin }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch previous schedules from Firebase
  useEffect(() => {
    const fetchSchedules = async () => {
      const userId = Cookies.get('session');
      if (!userId) {
        toast.error("Please log in to view previous schedules");
        setLoading(false);
        return;
      }

      try {
        const fetchedSchedules = await getPreviousSchedules(userId);
        setSchedules(fetchedSchedules);
      } catch (error) {
        console.error('Error fetching previous schedules:', error);
        toast.error("Failed to load previous schedules");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const handleRejoin = (schedule: Schedule) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onRejoin({
      meetingId: schedule.meetingId,
      password: schedule.password || "",
      quantity: schedule.quantity,
      duration: schedule.duration,
      countryCode: schedule.countryCode
    });
  };

  const handleTerminate = (meetingId: string) => {
    console.log(`Terminating meeting: ${meetingId}`);
    // Add terminate logic here if needed (e.g., update status in Firebase)
  };

  const handleShowInfo = (meeting: Schedule) => {
    setSelectedMeeting(meeting);
    setIsInfoOpen(true);
  };

  if (loading) {
    return (
      <Card className="mt-6 dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 dark:text-white text-sm">
            <Calendar className="h-4 w-4" />
            Previous Schedules
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="text-center">Loading previous schedules...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6 dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 dark:text-white text-sm">
            <Calendar className="h-4 w-4" />
            Previous Schedules
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          {schedules.length === 0 ? (
            <div className="text-center py-4 dark:text-slate-400">
              No previous schedules found
            </div>
          ) : (
            <div className="rounded-md border dark:border-slate-600">
              <Table className="text-xs">
                <TableHeader className="dark:bg-slate-900">
                  <TableRow className="dark:border-slate-700 h-8">
                    <TableHead className="dark:text-slate-300 py-1.5 px-2 text-xs font-medium">Meeting ID</TableHead>
                    <TableHead className="dark:text-slate-300 py-1.5 px-2 text-xs font-medium">Bots</TableHead>
                    <TableHead className="dark:text-slate-300 py-1.5 px-2 text-xs font-medium">Duration</TableHead>
                    <TableHead className="dark:text-slate-300 py-1.5 px-2 text-xs font-medium">Country</TableHead>
                    <TableHead className="dark:text-slate-300 py-1.5 px-2 text-xs font-medium">Status</TableHead>
                    <TableHead className="dark:text-slate-300 py-1.5 px-2 text-xs font-medium">Date</TableHead>
                    <TableHead className="dark:text-slate-300 py-1.5 px-2 text-xs font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id} className="dark:border-slate-700 dark:hover:bg-slate-800/50 h-8">
                      <TableCell className="dark:text-slate-300 py-1 px-2 text-xs">{schedule.meetingId}</TableCell>
                      <TableCell className="dark:text-slate-300 py-1 px-2 text-xs">{schedule.quantity}</TableCell>
                      <TableCell className="dark:text-slate-300 py-1 px-2 text-xs">{schedule.duration} mins</TableCell>
                      <TableCell className="dark:text-slate-300 py-1 px-2 text-xs">{countries[schedule.countryCode as keyof typeof countries]}</TableCell>
                      <TableCell className="py-1 px-2">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            schedule.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : schedule.status === "cancelled"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="dark:text-slate-300 py-1 px-2 text-xs">
                        {schedule.createdAt  
                          ? `${formatDate(schedule.createdAt)}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right py-1 px-2 flex justify-end space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 dark:text-slate-300 dark:hover:bg-slate-700"
                          onClick={() => handleShowInfo(schedule)}
                        >
                          <span className="sr-only">Show details</span>
                          <Info className="h-3 w-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 dark:text-slate-300 dark:hover:bg-slate-700">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                            <DropdownMenuItem 
                              className="flex items-center gap-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700 cursor-pointer text-xs py-1"
                              onClick={() => handleRejoin(schedule)}
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Rejoin</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700 cursor-pointer text-red-600 dark:text-red-400 text-xs py-1"
                              onClick={() => handleTerminate(schedule.meetingId)}
                            >
                              <X className="h-3 w-3" />
                              <span>Terminate</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Info Dialog */}
      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 max-w-md">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Meeting Details</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Information about the selected meeting
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            {selectedMeeting && (
              <>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Meeting ID:</div>
                  <div className="col-span-2">{selectedMeeting.meetingId}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Status:</div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedMeeting.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : selectedMeeting.status === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {selectedMeeting.status.charAt(0).toUpperCase() + selectedMeeting.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Bots:</div>
                  <div className="col-span-2">{selectedMeeting.quantity}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Duration:</div>
                  <div className="col-span-2">{selectedMeeting.duration} minutes</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Country:</div>
                  <div className="col-span-2">{countries[selectedMeeting.countryCode as keyof typeof countries]}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Date:</div>
                  <div className="col-span-2">
                    {selectedMeeting.scheduledDate && selectedMeeting.scheduledTime 
                      ? `${selectedMeeting.scheduledDate} ${selectedMeeting.scheduledTime}`
                      : 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Time Zone:</div>
                  <div className="col-span-2">UTC+2 (Static for now)</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Host:</div>
                  <div className="col-span-2">John Doe (Static for now)</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Notes:</div>
                  <div className="col-span-2">This meeting was scheduled for testing purposes. (Static for now)</div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline" className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600 text-xs">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PreviousSchedule;