
'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BellPlus, Pill, Clock } from 'lucide-react';

export default function MedicineReminderPage() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // This is a prototype, so we just show a success message.
    toast({
      title: "Reminder Set!",
      description: "Your medicine reminder has been successfully created. (This is a demo)",
      variant: 'default'
    });
    (event.target as HTMLFormElement).reset();
  };

  return (
    <>
      <PageHeader title="Set a Medicine Reminder" />
      <main className="flex-1 p-6">
        <Card className="max-w-xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">New Reminder</CardTitle>
            <CardDescription>
              Fill out the details below to set a reminder for your medication.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="medicine-name">Medicine Name</Label>
                <div className="relative">
                  <Pill className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="medicine-name" name="medicineName" placeholder="e.g., Paracetamol" required className="pl-10" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input id="dosage" name="dosage" placeholder="e.g., 500mg or 1 tablet" required />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select name="frequency" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Once a day</SelectItem>
                        <SelectItem value="twice">Twice a day</SelectItem>
                        <SelectItem value="thrice">Three times a day</SelectItem>
                        <SelectItem value="as-needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder Time(s)</Label>
                 <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="reminder-time" name="reminderTime" type="time" required className="pl-10"/>
                </div>
                <p className="text-xs text-muted-foreground">You can add more times in a real app.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                <BellPlus className="mr-2 h-4 w-4" />
                Set Reminder
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </>
  );
}
