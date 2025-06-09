'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeReportAction, AnalyzeReportState } from '@/lib/actions/analyzeReportAction';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FileUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const initialState: AnalyzeReportState = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <LoadingSpinner size="sm" /> : 'Analyze Report'}
    </Button>
  );
}

export default function ReportAnalysisPage() {
  const [state, formAction] = useFormState(analyzeReportAction, initialState);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportDataUri, setReportDataUri] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReportFile(file);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setReportDataUri(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setReportFile(null);
      setReportDataUri('');
      setFileName('');
    }
  };

  return (
    <>
      <PageHeader title="Analyze Medical Report" />
      <main className="flex-1 p-6">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Upload Report</CardTitle>
            <CardDescription>
              Upload an X-ray, MRI, or other medical test report along with patient information for AI analysis.
            </CardDescription>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reportFile">Medical Report File</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="reportFile" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">Images (PNG, JPG, etc.) or PDF</p>
                        </div>
                        <Input id="reportFile" name="reportFile" type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
                    </label>
                </div>
                {fileName && <p className="text-sm text-muted-foreground mt-2">Selected file: {fileName}</p>}
                <input type="hidden" name="reportDataUri" value={reportDataUri} />
                {state.errors?.reportDataUri && (
                  <p className="text-sm font-medium text-destructive">{state.errors.reportDataUri[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientInformation">Patient Information</Label>
                <Textarea
                  id="patientInformation"
                  name="patientInformation"
                  placeholder="Enter relevant patient history, symptoms, or context for the report..."
                  rows={4}
                  className="bg-background"
                />
                {state.errors?.patientInformation && (
                  <p className="text-sm font-medium text-destructive">{state.errors.patientInformation[0]}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <SubmitButton />
              {state.message && !state.data && (
                <Alert variant={state.errors || state.message.startsWith('Server error:') ? "destructive" : "default"} className="w-full">
                  {state.errors || state.message.startsWith('Server error:') ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  <AlertTitle>{state.errors || state.message.startsWith('Server error:') ? 'Error' : 'Status'}</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </form>
        </Card>

        {state.data && (
          <Card className="max-w-2xl mx-auto mt-8 shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Key Findings</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap p-3 bg-muted rounded-md">{state.data.keyFindings}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Summary</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap p-3 bg-muted rounded-md">{state.data.summary}</p>
              </div>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">AI analysis provides potential insights and is not a substitute for professional medical advice. Consult with a qualified healthcare provider for any health concerns.</p>
            </CardFooter>
          </Card>
        )}
      </main>
    </>
  );
}
