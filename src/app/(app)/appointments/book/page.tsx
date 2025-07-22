
'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, User, Hospital, Briefcase, CalendarPlus } from 'lucide-react';
import { useState } from 'react';

export default function BookAppointmentPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // This is a prototype, so we just show a success message.
    // In a real app, this would trigger a server action.
    toast({
      title: "Appointment Booked!",
      description: "Your appointment has been successfully scheduled. (This is a demo)",
      variant: 'default'
    });
  };

  return (
    <>
      <PageHeader title="Book an Appointment" />
      <main className="flex-1 p-6">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Schedule Your Visit</CardTitle>
            <CardDescription>
              Fill out the details below to book an appointment with a doctor.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital</Label>
                <div className="relative">
                   <Hospital className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                   <Select name="hospital" required>
                      <SelectTrigger className="w-full pl-10">
                        <SelectValue placeholder="Select a hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="valley-general">Valley General Hospital</SelectItem>
                        <SelectItem value="city-central">City Central Medical Center</SelectItem>
                        <SelectItem value="riverbend-clinic">Riverbend Clinic</SelectItem>
                        <SelectItem value="mountainview">Mountainview Specialty Hospital</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                 <div className="relative">
                   <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Select name="specialty" required>
                      <SelectTrigger className="w-full pl-10">
                        <SelectValue placeholder="Select a specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                         <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name</Label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                   <Input id="patient-name" name="patientName" placeholder="e.g., John Doe" required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-date">Appointment Date</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </>
  );
}
