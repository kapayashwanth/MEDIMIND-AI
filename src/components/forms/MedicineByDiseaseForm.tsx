
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Sparkles, Tag, X } from 'lucide-react';
import type { SuggestMedicineState } from '@/lib/actions/medicineByDiseaseAction';

interface MedicineByDiseaseFormProps {
  state: SuggestMedicineState;
  formAction: (payload: FormData) => void;
}

function SubmitButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} onClick={onClick}>
      {pending ? <LoadingSpinner size="sm" /> : <><Sparkles className="mr-2 h-4 w-4" /> Get Suggestions</>}
    </Button>
  );
}

export function MedicineByDiseaseForm({ state, formAction }: MedicineByDiseaseFormProps) {
  const [inputValue, setInputValue] = useState('');
  const [diseases, setDiseases] = useState<string[]>([]);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault();
      addDisease();
    }
  };

  const addDisease = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !diseases.includes(trimmedValue)) {
      setDiseases([...diseases, trimmedValue]);
      setInputValue('');
    }
  };

  const removeDisease = (diseaseToRemove: string) => {
    setDiseases(diseases.filter((d) => d !== diseaseToRemove));
  };
  
  const handleFormAction = (formData: FormData) => {
    // Add the current input value to the diseases list before submitting
    const finalDiseases = [...diseases];
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !finalDiseases.includes(trimmedValue)) {
      finalDiseases.push(trimmedValue);
    }

    const newFormData = new FormData();
    finalDiseases.forEach(d => newFormData.append('diseases', d));
    
    formAction(newFormData);
  };
  
  const handleButtonClick = () => {
     // This is a bit of a trick to ensure the latest state is captured
     // before the form action consumes it. It's often not needed but can prevent race conditions.
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Get Medicine Suggestions</CardTitle>
        <CardDescription>
          Enter one or more diseases (press Enter after each one) and our AI will suggest potential medications.
        </CardDescription>
      </CardHeader>
      <form action={handleFormAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="disease-input" className="text-sm font-medium">Disease(s)</label>
            <Input
              id="disease-input"
              name="disease-input" // This input is for typing, not direct submission
              placeholder="e.g., Hypertension, Type 2 Diabetes"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            {/* Hidden inputs to carry the state for form submission */}
            {diseases.map((d) => (
              <input type="hidden" name="diseases" value={d} key={d} />
            ))}
          </div>

          <div className="flex flex-wrap gap-2 min-h-[2.25rem]">
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
          <SubmitButton onClick={handleButtonClick} />
        </CardFooter>
      </form>
    </Card>
  );
}
