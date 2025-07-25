
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Hospital, Stethoscope } from 'lucide-react';

const mockAppointments = [
  {
    id: 1,
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    hospital: 'Valley General Hospital',
    date: '2024-08-15',
    time: '10:30 AM',
    status: 'Upcoming'
  },
  {
    id: 2,
    doctor: 'Dr. Michael Lee',
    specialty: 'Dermatology',
    hospital: 'City Central Medical Center',
    date: '2024-07-20',
    time: '02:00 PM',
    status: 'Completed'
  },
  {
    id: 3,
    doctor: 'Dr. Emily White',
    specialty: 'Neurology',
    hospital: 'Riverbend Clinic',
    date: '2024-06-10',
    time: '09:00 AM',
    status: 'Completed'
  },
];

export default function ViewAppointmentsPage() {
  const upcomingAppointments = mockAppointments.filter(a => a.status === 'Upcoming');
  const pastAppointments = mockAppointments.filter(a => a.status === 'Completed');

  const AppointmentCard = ({ appointment }: { appointment: typeof mockAppointments[0] }) => (
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
