
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestMedicineByDiseaseAction, SuggestMedicineState } from '@/lib/actions/medicineByDiseaseAction';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Pill, Search, Sparkles, Tag, X } from 'lucide-react';

const initialState: SuggestMedicineState = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <LoadingSpinner size="sm" /> : <><Sparkles className="mr-2 h-4 w-4" /> Get Suggestions</>}
    </Button>
  );
}

export default function MedicineByDiseasePage() {
  const [state, formAction] = useActionState(suggestMedicineByDiseaseAction, initialState);
  const [inputValue, setInputValue] = useState('');
  const [diseases, setDiseases] = useState<string[]>([]);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault();
      if (!diseases.includes(inputValue.trim())) {
        setDiseases([...diseases, inputValue.trim()]);
        setInputValue('');
      }
    }
  };

  const removeDisease = (diseaseToRemove: string) => {
    setDiseases(diseases.filter((d) => d !== diseaseToRemove));
  };

  return (
    <>
      <PageHeader title="Medicine by Disease" />
      <main className="flex-1 p-6">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Get Medicine Suggestions</CardTitle>
            <CardDescription>
              Enter one or more diseases (press Enter after each one) and our AI will suggest potential medications.
            </CardDescription>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="disease-input" className="text-sm font-medium">Disease(s)</label>
                <Input
                  id="disease-input"
                  placeholder="e.g., Hypertension, Type 2 Diabetes"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                />
                 {diseases.map((d) => (
                    <input type="hidden" name="diseases" value={d} key={d} />
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {diseases.map((disease) => (
                  <div key={disease} className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                    <Tag className="h-3 w-3" />
                    <span>{disease}</span>
                    <button type="button" onClick={() => removeDisease(disease)} className="ml-1 text-secondary-foreground hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {state.errors?.diseases && (
                <p className="text-sm font-medium text-destructive">{state.errors.diseases[0]}</p>
              )}
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

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
