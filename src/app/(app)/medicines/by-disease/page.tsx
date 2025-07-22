
'use client';

import { useActionState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  SuggestMedicineState,
  suggestMedicineByDiseaseAction,
} from '@/lib/actions/medicineByDiseaseAction';
import { MedicineByDiseaseForm } from '@/components/forms/MedicineByDiseaseForm';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Pill, Clock, ShieldAlert } from 'lucide-react';

const initialState: SuggestMedicineState = {
  message: null,
  errors: {},
  data: null,
};

export default function MedicineByDiseasePage() {
  const [state, formAction] = useActionState(suggestMedicineByDiseaseAction, initialState);

  const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
      <div>
        <h5 className="font-semibold text-foreground">{label}</h5>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader title="Medicine by Disease" />
      <main className="flex-1 p-6">
        <MedicineByDiseaseForm state={state} formAction={formAction} />

        {state.message && !state.data && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {state.data && (
          <Card className="max-w-2xl mx-auto mt-8 shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">AI-Powered Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {state.data.suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg border space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Pill className="h-6 w-6 text-primary" />
                    <h4 className="font-bold text-lg text-foreground">{suggestion.name}</h4>
                  </div>
                  <DetailItem icon={Clock} label="Typical Frequency" value={suggestion.frequency} />
                  <DetailItem icon={ShieldAlert} label="Common Side Effects" value={suggestion.sideEffects} />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Alert variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Disclaimer</AlertTitle>
                <AlertDescription>{state.data.disclaimer}</AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        )}
      </main>
    </>
  );
}
