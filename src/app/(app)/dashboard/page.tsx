
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileScan, ScrollText, Pill, BarChart3, CalendarPlus, Search, CalendarCheck, BellRing } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h2 className="font-headline text-3xl font-semibold text-foreground mb-2">Welcome to MediMind AI</h2>
          <p className="text-muted-foreground">
            Your intelligent assistant for understanding your health.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <FileScan className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline">Report Analysis</CardTitle>
              </div>
              <CardDescription>
                Upload medical reports for AI-powered analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/reports/analysis" passHref>
                <Button className="w-full" variant="default">Analyze a Report</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <ScrollText className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline">Prescription Interpretation</CardTitle>
              </div>
              <CardDescription>
                Interpret prescriptions to understand medications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/prescriptions/interpret" passHref>
                <Button className="w-full" variant="default">Interpret Prescription</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Pill className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline">Medicine Search</CardTitle>
              </div>
              <CardDescription>
                Search for medicines to find detailed information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/medicines/search" passHref>
                <Button className="w-full" variant="default">Search Medicines</Button>
              </Link>
            </CardContent>
          </Card>
          
           <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Search className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline">Medicine by Disease</CardTitle>
              </div>
              <CardDescription>
                Get medication suggestions based on diseases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/medicines/by-disease" passHref>
                <Button className="w-full" variant="default">Get Suggestions</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <CalendarPlus className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline">Book Appointment</CardTitle>
              </div>
              <CardDescription>
                Schedule a new visit with a doctor from various hospitals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/appointments/book" passHref>
                <Button className="w-full" variant="default">Book Now</Button>
              </Link>
            </CardContent>
          </Card>

           <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <CalendarCheck className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline">View Appointments</CardTitle>
              </div>
              <CardDescription>
                Check your upcoming and past appointment schedules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/appointments/view" passHref>
                <Button className="w-full" variant="default">View All</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <BellRing className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline">Medicine Reminders</CardTitle>
              </div>
              <CardDescription>
                Set up reminders for taking your medications on time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/medicines/reminder" passHref>
                <Button className="w-full" variant="default">Set Reminder</Button>
              </Link>
            </CardContent>
          </Card>


          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
               <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline">Analysis History</CardTitle>
              </div>
              <CardDescription>
                View your past analyses. (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>View History</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
