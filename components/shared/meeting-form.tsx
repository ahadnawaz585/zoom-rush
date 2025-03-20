// // components/MeetingForm.js
// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { Users, Globe, Clock, Play } from "lucide-react";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { countries } from "@/app/data/constants";

// // const formSchema = z.object({

// //   meetingId: z
// //     .string()
// //     .min(9, "Meeting ID must be at least 9 characters")
// //     .max(11, "Meeting ID must not exceed 11 characters"),
// //   password: z.string().min(1, "Password is required"),
// //   quantity: z
// //     .string()
// //     .transform((val) => Number(val))
// //     .pipe(
// //       z.number().min(1, "Quantity must be between 1 and 200").max(200, "Quantity must be between 1 and 200")
// //     ),
// //   duration: z
// //     .string()
// //     .transform((val) => Number(val))
// //     .pipe(
// //       z.number().min(1, "Duration must be between 1 and 120 minutes").max(120, "Duration must be between 1 and 120 minutes")
// //     ),
// //   country: z.string().min(1, "Please select a country"),
// // });

// const formSchema = z.object({
//   meetingId: z
//     .string()
//     .min(9, "Meeting ID must be at least 9 characters")
//     .max(11, "Meeting ID must not exceed 11 characters"),
//   password: z.string().min(1, "Password is required"),
//   quantity: z
//     .number()
//     .min(1, "Quantity must be between 1 and 200")
//     .max(200, "Quantity must be between 1 and 200")
//     .default(1), // Default value to prevent errors
//   duration: z
//     .number()
//     .min(1, "Duration must be between 1 and 120 minutes")
//     .max(120, "Duration must be between 1 and 120 minutes")
//     .default(5),
//   country: z.string().min(1, "Please select a country"),
// });


// interface MeetingFormProps {
//   onBotsGenerated: (quantity: number, country: string) => void;
//   onJoinMeeting: (values: z.infer<typeof formSchema>) => void;
//   isJoining: boolean;
//   hasGeneratedBots: boolean;
// }

// export default function MeetingForm({
//   onBotsGenerated,
//   onJoinMeeting,
//   isJoining,
//   hasGeneratedBots,
// }: MeetingFormProps) {
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       meetingId: "",
//       password: "",
//       quantity: 1,
//       duration: 5,
//       country: "",
//     },
//   });

//   function onSubmit(values: z.infer<typeof formSchema>) {
//     onBotsGenerated(values.quantity, values.country);
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>New Meeting Configuration</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="meetingId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Meeting ID</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Enter meeting ID" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="password"
//                         placeholder="Enter password"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <div className="grid grid-cols-3 gap-4">
//               {/* <FormField
//                 control={form.control}
//                 name="quantity"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>
//                       <div className="flex items-center gap-2">
//                         <Users className="h-4 w-4" />
//                         <span>Quantity</span>
//                       </div>
//                     </FormLabel>
//                     <FormControl>
//                       <Input type="number" min="1" max="200" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               /> */}

// <FormField
//   control={form.control}
//   name="quantity"
//   render={({ field }) => (
//     <FormItem>
//       <FormLabel>
//         <div className="flex items-center gap-2">
//           <Users className="h-4 w-4" />
//           <span>Quantity</span>
//         </div>
//       </FormLabel>
//       <FormControl>
//         <Input
//           type="number"
//           min="1"
//           max="200"
//           {...field}
//           onChange={(e) => field.onChange(Number(e.target.value))} // Ensure it's a number
//         />
//       </FormControl>
//       <FormMessage />
//     </FormItem>
//   )}
// />


//               {/* <FormField
//                 control={form.control}
//                 name="duration"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>
//                       <div className="flex items-center gap-2">
//                         <Clock className="h-4 w-4" />
//                         <span>Duration</span>
//                       </div>
//                     </FormLabel>
//                     <FormControl>
//                       <Input type="number" min="1" max="120" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               /> */}
//               <FormField
//   control={form.control}
//   name="duration"
//   render={({ field }) => (
//     <FormItem>
//       <FormLabel>
//         <div className="flex items-center gap-2">
//           <Clock className="h-4 w-4" />
//           <span>Duration</span>
//         </div>
//       </FormLabel>
//       <FormControl>
//         <Input
//           type="number"
//           min="1"
//           max="120"
//           {...field}
//           onChange={(e) => field.onChange(Number(e.target.value))}
//         />
//       </FormControl>
//       <FormMessage />
//     </FormItem>
//   )}
// />


//               <FormField
//                 control={form.control}
//                 name="country"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>
//                       <div className="flex items-center gap-2">
//                         <Globe className="h-4 w-4" />
//                         <span>Country</span>
//                       </div>
//                     </FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent className="max-h-[300px]">
//                         {Object.entries(countries).map(([code, name]) => (
//                           <SelectItem key={code} value={code}>
//                             {name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <div className="flex gap-2">
//               <Button
//                 type="submit"
//                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 Generate Bots
//               </Button>
//               <Button
//                 type="button"
//                 onClick={() => onJoinMeeting(form.getValues())}
//                 disabled={isJoining || !hasGeneratedBots}
//                 className="bg-green-600 hover:bg-green-700 text-white"
//               >
//                 <Play className="w-4 h-4 mr-2" />
//                 Join Meeting
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </CardContent>
//     </Card>
//   );
// }




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
import { useEffect } from "react";

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

  // Update form values when props change
  useEffect(() => {
    if (formValues) {
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof z.infer<typeof formSchema>, value);
        }
      });
    }
  }, [formValues, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onBotsGenerated(values.quantity, values.countryCode);
  }

  // Function to handle country code changes
  const handleCountryChange = (code: string) => {
    form.setValue("countryCode", code);
    if (onFormChange) {
      onFormChange({ countryCode: code });
    }
  };

  // Function to handle quantity changes
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Number(event.target.value);
    form.setValue("quantity", quantity);
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Number of Bots</span>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="200"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                          handleQuantityChange(e);
                        }}
                      />
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
                          field.onChange(Number(e.target.value));
                          if (onFormChange) {
                            onFormChange({ duration: Number(e.target.value) });
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
                        <SelectTrigger>
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
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Generate Bots"}
              </Button>
              <Button
                type="button"
                onClick={() => onJoinMeeting(form.getValues())}
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