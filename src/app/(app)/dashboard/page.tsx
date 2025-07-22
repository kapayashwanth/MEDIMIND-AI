
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileScan, ScrollText, Pill, BarChart3, CalendarPlus, Search } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h2 className="font-headline text-3xl font-semibold text-foreground mb-2">Welcome to MediMind AI</h2>
          <p className="text-muted-foreground">
            Your intelligent medical assistant for analyzing reports, interpreting prescriptions, and finding medicine information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <FileScan className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline">Report Analysis</CardTitle>
              </div>
              <CardDescription>
                Upload medical test reports like X-rays or MRIs for AI-powered key finding highlights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/reports/analysis" asChild>
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
                Interpret prescriptions to understand medication details, usage, and intake timings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/prescriptions/interpret" asChild>
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
                Search for medicines by name to find detailed information about their recommended usage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/medicines/search" asChild>
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
                Enter a disease to get AI-powered suggestions for relevant medications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/medicines/by-disease" asChild>
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
                Find doctors from various hospitals and book an appointment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/appointments/book" asChild>
                <Button className="w-full" variant="default">Book Now</Button>
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
                View your past analyses and interpretations. (Feature coming soon)
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
