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
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, UserCircle2, Loader2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

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
  loading: boolean;
}

export default function BotList({ bots, loading }: BotListProps) {
  const [enhancedBots, setEnhancedBots] = useState<Bot[]>([]);
  const [editingBotId, setEditingBotId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Enhanced generateUniqueBotNames function that properly handles imported names
  const generateUniqueBotNames = (botList: Bot[]): Bot[] => {
    if (botList.length > 200) return [];
    
    const usedNames = new Set<string>();
    const processedBots = botList.map(bot => {
      // If the bot already has a name (from Excel import), use it as base
      let baseName = bot.name || `Bot ${bot.id}`;
      let uniqueName = baseName;
      let counter = 1;
      
      // If the name is already used, append a number until we find a unique name
      while (usedNames.has(uniqueName.toLowerCase())) {
        uniqueName = `${baseName} ${counter}`;
        counter++;
      }
      
      // Add the unique name to our set (in lowercase for case-insensitive comparison)
      usedNames.add(uniqueName.toLowerCase());
      
      // Return the bot with its unique name
      return {
        ...bot,
        name: uniqueName,
        status: bot.status || "Ready",
        id: bot.id || Math.random() * 1000000
      };
    });
    
    return processedBots;
  };

  useEffect(() => {
    if (bots && bots.length > 0 && bots.length <= 200) {
      const uniqueBots = generateUniqueBotNames(bots);
      setEnhancedBots(uniqueBots);
    } else {
      setEnhancedBots([]);
    }
  }, [bots]);

  const isNameDuplicate = (name: string, currentBotId: number): boolean => {
    return enhancedBots.some(bot => 
      bot.name.toLowerCase() === name.toLowerCase() && bot.id !== currentBotId
    );
  };

  const startEditing = (bot: Bot) => {
    setEditingBotId(bot.id);
    setEditedName(bot.name);
    setNameError(null);
  };

  const saveEditedName = () => {
    if (editingBotId === null) return;
    const trimmedName = editedName.trim();
    if (!trimmedName) {
      setNameError("Name cannot be empty");
      return;
    }
    if (isNameDuplicate(trimmedName, editingBotId)) {
      setNameError("This name is already in use");
      return;
    }
    const updatedBots = enhancedBots.map(bot =>
      bot.id === editingBotId ? { ...bot, name: trimmedName } : bot
    );
    setEnhancedBots(updatedBots);
    setEditingBotId(null);
    setNameError(null);
    toast({
      title: "Success",
      description: "Bot name updated successfully",
      variant: "default"
    });
  };

  const cancelEditing = () => {
    setEditingBotId(null);
    setNameError(null);
  };

  const exportToExcel = () => {
    if (enhancedBots.length === 0) {
      toast({
        title: "Error",
        description: "No bots to export",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const exportData = enhancedBots.map(bot => ({
        name: bot.name,
        country: bot.country || '',
        countryCode: bot.countryCode || '',
        status: bot.status
      }));
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bots");
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `bots_${dateStr}_${timeStr}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "Success",
        description: `${enhancedBots.length} bots exported to ${fileName}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Error",
        description: "Failed to export bots to Excel",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Connected":
        return "dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800 bg-blue-50 text-blue-700 border border-blue-200";
      case "Error":
        return "dark:bg-red-900 dark:text-red-200 dark:border-red-800 bg-red-50 text-red-700 border border-red-200";
      case "Joining":
        return "dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-800 bg-indigo-50 text-indigo-700 border border-indigo-200";
      case "Initializing":
        return "dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800 bg-amber-50 text-amber-700 border border-amber-200";
      case "Ready":
        return "dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 bg-gray-50 text-gray-700 border border-gray-200";
      default:
        return "dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const hasBots = enhancedBots.length > 0;

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-500 dark:text-gray-400">
      <div className="mb-4">
        <Loader2 className="h-12 w-12 text-blue-500 dark:text-blue-400 animate-spin" />
      </div>
      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Generating Bots</p>
      <p className="text-sm mt-1.5 text-gray-500 dark:text-gray-400">
        Please wait while we create your bots...
      </p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-500 dark:text-gray-400">
      <UserCircle2 className="h-12 w-12 text-blue-200 dark:text-blue-800 mb-3" />
      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No bots generated yet</p>
      <p className="text-sm mt-1.5 text-gray-500 dark:text-gray-400">
        Click the &quot;Generate Bots&quot; button to create bots
      </p>
    </div>
  );

  return (
    <Card className="h-[400px] flex flex-col bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
      <CardHeader className="bg-[#F8F8F8] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-800 dark:text-gray-100 text-lg font-semibold flex items-center">
            <UserCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            Generated Bots
          </CardTitle>
          {hasBots && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={exportToExcel}
              disabled={isDownloading || loading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export to Excel
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {loading ? (
          renderLoadingState()
        ) : hasBots ? (
          <div className="h-full rounded-b-lg overflow-hidden">
            <ScrollArea className="h-[320px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 dark:border-gray-700">
                    <TableHead className="sticky top-0 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-medium py-3">Name</TableHead>
                    <TableHead className="sticky top-0 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-medium py-3">Country</TableHead>
                    <TableHead className="sticky top-0 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-medium py-3">Status</TableHead>
                    <TableHead className="sticky top-0 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-medium py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enhancedBots.map((bot) => (
                    <TableRow key={bot.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <TableCell className="text-gray-800 dark:text-gray-200 py-0.5">
                        {editingBotId === bot.id ? (
                          <div className="space-y-1">
                            <Input
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="w-full max-w-[200px] p-1 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                              autoFocus
                            />
                            {nameError && (
                              <p className="text-xs text-red-600 dark:text-red-400">{nameError}</p>
                            )}
                          </div>
                        ) : (
                          bot.name
                        )}
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200 py-1">
                        {bot.countryCode && (
                          <div className="flex items-center gap-2">
                            {bot.flag && (
                              <div className="relative w-5 h-3.5">
                                <Image
                                  src={bot.flag}
                                  alt={bot.country || ''}
                                  width={20}
                                  height={14}
                                  className="object-cover rounded"
                                />
                              </div>
                            )}
                            <span>{bot.country || bot.countryCode}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(bot.status)}`}>
                          {bot.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-1">
                        {editingBotId === bot.id ? (
                          <div className="flex space-x-1">
                            <Button
                              onClick={saveEditedName}
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            >
                              <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </Button>
                            <Button
                              onClick={cancelEditing}
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 border-gray-200 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => startEditing(bot)}
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          >
                            <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        ) : (
          renderEmptyState()
        )}
      </CardContent>
    </Card>
  );
}