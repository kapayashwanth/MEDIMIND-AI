
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
import { AlertTriangle, Pill } from 'lucide-react';

const initialState: SuggestMedicineState = {
  message: null,
  errors: {},
  data: null,
};

export default function MedicineByDiseasePage() {
  const [state, formAction] = useActionState(suggestMedicineByDiseaseAction, initialState);

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
            <CardContent className="space-y-4">
              {state.data.suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-md border">
                  <div className="flex items-center gap-2 mb-1">
                    <Pill className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-foreground">{suggestion.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">{suggestion.reason}</p>
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
