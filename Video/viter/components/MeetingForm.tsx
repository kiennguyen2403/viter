/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Cross1Icon, ReloadIcon } from "@radix-ui/react-icons";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { Badge } from "./ui/badge";

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MeetingForm = ({
  onSubmit,
  handleKeyDown,
  handleDelete,
  emails,
  setEmails,
  isCreatingNewMeeting,
}: {
  onSubmit: (data: any) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleDelete: (email: string) => void;
  emails: string[];
  setEmails: (emails: string[]) => void;
  isCreatingNewMeeting: boolean;
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", date: undefined },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Meeting title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Meeting description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-3">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className="w-full pl-3 text-left">
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                      <CalendarIcon className="ml-auto opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select a future date for the meeting
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="participants"
          render={({ field }) => (
            <FormItem className="flex flex-col mt-3">
              <FormLabel>Participants</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {emails.map((email, index) => (
                    <Badge key={index} onClick={() => handleDelete(email)}>
                      {email} <Cross1Icon className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  <Input
                    placeholder="Email addresses"
                    {...field}
                    value={field.value.join(", ")}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      field.onChange(
                        newValue.split(", ").map((email) => email.trim())
                      ); // Update field value
                      setEmails(
                        newValue.split(", ").map((email) => email.trim())
                      ); // Update emails state
                    }}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Separate multiple email addresses with commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-4">
          {isCreatingNewMeeting ? (
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Schedule Meeting
        </Button>
      </form>
    </Form>
  );
};

export default MeetingForm;
