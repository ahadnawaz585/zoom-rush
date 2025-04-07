import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Clock, Users, Globe, Play, X, Trash2, UserCircle2, Info, MoreHorizontal, RefreshCw } from "lucide-react";
import { Box, CircularProgress } from '@mui/material';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StripedDataGrid from '../ui/StripDataGrid';
import CustomNoRowsOverlay from '../ui/CustomNoRow';
import { GridToolbar } from '@mui/x-data-grid';
import { formatDate } from '../../lib/date';
import {
  getUpcomingMeetings,
  updateUpcomingMeeting,
  deleteUpcomingMeeting,
  
} from '@/lib/firebase/schedule';

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

interface UpcomingMeetingsProps {
  userId: string;
  countries: Record<string, string>;
  onJoinMeeting: (meeting: Schedule) => void;
  onRejoin: (schedule: { meetingId: string; password: string; quantity: number; duration: number; countryCode: string }) => void;
}

interface Schedule {
  id?: string;
  meetingId: string;
  password?: string;
  quantity: number;
  duration: number;
  countryCode: string;
  status: string;
  bots?: any[];
  createdAt?: any;
  scheduledDate?: string;
  scheduledTime?: string;
}

const UpcomingMeetings: React.FC<UpcomingMeetingsProps> = ({
  userId,
  countries,
  onJoinMeeting,
  onRejoin,
}) => {
  const [meetings, setMeetings] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Schedule | null>(null);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const upcomingMeetings = await getUpcomingMeetings(userId);
        setMeetings(upcomingMeetings);
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [userId]);

  const isScheduledTime = (date: string | undefined, time: string | undefined) => {
    if (!date || !time) return false;
    const scheduledDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const timeDiff = scheduledDateTime.getTime() - now.getTime();
    return timeDiff >= -300000 && timeDiff <= 300000; // 5-minute window
  };

  const handleCancelMeeting = async (meetingId: string) => {
    try {
      await updateUpcomingMeeting(meetingId, { status: 'cancelled' });
      setMeetings(meetings.map(meeting =>
        meeting.id === meetingId ? { ...meeting, status: 'cancelled' } : meeting
      ));
    } catch (error) {
      console.error('Failed to cancel meeting:', error);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      await deleteUpcomingMeeting(meetingId);
      setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
    } catch (error) {
      console.error('Failed to delete meeting:', error);
    }
  };

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

  const handleShowInfo = (meeting: Schedule) => {
    setSelectedMeeting(meeting);
    setIsInfoOpen(true);
  };

  const tableData = useMemo(() => {
    return meetings.map((meeting, index) => ({
      id: meeting.id || `meeting-${index}`,
      meetingId: meeting.meetingId,
      schedule: meeting.scheduledDate && meeting.scheduledTime
        ? formatDate(new Date(`${meeting.scheduledDate}T${meeting.scheduledTime}`))
        : 'Not scheduled',
      bots: meeting.bots?.length || meeting.quantity || 0,
      duration: `${meeting.duration} mins`,
      country: countries[meeting.countryCode] || meeting.countryCode,
      status: meeting.status,
      raw: meeting,
    }));
  }, [meetings, countries]);

  const columns: GridColDef[] = [
    { field: 'meetingId', headerName: 'Meeting ID', flex: 1, minWidth: 130 },
    { field: 'schedule', headerName: 'Schedule', flex: 1, minWidth: 150 },
    {
      field: 'bots',
      headerName: 'Bots',
      width: 80,
      renderCell: (params: GridRenderCellParams) => {
        const meeting = params.row.raw;
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs dark:text-slate-300">
                <Users className="h-3 w-3 text-gray-500 mr-1" />
                {params.value}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md dark:bg-slate-900">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Bot List</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[200px] mt-4">
                {meeting.bots?.length ? (
                  meeting.bots.map((bot: { id: React.Key | null | undefined; name: string }) => (
                    <div key={bot.id} className="flex items-center gap-2 p-2 dark:bg-slate-800">
                      <UserCircle2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm dark:text-gray-300">{bot.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 dark:text-slate-400">No bots available</div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        );
      }
    },
    { field: 'duration', headerName: 'Duration', width: 100 },
    { field: 'country', headerName: 'Country', flex: 1, minWidth: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string;
        return (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
              status === 'cancelled'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const meeting = params.row.raw;
        return (
          <div className="flex justify-end space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 dark:text-slate-300"
              onClick={(e) => {
                e.stopPropagation();
                handleShowInfo(meeting);
              }}
            >
              <Info className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 dark:text-slate-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dark:bg-slate-900">
                <DropdownMenuItem
                  className="flex items-center gap-2 dark:text-slate-300 cursor-pointer text-xs py-1"
                  onClick={() => onJoinMeeting(meeting)}
                  disabled={meeting.status === 'cancelled' || !isScheduledTime(meeting.scheduledDate, meeting.scheduledTime)}
                >
                  <Play className="h-3 w-3" />
                  <span>Join</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 dark:text-slate-300 cursor-pointer text-xs py-1"
                  onClick={() => handleRejoin(meeting)}
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Rejoin</span>
                </DropdownMenuItem>
                {meeting.status !== 'cancelled' && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 dark:text-red-400 cursor-pointer text-xs py-1"
                    onClick={() => handleCancelMeeting(meeting.id)}
                  >
                    <X className="h-3 w-3" />
                    <span>Cancel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="flex items-center gap-2 dark:text-red-400 cursor-pointer text-xs py-1"
                  onClick={() => handleDeleteMeeting(meeting.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <Card className="mt-6 dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 dark:text-white text-sm">
            <Calendar className="h-4 w-4" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="text-center dark:text-slate-300">
            <CircularProgress size={24} className="dark:text-blue-400" />
            <div className="mt-2">Loading upcoming meetings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6 dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 dark:text-white text-sm">
            <Calendar className="h-4 w-4" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <Box sx={{
            width: '100%',
            maxHeight: 500,
            overflow: 'hidden',
            '& .MuiDataGrid-root': {
              border: 'none',
              backgroundColor: 'rgb(15, 23, 42)', // slate-950
              color: 'rgb(255, 255, 255)',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgb(15, 23, 42)', // slate-950 for headers
                borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                color: 'rgb(255, 255, 255)',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: 'rgb(15, 23, 42)', // Ensure individual headers are dark
                color: 'rgb(255, 255, 255)', // White text
                '& .MuiDataGrid-columnHeaderTitle': {
                  color: 'rgb(255, 255, 255)', // Explicitly set title color
                  fontWeight: 'bold',
                },
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                color: 'rgb(203, 213, 225)', // slate-300
              },
              '& .MuiDataGrid-row': {
                '&.odd': {
                  backgroundColor: 'rgb(30, 41, 59)', // slate-800
                },
                '&.even': {
                  backgroundColor: 'rgb(15, 23, 42)', // slate-950
                },
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                },
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: 'rgb(15, 23, 42)', // slate-950
                color: 'rgb(255, 255, 255)',
                borderTop: '1px solid rgba(148, 163, 184, 0.2)',
              },
              '& .MuiDataGrid-toolbarContainer': {
                backgroundColor: 'rgb(15, 23, 42)', // slate-950
                color: 'rgb(255, 255, 255)',
                padding: '8px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              },
              '& .MuiDataGrid-virtualScroller': {
                overflowY: 'auto',
                maxHeight: '400px',
                backgroundColor: 'rgb(15, 23, 42)', // slate-950
              },
              '& .MuiTablePagination-root': {
                color: 'rgb(255, 255, 255)',
              },
              '& .MuiIconButton-root': {
                color: 'rgb(255, 255, 255)',
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.3)', // Ensure disabled state is visible
                },
              },
              '& .MuiSvgIcon-root': {
                color: 'rgb(255, 255, 255)',
              },
              '& .MuiDataGrid-overlay': {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                color: 'rgb(255, 255, 255)',
              },
            },
          }}>
            <StripedDataGrid
              rows={tableData}
              columns={columns}
              pagination
              paginationMode="client"
              rowCount={tableData.length}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={(model) => {
                setPage(model.page);
                setPageSize(model.pageSize);
              }}
              disableRowSelectionOnClick
              loading={loading}
              slots={{
                toolbar: () => (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', padding: '8px' }}>
                    <GridToolbar />
                  </Box>
                ),
                noRowsOverlay: CustomNoRowsOverlay,
              }}
              sx={{
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 max-w-md">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Meeting Details</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Complete information about the selected meeting
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {selectedMeeting && (
              <>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Meeting ID:</div>
                  <div className="col-span-2 dark:text-slate-200">{selectedMeeting.meetingId}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Password:</div>
                  <div className="col-span-2 dark:text-slate-200">{selectedMeeting.password || 'N/A'}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Quantity:</div>
                  <div className="col-span-2 dark:text-slate-200">{selectedMeeting.quantity}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Duration:</div>
                  <div className="col-span-2 dark:text-slate-200">{selectedMeeting.duration} minutes</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Country:</div>
                  <div className="col-span-2 dark:text-slate-200">{countries[selectedMeeting.countryCode] || selectedMeeting.countryCode}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Status:</div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedMeeting.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200'
                      }`}
                    >
                      {selectedMeeting.status.charAt(0).toUpperCase() + selectedMeeting.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Bots:</div>
                  <div className="col-span-2 dark:text-slate-200">
                    {selectedMeeting.bots?.length || selectedMeeting.quantity || 0}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Created At:</div>
                  <div className="col-span-2 dark:text-slate-200">
                    {selectedMeeting.createdAt ? formatDate(selectedMeeting.createdAt) : 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Scheduled Date:</div>
                  <div className="col-span-2 dark:text-slate-200">
                    {selectedMeeting.scheduledDate || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium dark:text-slate-400">Scheduled Time:</div>
                  <div className="col-span-2 dark:text-slate-200">
                    {selectedMeeting.scheduledTime || 'N/A'}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              onClick={() => selectedMeeting && handleRejoin(selectedMeeting)}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Rejoin
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpcomingMeetings;