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
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";


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
  const [enhancedBots, setEnhancedBots] = useState<Bot[]>([]);
  const [editingBotId, setEditingBotId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    // Only process bots if there are 200 or fewer
    if (bots && bots.length > 0 && bots.length <= 200) {
      const uniqueBots = generateUniqueBotNames(bots);
      setEnhancedBots(uniqueBots);
    } else {
      // Clear the enhanced bots if there are no bots or too many
      setEnhancedBots([]);
    }
  }, [bots]);

  // Generate unique names for bot list
  const generateUniqueBotNames = (botList: Bot[]): Bot[] => {
    // Enforce maximum of 200 bots
    if (botList.length > 200) {
      return [];
    }
    
    // Create a set to track used names
    const usedNames = new Set<string>();
    
    return botList.map(bot => {
      let baseName = bot.name;
      let uniqueName = baseName;
      let counter = 1;
      
      // Keep trying new names until we find a unique one
      while (usedNames.has(uniqueName)) {
        uniqueName = `${baseName}-${counter}`;
        counter++;
      }
      
      // Add the unique name to the set
      usedNames.add(uniqueName);
      
      // Return bot with unique name
      return { ...bot, name: uniqueName };
    });
  };

  // Check if a name already exists in the bot list (excluding the current bot)
  const isNameDuplicate = (name: string, currentBotId: number): boolean => {
    return enhancedBots.some(bot => bot.name === name && bot.id !== currentBotId);
  };

  // Start editing a bot name
  const startEditing = (bot: Bot) => {
    setEditingBotId(bot.id);
    setEditedName(bot.name);
    setNameError(null);
  };

  // Save edited bot name
  const saveEditedName = () => {
    if (editingBotId === null) return;
    
    const trimmedName = editedName.trim();
    
    // Validate name isn't empty
    if (!trimmedName) {
      setNameError("Name cannot be empty");
      return;
    }
    
    // Check for duplicates
    if (isNameDuplicate(trimmedName, editingBotId)) {
      setNameError("This name is already in use");
      return;
    }
    
    // Update the bot name
    const updatedBots = enhancedBots.map(bot => 
      bot.id === editingBotId ? { ...bot, name: trimmedName } : bot
    );
    
    setEnhancedBots(updatedBots);
    setEditingBotId(null);
    setNameError(null);
    
    // Show success toast
    toast({
      title: "Success",
      description: "Bot name updated successfully",
      variant: "default"
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingBotId(null);
    setNameError(null);
  };

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

  // Determine if we have bots to display
  const hasBots = enhancedBots.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Bots</CardTitle>
      </CardHeader>
      <CardContent>
        {hasBots ? (
          <div className="rounded-md border">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background">Name</TableHead>
                    <TableHead className="sticky top-0 bg-background">Country</TableHead>
                    <TableHead className="sticky top-0 bg-background">Status</TableHead>
                    <TableHead className="sticky top-0 bg-background">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enhancedBots.map((bot) => (
                    <TableRow key={bot.id}>
                      <TableCell>
                        {editingBotId === bot.id ? (
                          <div className="space-y-1">
                            <Input
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="w-full max-w-[200px]"
                              autoFocus
                            />
                            {nameError && (
                              <p className="text-xs text-red-500">{nameError}</p>
                            )}
                          </div>
                        ) : (
                          bot.name
                        )}
                      </TableCell>
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
                      <TableCell>
                        {editingBotId === bot.id ? (
                          <div className="flex space-x-1">
                            <Button 
                              onClick={saveEditedName} 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button 
                              onClick={cancelEditing} 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => startEditing(bot)} 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
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
          <div className="text-center py-8 text-muted-foreground border rounded-md">
            <p>No bots generated yet</p>
            <p className="text-sm mt-2">Click the "Generate Bots" button to create bots</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}