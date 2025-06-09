
'use client';

import { ChangeEvent, useActionState, useRef, useState } from 'react'; // Added useState
import { useFormStatus } from 'react-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MedicineInfoCard } from '@/components/cards/MedicineInfoCard';
import { searchMedicineAction, SearchMedicineState } from '@/lib/actions/searchMedicineAction';
import type { Medicine } from '@/types';
import { Search, Frown, AlertCircle, Info } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState: SearchMedicineState = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <LoadingSpinner size="sm" /> : <><Search className="mr-2 h-4 w-4" /> Search</>}
    </Button>
  );
}

export default function MedicineSearchPage() {
  const [state, formAction] = useActionState(searchMedicineAction, initialState);
  const [searchTerm, setSearchTerm] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSearchTermChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Prepare data for the MedicineInfoCard. 
  // If AI returns data, use it. Otherwise, card won't be rendered.
  const medicineData = state.data;

  return (
    <>
      <PageHeader title="AI Medicine Search" />
      <main className="flex-1 p-6">
        <Card className="max-w-xl mx-auto mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Search for Medicine</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              ref={formRef}
              action={(formData) => {
                // We'll directly use the searchTerm from state for the action
                // No need to manually append to formData if the input field is named correctly
                // or if we pass it directly.
                // For actions, it's often cleaner to reconstruct the data passed.
                const newFormData = new FormData();
                newFormData.append('searchTerm', searchTerm);
                formAction(newFormData);
              }}
              className="space-y-4"
            >
              <div className="relative flex flex-col sm:flex-row gap-2 items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground sm:hidden" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hidden sm:block pointer-events-none" />
                <Input
                  type="search"
                  name="searchTerm" // This name ensures formData gets the value
                  placeholder="Enter medicine name..."
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  className="w-full pl-10 py-3 text-base rounded-lg shadow-sm flex-grow"
                  aria-label="Medicine search term"
                />
                {/* Removed redundant hidden input */}
                <SubmitButton />
              </div>
              {state.errors?.searchTerm && (
                <p className="text-sm font-medium text-destructive">{state.errors.searchTerm[0]}</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Display messages or errors */}
        {state.message && !state.data && (
           <Alert variant={state.errors?.server ? "destructive" : "default"} className="max-w-xl mx-auto mb-8">
             {state.errors?.server ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
             <AlertTitle>{state.errors?.server ? 'Error' : 'Notification'}</AlertTitle>
             <AlertDescription>{state.message}</AlertDescription>
           </Alert>
        )}
        
        {/* Display MedicineInfoCard if data exists */}
        {medicineData && (
          <div className="max-w-xl mx-auto">
            <MedicineInfoCard medicine={medicineData} />
          </div>
        )}

        {/* Show if no data and no specific "not found" message, implies initial state or non-specific error */}
        {!medicineData && !state.message && !state.errors?.searchTerm && (
             <div className="text-center py-10">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">Search for medicine information.</p>
                <p className="text-sm text-muted-foreground">Enter a medicine name above to begin.</p>
            </div>
        )}
      </main>
    </>
  );
}
