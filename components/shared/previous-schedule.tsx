import React from 'react'
import { Video, Users, Globe, Clock, Calendar, Play } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { countries, previousSchedules } from '@/app/data/constants';



const PreviousSchedule = () => {
  return (
    <>
      <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Previous Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meeting ID</TableHead>
                    <TableHead>Bots</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previousSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>{schedule.meetingId}</TableCell>
                      <TableCell>{schedule.bots}</TableCell>
                      <TableCell>{schedule.duration} mins</TableCell>
                      <TableCell>{countries[schedule.country as keyof typeof countries]}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            schedule.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : schedule.status === "Failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {schedule.status}
                        </span>
                      </TableCell>
                      <TableCell>{schedule.date}</TableCell>
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