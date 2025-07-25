
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
import { useRouter } from 'next/navigation';

export default function BookAppointmentPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hospital, setHospital] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [patientName, setPatientName] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hospital || !specialty || !patientName || !date) {
        toast({
            title: "Missing Information",
            description: "Please fill out all fields to book an appointment.",
            variant: 'destructive'
        });
        return;
    }

    const newAppointment = {
        id: Date.now(),
        doctor: `Dr. Placeholder`, // In a real app, you'd select a doctor
        hospital,
        specialty,
        patientName,
        date: format(date, 'yyyy-MM-dd'),
        time: '10:00 AM', // In a real app, you'd select a time
        status: 'Upcoming'
    };
    
    // Retrieve existing appointments from localStorage
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    // Add the new appointment
    const updatedAppointments = [...existingAppointments, newAppointment];
    // Save back to localStorage
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

    toast({
      title: "Appointment Booked!",
      description: "Your appointment has been successfully scheduled.",
      variant: 'default'
    });

    // Optionally, redirect to the view appointments page
    router.push('/appointments/view');
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
                   <Select name="hospital" required onValueChange={setHospital} value={hospital}>
                      <SelectTrigger className="w-full pl-10">
                        <SelectValue placeholder="Select a hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Valley General Hospital">Valley General Hospital</SelectItem>
                        <SelectItem value="City Central Medical Center">City Central Medical Center</SelectItem>
                        <SelectItem value="Riverbend Clinic">Riverbend Clinic</SelectItem>
                        <SelectItem value="Mountainview Specialty Hospital">Mountainview Specialty Hospital</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                 <div className="relative">
                   <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Select name="specialty" required onValueChange={setSpecialty} value={specialty}>
                      <SelectTrigger className="w-full pl-10">
                        <SelectValue placeholder="Select a specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                         <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name</Label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                   <Input 
                    id="patient-name" 
                    name="patientName" 
                    placeholder="e.g., John Doe" 
                    required 
                    className="pl-10"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    />
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
                      disabled={{ before: new Date() }}
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
