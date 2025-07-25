
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
import type { TestResultItem } from '@/ai/flows/analyze-medical-report';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
    FileUp, AlertCircle, CheckCircle2, Download, User, Users, FileText as ReportIcon,
    AlertOctagon, Activity, Info, ListChecks, ArrowDownCircle, ArrowUpCircle, CheckCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
        const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#1c1c1c' });
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
      }
    }
  };
  
  const getOverallRiskAssessmentClass = (risk?: string) => {
    if (!risk) return 'border-muted text-muted-foreground';
    const lowerRisk = risk.toLowerCase();
    // Using theme variables for colors would be ideal here if direct Tailwind classes for HSL don't exist
    // For now, rely on destructive, and add specific classes for watch/normal if theme doesn't cover it well.
    if (lowerRisk.includes('danger')) return 'border-destructive bg-destructive/10 text-destructive-foreground'; // text-destructive-foreground should be light
    if (lowerRisk.includes('watch')) return 'border-yellow-500 bg-yellow-500/10 text-yellow-500 dark:text-yellow-400'; // Keep yellow for watch
    if (lowerRisk.includes('normal')) return 'border-green-500 bg-green-500/10 text-green-500 dark:text-green-400'; // Keep green for normal
    return 'border-muted text-muted-foreground';
  };

  const getStatusBadgeVariant = (status?: TestResultItem['status']): "default" | "destructive" | "secondary" | "outline" => {
    if (!status) return "outline";
    switch (status.toLowerCase()) {
      case 'normal':
        return "default"; 
      case 'watch':
        return "secondary"; 
      case 'danger':
      case 'low': 
      case 'high':
        return "destructive";
      case 'info':
      default:
        return "outline";
    }
  };
  
 const getStatusColorAndIcon = (status?: TestResultItem['status']): { colorClassForValue: string; IconComponent: React.ElementType } => {
    if (!status) return { colorClassForValue: 'text-muted-foreground', IconComponent: Info };
    switch (status.toLowerCase()) {
      case 'normal':
        return { colorClassForValue: 'text-green-500 dark:text-green-400', IconComponent: CheckCircle };
      case 'watch':
        return { colorClassForValue: 'text-yellow-500 dark:text-yellow-400', IconComponent: Activity };
      case 'danger':
        return { colorClassForValue: 'text-destructive', IconComponent: AlertOctagon }; // text-destructive for value text
      case 'low':
         return { colorClassForValue: 'text-destructive', IconComponent: ArrowDownCircle }; // text-destructive for value text
      case 'high':
        return { colorClassForValue: 'text-destructive', IconComponent: ArrowUpCircle }; // text-destructive for value text
      case 'info':
      default:
        return { colorClassForValue: 'text-primary', IconComponent: Info }; // Use primary for info text
    }
  };


  return (
    <>
      <PageHeader title="Analyze Medical Report" />
      <main className="flex-1 p-6">
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Upload Report</CardTitle>
            <CardDescription>
              Upload an X-ray, MRI, lab results, or other medical test report for AI analysis. Age and gender are optional but can improve results.
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
                  <Select name="gender" defaultValue="unspecified">
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="unspecified">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                   {state.errors?.gender && (
                    <p className="text-sm font-medium text-destructive">{state.errors.gender[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientInformation">Additional Patient Information (Optional)</Label>
                <Textarea
                  id="patientInformation"
                  name="patientInformation"
                  placeholder="Enter relevant patient history, symptoms, or context for the report (optional)..."
                  rows={3}
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
                <Alert variant={state.errors || state.message?.startsWith('Server error:') ? "destructive" : "default"} className="w-full">
                  {state.errors || state.message?.startsWith('Server error:') ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  <AlertTitle>{state.errors || state.message?.startsWith('Server error:') ? 'Error' : 'Status'}</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </form>
        </Card>

        {state.data && (
          <Card className="max-w-3xl mx-auto mt-8 shadow-xl" ref={resultsRef}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-2xl">Analysis Results</CardTitle>
                <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
               <p className="text-sm text-muted-foreground pt-2">{state.data.conciseSummary}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-primary" /> Overall Risk Assessment
                </h3>
                <div className={`p-3 border rounded-md text-sm whitespace-pre-wrap ${getOverallRiskAssessmentClass(state.data.overallRiskAssessment)}`}>
                  {state.data.overallRiskAssessment}
                </div>
              </div>

             {state.data.detailedTestResults && state.data.detailedTestResults.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <ListChecks className="mr-2 h-5 w-5 text-primary" /> Detailed Test Results
                  </h3>
                  <div className="space-y-4">
                    {state.data.detailedTestResults.map((item, index) => {
                      const badgeVariant = getStatusBadgeVariant(item.status);
                      const { colorClassForValue, IconComponent } = getStatusColorAndIcon(item.status);
                      return (
                        <div key={index} className="p-3 bg-muted/50 rounded-md border">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-foreground">{item.testName}</h4>
                            <Badge variant={badgeVariant} className="capitalize">
                              <IconComponent className="mr-1.5 h-3.5 w-3.5" /> {/* Icon should inherit color from badge variant correctly now */}
                              {item.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <p><span className="font-medium">Patient's Value:</span> <span className={colorClassForValue}>{item.patientValue} {item.unit || ''}</span></p>
                            <p><span className="font-medium">Normal Range/Expected:</span> {item.normalRangeOrExpected} {item.unit || ''}</p>
                          </div>
                          {item.interpretation && (
                            <p className="text-xs text-muted-foreground mt-1.5 italic whitespace-pre-wrap">Note: {item.interpretation}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                   <ReportIcon className="mr-2 h-5 w-5 text-primary" /> Key Findings Summary
                </h3>
                <p className="text-sm text-foreground whitespace-pre-wrap p-3 bg-muted rounded-md">{state.data.keyFindingsSummary}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" /> Personalized Recommendations
                </h3>
                <div className="text-sm text-foreground whitespace-pre-wrap p-3 bg-muted rounded-md">
                    {state.data.personalizedRecommendations?.split('\n').map((line, idx) => (
                        <p key={idx} className={line.trim().startsWith('- ') || line.trim().startsWith('* ') ? 'ml-4' : ''}>{line}</p>
                    ))}
                </div>
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
