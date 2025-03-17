// components/BotList.js
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { ScrollArea } from "@/components/ui/scroll-area";
  
  interface BotListProps {
    bots: { id: number; name: string; status: string }[];
  }
  
  export default function BotList({ bots }: BotListProps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generated Bots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background">Name</TableHead>
                    <TableHead className="sticky top-0 bg-background">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bots.map((bot, index) => (
                    <TableRow key={index}>
                      <TableCell>{bot.name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bot.status === "Connected"
                              ? "bg-green-100 text-green-800"
                              : bot.status === "Error"
                              ? "bg-red-100 text-red-800"
                              : bot.status === "Joining"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {bot.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bots.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No bots generated yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    );
  }