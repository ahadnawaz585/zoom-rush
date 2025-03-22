import React from 'react'
import { Video, Users, Globe, Clock, Calendar, Play, RefreshCw, X, MoreHorizontal } from "lucide-react";
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
import { countries, previousSchedules } from '@/app/data/constants';

const PreviousSchedule = () => {
  // Functions to handle rejoin and terminate actions
  const handleRejoin = (meetingId: string) => {
    console.log(`Rejoining meeting: ${meetingId}`);
    // Add your rejoin logic here
  };

  const handleTerminate = (meetingId: string) => {
    console.log(`Terminating meeting: ${meetingId}`);
    // Add your terminate logic here
  };

  return (
    <>
      <Card className="mt-6 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Calendar className="h-5 w-5" />
              Previous Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border dark:border-slate-600">
              <Table>
                <TableHeader className="dark:bg-slate-900">
                  <TableRow className="dark:border-slate-700">
                    <TableHead className="dark:text-slate-300">Meeting ID</TableHead>
                    <TableHead className="dark:text-slate-300">Bots</TableHead>
                    <TableHead className="dark:text-slate-300">Duration</TableHead>
                    <TableHead className="dark:text-slate-300">Country</TableHead>
                    <TableHead className="dark:text-slate-300">Status</TableHead>
                    <TableHead className="dark:text-slate-300">Date</TableHead>
                    <TableHead className="dark:text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previousSchedules.map((schedule:any) => (
                    <TableRow key={schedule.id} className="dark:border-slate-700 dark:hover:bg-slate-800/50">
                      <TableCell className="dark:text-slate-300 ">{schedule.meetingId}</TableCell>
                      <TableCell className="dark:text-slate-300 ">{schedule.bots}</TableCell>
                      <TableCell className="dark:text-slate-300 ">{schedule.duration} mins</TableCell>
                      <TableCell className="dark:text-slate-300 ">{countries[schedule.country as keyof typeof countries]}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            schedule.status === "Completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : schedule.status === "Failed"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {schedule.status}
                        </span>
                      </TableCell>
                      <TableCell className="dark:text-slate-300">{schedule.date}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 dark:text-slate-300 dark:hover:bg-slate-700">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                            <DropdownMenuItem 
                              className="flex items-center gap-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700 cursor-pointer"
                              onClick={() => handleRejoin(schedule.meetingId)}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              <span>Rejoin</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700 cursor-pointer text-red-600 dark:text-red-400"
                              onClick={() => handleTerminate(schedule.meetingId)}
                            >
                              <X className="h-3.5 w-3.5" />
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
          </CardContent>
        </Card>
    </>
  )
}

export default PreviousSchedule