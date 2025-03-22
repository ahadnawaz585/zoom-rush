"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Users, Globe, Clock, Play, Loader2 } from "lucide-react";
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
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  meetingId: z
    .string()
    .min(9, "Meeting ID must be at least 9 characters")
    .max(11, "Meeting ID must not exceed 11 characters"),
  password: z.string().min(1, "Password is required"),
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
  countryCode: z.string().min(1, "Please select a country"),
});

interface MeetingFormProps {
  onBotsGenerated: (quantity: number, countryCode: string) => void;
  onJoinMeeting: (values: z.infer<typeof formSchema>) => void;
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
  onFormChange,
  formValues,
  isJoining,
  isLoading = false,
  hasGeneratedBots,
  countries
}: MeetingFormProps) {
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [internalQuantity, setInternalQuantity] = useState<string>("5");
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [countryChanged, setCountryChanged] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingId: formValues?.meetingId || "",
      password: formValues?.password || "",
      quantity: formValues?.quantity || 5,
      duration: formValues?.duration || 30,
      countryCode: formValues?.countryCode || "US",
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
    });
  };

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

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-md flex flex-col h-full border dark:border-gray-800">
      <CardHeader className="bg-[#F8F8F8] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
        <CardTitle className="text-[#232333] dark:text-gray-100 text-lg font-medium">Meeting Configuration</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-grow overflow-y-auto">
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
                        />
                      </FormControl>
                      {quantityError && (
                        <p className="text-xs font-medium text-red-500 dark:text-red-400">{quantityError}</p>
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
                        disabled={isLoading || isGenerating}
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
                      <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="submit"
                className="flex-1 bg-[#0E72ED] hover:bg-[#0B5CCA] dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium h-10 rounded-md"
                disabled={isLoading || isGenerating || !isFormValid}
                onClick={() => {
                  form.trigger();
                }}
              >
                {isGenerating || isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {countryChanged ? "Updating..." : "Generating..."}
                  </>
                ) : (
                  "Generate Bots"
                )}
              </Button>
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
                disabled={!hasGeneratedBots || isJoining || !form.getValues().meetingId || isGenerating}
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
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}