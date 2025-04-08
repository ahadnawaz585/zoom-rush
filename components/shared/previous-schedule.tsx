import React, { useState, useEffect, useMemo } from 'react';
import { Users, Calendar, RefreshCw, X, MoreHorizontal, Info, UserCircle2 } from "lucide-react";
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

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

interface PreviousScheduleProps {
  onRejoin: (schedule: { meetingId: string; password: string; quantity: number; duration: number; countryCode: string }) => void;
  schedules: Schedule[];
  refreshData: () => void;
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

const PreviousSchedule: React.FC<PreviousScheduleProps> = ({ onRejoin, schedules, refreshData }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(0);

  const [countries, setCountries] = useState<Record<string, string>>({});

  useEffect(() => {
    setCountries({
      'US': 'United States',
      'UK': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'IN': 'India',
    });
  }, []);

  const tableData = useMemo(() => {
    return schedules.map((schedule, index) => ({
      id: schedule.id || `schedule-${index}`,
      meetingId: schedule.meetingId,
      bots: schedule.bots?.length || schedule.quantity || 0,
      duration: `${schedule.duration} mins`,
      country: countries[schedule.countryCode] || schedule.countryCode,
      status: schedule.status,
      date: schedule.createdAt ? formatDate(schedule.createdAt) : 'N/A',
      raw: schedule,
    }));
  }, [schedules, countries]);

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
    refreshData();
  };

  const handleShowInfo = (meeting: Schedule) => {
    setSelectedMeeting(meeting);
    setIsInfoOpen(true);
  };

  const columns: GridColDef[] = [
    { field: 'meetingId', headerName: 'Meeting ID', flex: 1, minWidth: 130 },
    { 
      field: 'bots', 
      headerName: 'Bots',
      width: 80,
      renderCell: (params: GridRenderCellParams) => {
        const schedule = params.row.raw;
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-600 dark:text-gray-300">
                <Users className="h-3 w-3 text-gray-500 dark:text-gray-400 mr-1" />
                {params.value}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-gray-900 border dark:border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Bot List</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[200px] mt-4">
                {schedule.bots?.length ? (
                  schedule.bots.map((bot: { id: React.Key | null | undefined; name: any }) => (
                    <div key={bot.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800">
                      <UserCircle2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{bot.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">No bots available</div>
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
              status === "completed"
                ? "bg-green-100 text-green-800 dark:bg-green-900/80 dark:text-green-200"
                : status === "cancelled"
                ? "bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    { field: 'date', headerName: 'Date', flex: 1, minWidth: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const schedule = params.row.raw;
        return (
          <div className="flex justify-end space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-gray-600 dark:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                handleShowInfo(schedule);
              }}
            >
              <Info className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-gray-600 dark:text-gray-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border dark:border-gray-800">
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer text-xs py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleRejoin(schedule)}
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Rejoin</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer text-xs py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleTerminate(schedule.meetingId)}
                >
                  <X className="h-3 w-3" />
                  <span>Terminate</span>
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
      <Card className="bg-white dark:bg-gray-900 shadow-md border dark:border-gray-800 mt-6">
        <CardHeader className="bg-[#F8F8F8] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-[#232333] dark:text-gray-100 text-sm">
            <Calendar className="h-4 w-4" />
            Previous Schedules
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 text-center text-gray-600 dark:text-gray-300">
          <CircularProgress size={24} className="text-[#0E72ED] dark:text-blue-400" />
          <div className="mt-2">Loading previous schedules...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 shadow-md border dark:border-gray-800 mt-6">
        <CardHeader className="bg-[#F8F8F8] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-[#232333] dark:text-gray-100 text-sm">
            <Calendar className="h-4 w-4" />
            Previous Schedules
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <Box sx={{ 
            width: '100%', 
            maxHeight: 500,
            overflow: 'hidden',
            '& .MuiDataGrid-root': {
              border: 'none',
              backgroundColor: '#ffffff', // white for light mode
              color: '#232333', // text-[#232333]
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#F8F8F8', // bg-[#F8F8F8]
                borderBottom: '1px solid #e5e7eb', // border-gray-200
                color: '#232333',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: '#F8F8F8',
                color: '#232333',
                '& .MuiDataGrid-columnHeaderTitle': {
                  color: '#232333',
                  fontWeight: 'bold',
                },
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #e5e7eb',
                color: '#4b5563', // text-gray-600
              },
              '& .MuiDataGrid-row': {
                '&.odd': {
                  backgroundColor: '#f9fafb', // bg-gray-50
                },
                '&.even': {
                  backgroundColor: '#ffffff',
                },
                '&:hover': {
                  backgroundColor: '#eff6ff', // hover:bg-blue-50
                },
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: '#F8F8F8',
                color: '#232333',
                borderTop: '1px solid #e5e7eb',
              },
              '& .MuiDataGrid-toolbarContainer': {
                backgroundColor: '#F8F8F8',
                color: '#232333',
                padding: '8px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              },
              '& .MuiDataGrid-virtualScroller': {
                overflowY: 'auto',
                maxHeight: '400px',
                backgroundColor: '#ffffff',
              },
              '& .MuiTablePagination-root': {
                color: '#232333',
              },
              '& .MuiIconButton-root': {
                color: '#232333',
                '&.Mui-disabled': {
                  color: 'rgba(35, 35, 51, 0.3)',
                },
              },
              '& .MuiSvgIcon-root': {
                color: '#232333',
              },
              '& .MuiDataGrid-overlay': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#232333',
              },
              // Dark mode styles applied via Tailwind's dark: prefix
              '.dark &': {
                backgroundColor: '#1f2937', // dark:bg-gray-800
                color: '#f3f4f6', // dark:text-gray-100
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#1f2937',
                  borderBottom: '1px solid #4b5563', // dark:border-gray-600
                  color: '#f3f4f6',
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: '#1f2937',
                  color: '#f3f4f6',
                  '& .MuiDataGrid-columnHeaderTitle': {
                    color: '#f3f4f6',
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #4b5563',
                  color: '#d1d5db', // dark:text-gray-300
                },
                '& .MuiDataGrid-row': {
                  '&.odd': {
                    backgroundColor: '#374151', // dark:bg-gray-700
                  },
                  '&.even': {
                    backgroundColor: '#1f2937',
                  },
                  '&:hover': {
                    backgroundColor: '#4b5563', // dark:hover:bg-gray-600
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: '#1f2937',
                  color: '#f3f4f6',
                  borderTop: '1px solid #4b5563',
                },
                '& .MuiDataGrid-toolbarContainer': {
                  backgroundColor: '#1f2937',
                  color: '#f3f4f6',
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: '#1f2937',
                },
                '& .MuiTablePagination-root': {
                  color: '#f3f4f6',
                },
                '& .MuiIconButton-root': {
                  color: '#f3f4f6',
                  '&.Mui-disabled': {
                    color: 'rgba(243, 244, 246, 0.3)',
                  },
                },
                '& .MuiSvgIcon-root': {
                  color: '#f3f4f6',
                },
                '& .MuiDataGrid-overlay': {
                  backgroundColor: 'rgba(31, 41, 55, 0.9)', // dark:bg-gray-800/90
                  color: '#f3f4f6',
                },
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
              sx={{ borderRadius: '8px', overflow: 'hidden' }}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border dark:border-gray-800 text-gray-700 dark:text-gray-300 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Meeting Details</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Complete information about the selected meeting
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {selectedMeeting && (
              <>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium text-gray-600 dark:text-gray-400">Meeting ID:</div>
                  <div className="col-span-2 text-gray-900 dark:text-gray-200">{selectedMeeting.meetingId}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium text-gray-600 dark:text-gray-400">Password:</div>
                  <div className="col-span-2 text-gray-900 dark:text-gray-200">{selectedMeeting.password || 'N/A'}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium text-gray-600 dark:text-gray-400">Quantity:</div>
                  <div className="col-span-2 text-gray-900 dark:text-gray-200">{selectedMeeting.quantity}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium text-gray-600 dark:text-gray-400">Duration:</div>
                  <div className="col-span-2 text-gray-900 dark:text-gray-200">{selectedMeeting.duration} minutes</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium text-gray-600 dark:text-gray-400">Country:</div>
                  <div className="col-span-2 text-gray-900 dark:text-gray-200">{countries[selectedMeeting.countryCode] || selectedMeeting.countryCode}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium text-gray-600 dark:text-gray-400">Status:</div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedMeeting.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/80 dark:text-green-200"
                          : selectedMeeting.status === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200"
                      }`}
                    >
                      {selectedMeeting.status.charAt(0).toUpperCase() + selectedMeeting.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium text-gray-600 dark:text-gray-400">Bots:</div>
                  <div className="col-span-2 text-gray-900 dark:text-gray-200">
                    {selectedMeeting.bots?.length || selectedMeeting.quantity || 0}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium text-gray-600 dark:text-gray-400">Created At:</div>
                  <div className="col-span-2 text-gray-900 dark:text-gray-200">
                    {selectedMeeting.createdAt ? formatDate(selectedMeeting.createdAt) : 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium text-gray-600 dark:text-gray-400">Scheduled Date:</div>
                  <div className="col-span-2 text-gray-900 dark:text-gray-200">
                    {selectedMeeting.scheduledDate || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium text-gray-600 dark:text-gray-400">Scheduled Time:</div>
                  <div className="col-span-2 text-gray-900 dark:text-gray-200">
                    {selectedMeeting.scheduledTime || 'N/A'}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => selectedMeeting && handleRejoin(selectedMeeting)}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Rejoin
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
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