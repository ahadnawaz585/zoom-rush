import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Users, Globe, Clock, Play, Loader2, Download, Upload, X, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Country } from "@/app/services/countryApi";
import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// Update form schema to include scheduling fields
const formSchema = z.object({
  meetingId: z
    .string()
    .min(9, "Meeting ID must be at least 9 characters")
    .max(11, "Meeting ID must not exceed 11 characters"),
  password: z
    .string()
    .min(1, "Password is required"),
  quantity: z
    .number()
    .min(1, "Quantity must be between 1 and 200")
    .max(200, "Quantity must be between 1 and 200")
    .default(5),
  duration: z
    .number()
    .min(1, "Duration must be between 1 and 120 minutes")
    .max(120, "Duration must be between 1 and 120 minutes")
    .default(30),
  countryCode: z
    .string()
    .min(1, "Please select a country"),
  isScheduled: z
    .boolean()
    .default(false),
  scheduledDate: z
    .string()
    .optional(),
  scheduledTime: z
    .string()
    .optional(),
});

interface MeetingFormProps {
  onBotsGenerated: (quantity: number, countryCode: string, importedBots?: Array<{name: string, countryCode: string, country?: string}>) => void;
  onJoinMeeting: (values: z.infer<typeof formSchema>) => void;
  onScheduleMeeting?: (values: z.infer<typeof formSchema>) => void;
  onFormChange?: (values: Partial<z.infer<typeof formSchema>>) => void;
  formValues?: Partial<z.infer<typeof formSchema>>;
  isJoining: boolean;
  isLoading?: boolean;
  hasGeneratedBots: boolean;
  countries: Country[];
}

export default function MeetingForm({
  onBotsGenerated,
  onJoinMeeting,
  onScheduleMeeting,
  onFormChange,
  formValues,
  isJoining,
  isLoading = false,
  hasGeneratedBots,
  countries
}: MeetingFormProps) {
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [internalQuantity, setInternalQuantity] = useState<string>("5");
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [countryChanged, setCountryChanged] = useState<boolean>(false);
  const [isImportMode, setIsImportMode] = useState<boolean>(false);
  const [importedBots, setImportedBots] = useState<Array<{name: string, countryCode: string, country?: string}> | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingId: formValues?.meetingId || "",
      password: formValues?.password || "",
      quantity: formValues?.quantity || 5,
      duration: formValues?.duration || 30,
      countryCode: formValues?.countryCode || "US",
      isScheduled: false,
      scheduledDate: "",
      scheduledTime: "",
    },
    mode: "onChange"
  });

  

  useEffect(() => {
    if (formValues?.quantity) {
      setInternalQuantity(formValues.quantity.toString());
      validateQuantity(formValues.quantity);
    }
  }, [formValues?.quantity]);

  const validateQuantity = (value: number | string): boolean => {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    
    if (isNaN(numValue)) {
      setQuantityError("Please enter a valid number");
      setIsFormValid(false);
      return false;
    } else if (numValue > 200) {
      setQuantityError("Cannot generate more than 200 bots");
      setIsFormValid(false);
      return false;
    } else if (numValue < 1) {
      setQuantityError("Quantity must be at least 1");
      setIsFormValid(false);
      return false;
    } else {
      setQuantityError(null);
      setIsFormValid(true);
      return true;
    }
  };

  useEffect(() => {
    if (formValues) {
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof z.infer<typeof formSchema>, value);
        }
      });
    }
  }, [formValues, form]);

 

  const handleCountryChange = (code: string) => {
    form.setValue("countryCode", code);
    setCountryChanged(true);
    if (onFormChange) {
      onFormChange({ countryCode: code });
    }
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/^0+/, '') || '';
    setInternalQuantity(rawValue);
    
    const quantity = rawValue === '' ? 0 : parseInt(rawValue, 10);
    
    validateQuantity(quantity);
    form.setValue("quantity", quantity);
    
    if (onFormChange) {
      onFormChange({ quantity });
    }
  };

  const downloadTemplateFile = () => {
    try {
      // Create sample data for the template using the data from the image
      const sampleData = [
        { name: "RAHUL", country: "India", countryCode: "IN" },
        { name: "AMIT", country: "India", countryCode: "IN" },
        { name: "VIKRAM", country: "India", countryCode: "IN" },
        { name: "ARJUN", country: "India", countryCode: "IN" },
        { name: "ROHIT", country: "India", countryCode: "IN" }
      ];
      
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(sampleData);
      
      // Add column descriptions in the first row
      XLSX.utils.sheet_add_aoa(ws, [
        ["Bot Name (Required)", "Country Name (Optional)", "Country Code (Required)"]
      ], { origin: "A1" });
      
      // Adjust column widths
      const wscols = [
        { wch: 20 }, // Bot Name
        { wch: 25 }, // Country Name
        { wch: 15 }  // Country Code
      ];
      ws['!cols'] = wscols;
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bot Template");
      
      // Generate filename
      const fileName = "botsname.xlsx";
      
      // Save file
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "Success",
        description: `Template downloaded as ${fileName}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Error",
        description: "Failed to download template file",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with more flexible parsing
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,  // Treat first row as headers
          blankrows: false  // Skip blank rows
        }) as any[];
        
        // Remove header row
        const headers = jsonData.shift();
        
        // Custom mapping to ensure consistent data structure
        const mappedData = jsonData.map(row => ({
          name: row[0],  // Assuming first column is name
          countryCode: row[2] || row[1],  // Country code can be in 2nd or 3rd column
          country: row[1] || ''  // Optional country name
        })).filter(row => row.name && row.countryCode);
        
        // Validate data
        if (mappedData.length === 0) {
          throw new Error("No valid data found in the Excel file");
        }
        
        if (mappedData.length > 200) {
          throw new Error(`File contains ${mappedData.length} bots, but maximum allowed is 200`);
        }
        
        // Normalize country codes to uppercase
        mappedData.forEach(row => {
          row.countryCode = row.countryCode.toString().toUpperCase();
        });
        
        // Set imported data
        setImportedBots(mappedData);
        setIsImportMode(true);
        setInternalQuantity(mappedData.length.toString());
        form.setValue("quantity", mappedData.length);
        
        toast({
          title: "Success",
          description: `Loaded ${mappedData.length} bots from Excel file`,
          variant: "default"
        });
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to parse Excel file",
          variant: "destructive"
        });
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  const cancelImport = () => {
    setIsImportMode(false);
    setImportedBots(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    form.trigger().then(isValid => {
      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fix the errors in the form",
          variant: "destructive"
        });
        return;
      }
      
      const values = form.getValues();

      if (isScheduleMode) {
        // Handle scheduled meeting
        if (!values.scheduledDate || !values.scheduledTime) {
          toast({
            title: "Validation Error",
            description: "Please select both date and time for scheduling",
            variant: "destructive"
          });
          return;
        }

        const scheduledDateTime = new Date(`${values.scheduledDate}T${values.scheduledTime}`);
        if (scheduledDateTime < new Date()) {
          toast({
            title: "Invalid Schedule",
            description: "Please select a future date and time",
            variant: "destructive"
          });
          return;
        }

        if (onScheduleMeeting) {
          onScheduleMeeting({
            ...values,
            isScheduled: true
          });
        }
        return;
      }
      
      // Handle immediate meeting
      if (isImportMode && importedBots) {
        // Import mode - use imported bots
        if (importedBots.length > 200) {
          toast({
            title: "Error",
            description: "Cannot import more than 200 bots. Please reduce the quantity in your Excel file.",
            variant: "destructive"
          });
          return;
        }
        
        setIsImporting(true);
        
        setTimeout(() => {
          onBotsGenerated(importedBots.length, "", importedBots);
          setIsImporting(false);
        }, 500);
      } else {
        // Normal generation mode
        if (!validateQuantity(values.quantity)) {
          toast({
            title: "Error",
            description: "Cannot generate more than 200 bots. Please reduce the quantity.",
            variant: "destructive"
          });
          return;
        }
        
        setIsGenerating(true);
        
        setTimeout(() => {
          onBotsGenerated(values.quantity, values.countryCode);
          setIsGenerating(false);
          setCountryChanged(false);
        }, countryChanged ? 1000 : 300);
      }
    });
  };

  
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-md flex flex-col h-full border dark:border-gray-800">
      <CardHeader className="bg-[#F8F8F8] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="text-[#232333] dark:text-gray-100 text-lg font-medium mb-2 sm:mb-0">Meeting Configuration</CardTitle>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant={isScheduleMode ? "default" : "outline"}
              className="h-8 text-xs flex-1 sm:flex-none"
              onClick={() => setIsScheduleMode(!isScheduleMode)}
            >
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {isScheduleMode ? "Cancel Schedule" : "Schedule"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 text-xs border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-1 sm:flex-none"
              onClick={downloadTemplateFile}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Template
            </Button>
            <label className="cursor-pointer flex-1 sm:flex-none">
              <Button
                type="button"
                variant="outline"
                className="h-8 text-xs border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                Import Excel
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6 flex-grow overflow-y-auto">
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col">
            <div className="space-y-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="meetingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#747487] dark:text-gray-300 font-medium text-sm">Meeting ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter Zoom meeting ID" 
                          className="border-gray-300 dark:border-gray-700 focus:border-[#0E72ED] focus:ring-[#0E72ED] h-10 bg-white dark:bg-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 active:bg-white dark:active:bg-gray-800"
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            if (onFormChange) {
                              onFormChange({ meetingId: e.target.value });
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#747487] dark:text-gray-300 font-medium text-sm">Meeting Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter meeting password"
                          className="border-gray-300 dark:border-gray-700 focus:border-[#0E72ED] focus:ring-[#0E72ED] h-10 dark:bg-gray-800 dark:text-gray-100"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (onFormChange) {
                              onFormChange({ password: e.target.value });
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field: { onChange, onBlur, name, ref } }) => (
                    <FormItem>
                      <FormLabel className="text-[#747487] dark:text-gray-300 font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#0E72ED] dark:text-blue-400" />
                          <span>Number of Bots</span>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          name={name}
                          ref={ref}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={internalQuantity}
                          onChange={handleQuantityChange}
                          className={`border-gray-300 dark:border-gray-700 focus:border-[#0E72ED] focus:ring-[#0E72ED] h-10 dark:bg-gray-800 dark:text-gray-100 ${quantityError ? "border-red-500 dark:border-red-400" : ""}`}
                          onBlur={(e) => {
                            if (e.target.value === '') {
                              setInternalQuantity("1");
                              form.setValue("quantity", 1);
                              validateQuantity(1);
                              if (onFormChange) {
                                onFormChange({ quantity: 1 });
                              }
                            }
                            onBlur();
                          }}
                          disabled={isImportMode}
                        />
                      </FormControl>
                      {quantityError && (
                        <p className="text-xs font-medium text-red-500 dark:text-red-400">{quantityError}</p>
                      )}
                      {isImportMode && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Using {importedBots?.length || 0} bots from imported file
                        </p>
                      )}
                      <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#747487] dark:text-gray-300 font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#0E72ED] dark:text-blue-400" />
                          <span>Duration (minutes)</span>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="120"
                          className="border-gray-300 dark:border-gray-700 focus:border-[#0E72ED] focus:ring-[#0E72ED] h-10 dark:bg-gray-800 dark:text-gray-100"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value.replace(/^0+/, ''), 10) || 0;
                            field.onChange(value);
                            if (onFormChange) {
                              onFormChange({ duration: value });
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#747487] dark:text-gray-300 font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-[#0E72ED] dark:text-blue-400" />
                          <span>Bot Country</span>
                        </div>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleCountryChange(value);
                        }}
                        value={field.value}
                        disabled={isLoading || isGenerating || isImportMode}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300 dark:border-gray-700 focus:border-[#0E72ED] focus:ring-[#0E72ED] h-10 dark:bg-gray-800 dark:text-gray-100">
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 dark:bg-gray-800 dark:border-gray-700">
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code} className="dark:text-gray-100 dark:focus:bg-gray-700 dark:data-[state=checked]:bg-blue-900">
                              {country.name}
                            </SelectItem>
                          ))}
                          {countries.length === 0 && isLoading && (
                            <SelectItem value="loading" disabled className="dark:text-gray-400">
                              Loading countries...
                            </SelectItem>
                          )}
                          {countries.length === 0 && !isLoading && (
                            <SelectItem value="US" className="dark:text-gray-100">United States</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {isImportMode && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Using countries from imported file
                        </p>
                      )}
                      <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              
              {isImportMode && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Excel Import Mode Active
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {importedBots?.length || 0} bots will be created with country settings from the file
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                      onClick={cancelImport}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Cancel Import
                    </Button>
                  </div>
                </div>
              )}
            </div>


            {isScheduleMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#747487] dark:text-gray-300 font-medium text-sm">Schedule Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={format(new Date(), 'yyyy-MM-dd')}
                          className="border-gray-300 dark:border-gray-700 focus:border-[#0E72ED] focus:ring-[#0E72ED] h-10 bg-white dark:bg-gray-800 dark:text-gray-100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduledTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#747487] dark:text-gray-300 font-medium text-sm">Schedule Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          className="border-gray-300 dark:border-gray-700 focus:border-[#0E72ED] focus:ring-[#0E72ED] h-10 bg-white dark:bg-gray-800 dark:text-gray-100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="submit"
                className="flex-1 bg-[#0E72ED] hover:bg-[#0B5CCA] dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium h-10 rounded-md"
                disabled={isLoading || isGenerating || isImporting || !isFormValid}
              >
                {isScheduleMode ? (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </>
                ) : isGenerating || isLoading || isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isImporting ? "Importing..." : countryChanged ? "Updating..." : "Generating..."}
                  </>
                ) : (
                  isImportMode ? "Import Bots" : "Generate Bots"
                )}
              </Button>
              
              {!isScheduleMode && (
                <Button
                  type="button"
                  onClick={() => {
                    form.trigger().then(isValid => {
                      if (isValid) {
                        const values = form.getValues();
                        onJoinMeeting(values);
                      } else {
                        toast({
                          title: "Validation Error",
                          description: "Please fix the errors in the form",
                          variant: "destructive"
                        });
                      }
                    });
                  }}
                  disabled={!hasGeneratedBots || isJoining || !form.getValues().meetingId || isGenerating || isImporting}
                  className="bg-[#27AE60] hover:bg-[#219653] dark:bg-green-700 dark:hover:bg-green-800 text-white font-medium h-10 rounded-md"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Join Meeting
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

//             <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
//               <Button
//                 type="submit"
//                 className="flex-1 bg-[#0E72ED] hover:bg-[#0B5CCA] dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium h-10 rounded-md"
//                 disabled={isLoading || isGenerating || isImporting || !isFormValid}
//                 onClick={() => {
//                   form.trigger();
//                 }}
//               >
//                 {isGenerating || isLoading || isImporting ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     {isImporting ? "Importing..." : countryChanged ? "Updating..." : "Generating..."}
//                   </>
//                 ) : (
//                   isImportMode ? "Import Bots" : "Generate Bots"
//                 )}
//               </Button>
//               <Button
//                 type="button"
//                 onClick={() => {
//                   form.trigger().then(isValid => {
//                     if (isValid) {
//                       const values = form.getValues();
//                       onJoinMeeting(values);
//                     } else {
//                       toast({
//                         title: "Validation Error",
//                         description: "Please fix the errors in the form",
//                         variant: "destructive"
//                       });
//                     }
//                   });
//                 }}
//                 disabled={!hasGeneratedBots || isJoining || !form.getValues().meetingId || isGenerating || isImporting}
//                 className="bg-[#27AE60] hover:bg-[#219653] dark:bg-green-700 dark:hover:bg-green-800 text-white font-medium h-10 rounded-md"
//               >
//                 {isJoining ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     Joining...
//                   </>
//                 ) : (
//                   <>
//                     <Play className="w-4 h-4 mr-2" />
//                     Join Meeting
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }