"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Video, Users, Globe, Clock, Calendar, Play } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useState } from "react";
import { toast } from "sonner";
import { runMultipleBots } from "@/lib/zoom-automation";

const formSchema = z.object({
  meetingId: z
    .string()
    .min(9, "Meeting ID must be at least 9 characters")
    .max(11, "Meeting ID must not exceed 11 characters"),
  password: z.string().min(1, "Password is required"),
  quantity: z.coerce
    .number()
    .min(1, "Quantity must be between 1 and 200")
    .max(200, "Quantity must be between 1 and 200"),
  duration: z.coerce
    .number()
    .min(1, "Duration must be between 1 and 120 minutes")
    .max(120, "Duration must be between 1 and 120 minutes"),
  country: z.string().min(1, "Please select a country"),
});

const countries = {
  // North America
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
  
  // South America
  BR: "Brazil",
  AR: "Argentina",
  CO: "Colombia",
  
  // Europe
  UK: "United Kingdom",
  FR: "France",
  DE: "Germany",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  SE: "Sweden",
  
  // Asia
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  IN: "India",
  PK: "Pakistan",
  BD: "Bangladesh",
  ID: "Indonesia",
  MY: "Malaysia",
  SG: "Singapore",
  TH: "Thailand",
  VN: "Vietnam",
  PH: "Philippines",
  
  // Middle East
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  TR: "Turkey",
  
  // Oceania
  AU: "Australia",
  NZ: "New Zealand",
  
  // Africa
  ZA: "South Africa",
  NG: "Nigeria",
  EG: "Egypt",
};

const generateBotName = (country: string) => {
  const firstNames = {
    US: ["John", "Mary", "James", "Sarah", "Michael", "Elizabeth"],
    UK: ["Oliver", "Emma", "Harry", "Sophie", "William", "Charlotte"],
    CA: ["Liam", "Olivia", "Noah", "Emma", "Lucas", "Sophia"],
    FR: ["Lucas", "Emma", "Gabriel", "Léa", "Louis", "Chloé"],
    DE: ["Paul", "Marie", "Felix", "Sophie", "Max", "Anna"],
    IT: ["Leonardo", "Sofia", "Francesco", "Aurora", "Alessandro", "Giulia"],
    ES: ["Hugo", "Lucia", "Martin", "Sofia", "Pablo", "Maria"],
    JP: ["Haruto", "Yui", "Yuto", "Aoi", "Sota", "Akari"],
    CN: ["Wei", "Xia", "Ming", "Hui", "Li", "Yan"],
    IN: ["Arjun", "Priya", "Arun", "Divya", "Raj", "Anjali"],
    PK: ["Ali", "Fatima", "Hassan", "Ayesha", "Ahmed", "Zara"],
    BD: ["Rahman", "Aisha", "Kamal", "Nadia", "Hasan", "Mim"],
    ID: ["Budi", "Siti", "Dian", "Putri", "Adi", "Maya"],
    MY: ["Ahmad", "Nurul", "Ibrahim", "Siti", "Mohammed", "Fatimah"],
    SG: ["Wei Ming", "Hui Ling", "Jun Jie", "Li Mei", "Zhi Wei", "Xiu Ying"],
    TH: ["Somchai", "Malee", "Chai", "Siri", "Pitch", "Nim"],
    VN: ["Minh", "Linh", "Duc", "Mai", "Tuan", "Hoa"],
    PH: ["Juan", "Maria", "Jose", "Rosa", "Miguel", "Clara"],
    BR: ["Pedro", "Ana", "João", "Maria", "Lucas", "Julia"],
    AR: ["Santiago", "Sofia", "Mateo", "Isabella", "Benjamin", "Valentina"],
    AU: ["Jack", "Charlotte", "William", "Olivia", "Noah", "Ava"],
    DEFAULT: ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey"],
  };

  const lastNames = {
    US: ["Smith", "Johnson", "Brown", "Davis", "Wilson", "Anderson"],
    UK: ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies"],
    CA: ["Smith", "Brown", "Tremblay", "Martin", "Roy", "Wilson"],
    FR: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard"],
    DE: ["Mueller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer"],
    IT: ["Rossi", "Ferrari", "Russo", "Romano", "Colombo", "Ricci"],
    ES: ["Garcia", "Rodriguez", "Martinez", "Lopez", "Sanchez", "Gonzalez"],
    JP: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Yamamoto"],
    CN: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang"],
    IN: ["Kumar", "Singh", "Sharma", "Patel", "Verma", "Gupta"],
    PK: ["Khan", "Ahmed", "Ali", "Malik", "Qureshi", "Syed"],
    BD: ["Islam", "Rahman", "Hossain", "Ahmed", "Akter", "Begum"],
    ID: ["Wijaya", "Suharto", "Sukarno", "Kusuma", "Santoso", "Hidayat"],
    MY: ["Tan", "Lee", "Wong", "Abdullah", "Kumar", "Singh"],
    SG: ["Tan", "Lim", "Lee", "Ng", "Wong", "Chan"],
    TH: ["Saetang", "Srisuk", "Chaiyasit", "Somboon", "Ratanakul", "Chaisuwan"],
    VN: ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Phan"],
    PH: ["Santos", "Reyes", "Cruz", "Garcia", "Torres", "Lim"],
    BR: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira"],
    AR: ["Gonzalez", "Rodriguez", "Fernandez", "Lopez", "Martinez", "Garcia"],
    AU: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor"],
    DEFAULT: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia"],
  };

  const countryFirstNames = firstNames[country as keyof typeof firstNames] || firstNames.DEFAULT;
  const countryLastNames = lastNames[country as keyof typeof lastNames] || lastNames.DEFAULT;

  const randomFirst = countryFirstNames[Math.floor(Math.random() * countryFirstNames.length)];
  const randomLast = countryLastNames[Math.floor(Math.random() * countryLastNames.length)];

  return `${randomFirst} ${randomLast}`;
};

const previousSchedules = [
  {
    id: 1,
    meetingId: "123456789",
    bots: 5,
    duration: 30,
    country: "US",
    status: "Completed",
    date: "2024-03-20",
  },
  {
    id: 2,
    meetingId: "987654321",
    bots: 10,
    duration: 60,
    country: "UK",
    status: "Scheduled",
    date: "2024-03-25",
  },
  {
    id: 3,
    meetingId: "456789123",
    bots: 3,
    duration: 45,
    country: "CA",
    status: "Failed",
    date: "2024-03-18",
  },
];

export default function Home() {
  const [generatedBots, setGeneratedBots] = useState<{ id: number; name: string; status: string }[]>([]);
  const [isJoining, setIsJoining] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingId: "",
      password: "",
      quantity: "1",
      duration: "5",
      country: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const bots = Array.from({ length: parseInt(values.quantity) }, (_, i) => ({
      id: i + 1,
      name: generateBotName(values.country),
      status: "Ready",
    }));
    setGeneratedBots(bots);
    toast.success("Bots generated successfully", {
      description: `Generated ${values.quantity} bots for the meeting`,
    });
  }

  async function joinMeeting() {
    if (generatedBots.length === 0) {
      toast.error("No bots generated");
      return;
    }
  
    const values = form.getValues();
    setIsJoining(true);
  
    try {
      const response = await fetch('/api/zoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId: values.meetingId,
          password: values.password,
          quantity: parseInt(values.quantity),
          duration: parseInt(values.duration) * 60, // Convert to seconds
          botNames: generatedBots.map(bot => bot.name), // Send bot names
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        toast.success("Bots are joining the meeting", {
          description: `${values.quantity} bots are connecting to the meeting`,
        });
  
        if (data.initialStatuses && data.initialStatuses.length > 0) {
          setGeneratedBots(prevBots =>
            prevBots.map(bot => {
              const updatedStatus = data.initialStatuses.find((s: any) => s.id === bot.id);
              return updatedStatus ? { ...bot, status: updatedStatus.status } : bot;
            })
          );
        }
  
        simulateStatusUpdates(parseInt(values.quantity));
      } else {
        toast.error("Failed to join meeting", {
          description: data.message || "An error occurred while joining the meeting",
        });
      }
    } catch (error) {
      toast.error("Failed to join meeting", {
        description: "An error occurred while connecting to the server",
      });
    } finally {
      setIsJoining(false);
    }
  }
  
  // Function to simulate status updates (temporary solution until WebSockets are implemented)
  function simulateStatusUpdates(botCount: number) {
    const statuses = ['Initializing', 'Joining', 'Connected'];
    let currentStatusIndex = 0;
    
    const interval = setInterval(() => {
      if (currentStatusIndex >= statuses.length) {
        clearInterval(interval);
        return;
      }
      
      const currentStatus = statuses[currentStatusIndex];
      
      setGeneratedBots(prevBots => 
        prevBots.map(bot => ({ ...bot, status: currentStatus }))
      );
      
      currentStatusIndex++;
    }, 5000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Video className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Zoom Meeting Bot Manager
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>New Meeting Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="meetingId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter meeting ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Quantity</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Duration</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="120" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>Country</span>
                            </div>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              {Object.entries(countries).map(([code, name]) => (
                                <SelectItem key={code} value={code}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Generate Bots
                    </Button>
                    <Button
                      type="button"
                      onClick={joinMeeting}
                      disabled={isJoining || generatedBots.length === 0}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Join Meeting
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

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
                      {generatedBots.map((bot, index) => (
                        <TableRow key={index}>
                          <TableCell>{bot.name}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              bot.status === 'Connected' ? 'bg-green-100 text-green-800' :
                              bot.status === 'Error' ? 'bg-red-100 text-red-800' :
                              bot.status === 'Joining' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {bot.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {generatedBots.length === 0 && (
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
        </div>

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
      </div>
    </div>
  );
}