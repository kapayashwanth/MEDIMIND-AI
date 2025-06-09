
'use client';

import { useState, ChangeEvent, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeReportAction, AnalyzeReportState } from '@/lib/actions/analyzeReportAction';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FileUp, AlertCircle, CheckCircle2, Download, User, Users } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [state, formAction] = useActionState(analyzeReportAction, initialState);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportDataUri, setReportDataUri] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const resultsRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPdf = async () => {
    const input = resultsRef.current;
    if (input) {
      try {
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('MediMind_AI_Report_Summary.pdf');
      } catch (error) {
        console.error("Error generating PDF:", error);
        // Add a user-friendly error message here, e.g., using a toast
      }
    }
  };
  
  const getRiskAssessmentClass = (risk?: string) => {
    if (!risk) return 'border-muted text-muted-foreground';
    const lowerRisk = risk.toLowerCase();
    if (lowerRisk.includes('danger')) return 'border-destructive bg-destructive/10 text-destructive';
    if (lowerRisk.includes('watch')) return 'border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    if (lowerRisk.includes('normal')) return 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400';
    return 'border-muted text-muted-foreground';
  };


  return (
    <>
      <PageHeader title="Analyze Medical Report" />
      <main className="flex-1 p-6">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Upload Report</CardTitle>
            <CardDescription>
              Upload an X-ray, MRI, lab results, or other medical test report along with patient information for AI analysis.
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Patient Age (Optional)</Label>
                  <Input id="age" name="age" type="text" placeholder="e.g., 35" className="bg-background" />
                  {state.errors?.age && (
                    <p className="text-sm font-medium text-destructive">{state.errors.age[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Patient Gender (Optional)</Label>
                  <Input id="gender" name="gender" type="text" placeholder="e.g., Male, Female, Other" className="bg-background" />
                   {state.errors?.gender && (
                    <p className="text-sm font-medium text-destructive">{state.errors.gender[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientInformation">Additional Patient Information</Label>
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
          <Card className="max-w-2xl mx-auto mt-8 shadow-xl" ref={resultsRef}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-2xl">Analysis Results</CardTitle>
                <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-primary" /> Risk Assessment
                </h3>
                <div className={`p-3 border rounded-md text-sm whitespace-pre-wrap ${getRiskAssessmentClass(state.data.riskAssessment)}`}>
                  {state.data.riskAssessment}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" /> Personalized Recommendations
                </h3>
                <p className="text-sm text-foreground whitespace-pre-wrap p-3 bg-muted rounded-md">{state.data.personalizedRecommendations}</p>
              </div>
               <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <FileScan className="mr-2 h-5 w-5 text-primary" /> Key Findings
                </h3>
                <p className="text-sm text-foreground whitespace-pre-wrap p-3 bg-muted rounded-md">{state.data.keyFindings}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" /> Summary
                </h3>
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
