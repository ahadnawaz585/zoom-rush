// components/shared/bot-list.tsx
import { useEffect, useState } from "react";
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
import Image from "next/image";

interface Bot {
  id: number;
  name: string;
  status: string;
  country?: string;
  countryCode?: string;
  flag?: string;
}

interface BotListProps {
  bots: Bot[];
}

export default function BotList({ bots }: BotListProps) {
  const [enhancedBots, setEnhancedBots] = useState<Bot[]>(bots);

  useEffect(() => {
    // Update the local state when prop changes
    setEnhancedBots(bots);
  }, [bots]);

  // Status badge style function
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Connected":
        return "bg-green-100 text-green-800";
      case "Error":
        return "bg-red-100 text-red-800";
      case "Joining":
        return "bg-blue-100 text-blue-800";
      case "Initializing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
                  <TableHead className="sticky top-0 bg-background">Country</TableHead>
                  <TableHead className="sticky top-0 bg-background">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enhancedBots.map((bot) => (
                  <TableRow key={bot.id}>
                    <TableCell>{bot.name}</TableCell>
                    <TableCell>
                      {bot.countryCode && (
                        <div className="flex items-center gap-2">
                          {bot.flag && (
                            <div className="relative w-6 h-4">
                              <Image 
                                src={bot.flag || `/api/placeholder/24/16`} 
                                alt={bot.country || ''}
                                width={24}
                                height={16}
                                className="object-cover rounded"
                              />
                            </div>
                          )}
                          <span>{bot.country || bot.countryCode}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                          bot.status
                        )}`}
                      >
                        {bot.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {enhancedBots.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
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