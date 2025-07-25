
'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Hospital, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed';
}

const getDoctorForSpecialty = (specialty: string): string => {
    const doctors: { [key: string]: string } = {
        'Cardiology': 'Dr. Sarah Johnson',
        'Dermatology': 'Dr. Michael Lee',
        'Neurology': 'Dr. Emily White',
        'Orthopedics': 'Dr. James Brown',
        'Pediatrics': 'Dr. Linda Davis'
    };
    return doctors[specialty] || 'Dr. Placeholder';
}

export default function ViewAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    const processedAppointments = storedAppointments.map((app: any) => {
        const appointmentDate = new Date(app.date);
        const today = new Date();
        // Set time to 00:00:00 to compare dates only
        appointmentDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        return {
            ...app,
            doctor: getDoctorForSpecialty(app.specialty),
            status: appointmentDate < today ? 'Completed' : 'Upcoming'
        };
    });

    setAppointments(processedAppointments);
  }, []);

  const upcomingAppointments = appointments.filter(a => a.status === 'Upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastAppointments = appointments.filter(a => a.status === 'Completed').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{appointment.doctor}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Stethoscope className="h-4 w-4" />
          <span>{appointment.specialty}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Hospital className="h-4 w-4" />
          <span>{appointment.hospital}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(appointment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {appointment.time}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <PageHeader title="Your Appointments" />
      <main className="flex-1 p-6 space-y-8">
        <section>
          <h2 className="font-headline text-2xl mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingAppointments.map(app => <AppointmentCard key={app.id} appointment={app} />)}
            </div>
          ) : (
            <p className="text-muted-foreground">You have no upcoming appointments.</p>
          )}
        </section>

        <section>
          <h2 className="font-headline text-2xl mb-4">Past Appointments</h2>
          {pastAppointments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastAppointments.map(app => <AppointmentCard key={app.id} appointment={app} />)}
            </div>
          ) : (
            <p className="text-muted-foreground">You have no past appointments.</p>
          )}
        </section>
      </main>
    </>
  );
}
