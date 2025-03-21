// components/shared/meeting-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Users, Globe, Clock, Play } from "lucide-react";
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
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingId: formValues?.meetingId || "",
      password: formValues?.password || "",
      quantity: formValues?.quantity || 5,
      duration: formValues?.duration || 30,
      countryCode: formValues?.countryCode || "US",
    }
  });

  // Initialize internal quantity from form values
  useEffect(() => {
    if (formValues?.quantity) {
      setInternalQuantity(formValues.quantity.toString());
      validateQuantity(formValues.quantity);
    }
  }, [formValues?.quantity]);

  // Validate quantity and update form validity
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

  // Update form values when props change - but never trigger bot generation automatically
  useEffect(() => {
    if (formValues) {
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof z.infer<typeof formSchema>, value);
        }
      });
    }
  }, [formValues, form]);

  // Handle form submission - this is the ONLY place where bots should be generated
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    
    const values = form.getValues();
    
    // Verify the quantity is valid
    if (!validateQuantity(values.quantity)) {
      toast({
        title: "Error",
        description: "Cannot generate more than 200 bots. Please reduce the quantity.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate other form fields
    if (!values.meetingId || !values.password || !values.countryCode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Only generate bots if all validations pass and the button is explicitly clicked
    onBotsGenerated(values.quantity, values.countryCode);
  };

  // Function to handle country code changes - only updates form state, never generates bots
  const handleCountryChange = (code: string) => {
    form.setValue("countryCode", code);
    if (onFormChange) {
      // Pass a flag to indicate this is just a form change, not a request to generate bots
      onFormChange({ countryCode: code });
    }
  };

  // Function to handle quantity changes - only updates form state, never generates bots
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Remove leading zeros
    const rawValue = event.target.value.replace(/^0+/, '') || '';
    setInternalQuantity(rawValue);
    
    // Convert to number for the form
    const quantity = rawValue === '' ? 0 : parseInt(rawValue, 10);
    
    // Validate the quantity
    validateQuantity(quantity);
    
    // Update form value
    form.setValue("quantity", quantity);
    
    // Only update parent component's state but DON'T generate bots
    if (onFormChange) {
      onFormChange({ quantity });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="meetingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter Zoom meeting ID" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          if (onFormChange) {
                            onFormChange({ meetingId: e.target.value });
                          }
                        }}
                        className={attemptedSubmit && !field.value ? "border-red-500" : ""}
                      />
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
                    <FormLabel>Meeting Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter meeting password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (onFormChange) {
                            onFormChange({ password: e.target.value });
                          }
                        }}
                        className={attemptedSubmit && !field.value ? "border-red-500" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
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
                        onBlur={(e) => {
                          // Handle empty case
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
                        className={quantityError ? "border-red-500" : ""}
                      />
                    </FormControl>
                    {quantityError && (
                      <p className="text-sm font-medium text-red-500">{quantityError}</p>
                    )}
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
                        <span>Duration (minutes)</span>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        {...field}
                        onChange={(e) => {
                          // Remove leading zeros
                          const value = parseInt(e.target.value.replace(/^0+/, ''), 10) || 0;
                          field.onChange(value);
                          if (onFormChange) {
                            onFormChange({ duration: value });
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Bot Country</span>
                      </div>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCountryChange(value);
                      }}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className={attemptedSubmit && !field.value ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                        {countries.length === 0 && isLoading && (
                          <SelectItem value="loading" disabled>
                            Loading countries...
                          </SelectItem>
                        )}
                        {countries.length === 0 && !isLoading && (
                          <SelectItem value="US">United States</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "Loading..." : "Generate Bots"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const values = form.getValues();
                  onJoinMeeting(values);
                }}
                disabled={!hasGeneratedBots || isJoining || !form.getValues().meetingId}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                {isJoining ? "Joining..." : "Join Meeting"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}