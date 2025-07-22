
'use client';

import { useState, ChangeEvent, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { interpretPrescriptionAction, InterpretPrescriptionState } from '@/lib/actions/interpretPrescriptionAction';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  FileUp, AlertCircle, CheckCircle2, Pill, Target, Download, HeartPulse,
  AlertTriangle as SideEffectsIcon, FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const initialState: InterpretPrescriptionState = {
  message: null,
  errors: {},
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <LoadingSpinner size="sm" /> : 'Interpret Prescription'}
    </Button>
  );
}

export default function InterpretPrescriptionPage() {
  const [state, formAction] = useActionState(interpretPrescriptionAction, initialState);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionDataUri, setPrescriptionDataUri] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPrescriptionFile(file);
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setPrescriptionDataUri(dataUri);
        if(file.type.startsWith('image/')) {
          setPreviewUrl(dataUri);
        } else {
          setPreviewUrl(''); // It's not an image, clear any previous preview
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPrescriptionFile(null);
      setPrescriptionDataUri('');
      setFileName('');
      setPreviewUrl('');
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
        pdf.save('MediMind_AI_Prescription_Summary.pdf');
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    }
  };

  const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => {
    const displayValue = (value && value.trim() !== '') ? value : 'Information not available';
    return (
      <div className="flex items-start gap-2">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">{label}:</p>
          <p className={`text-sm whitespace-pre-wrap ${displayValue === 'Information not available' ? 'text-muted-foreground italic' : 'text-foreground'}`}>
            {displayValue}
          </p>
        </div>
      </div>
    );
  };


  return (
    <>
      <PageHeader title="Interpret Prescription" />
      <main className="flex-1 p-6">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Upload Prescription</CardTitle>
            <CardDescription>
              Upload a medical prescription document for AI-powered interpretation of medication uses and side effects.
            </CardDescription>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prescriptionFile">Prescription File</Label>
                 <div className="flex items-center justify-center w-full">
                    <label htmlFor="prescriptionFile" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">Images (PNG, JPG, etc.) or PDF</p>
                        </div>
                        <Input id="prescriptionFile" name="prescriptionFile" type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
                    </label>
                </div>

                {previewUrl && (
                    <div className="mt-4">
                        <Image src={previewUrl} alt="Prescription preview" width={500} height={300} className="rounded-lg object-contain mx-auto border" />
                    </div>
                )}
                
                {fileName && !previewUrl && (
                  <div className="mt-4 flex items-center justify-center text-muted-foreground bg-muted/50 p-4 rounded-lg">
                    <FileText className="h-6 w-6 mr-2" />
                    <p className="text-sm font-medium">Selected file: {fileName}</p>
                  </div>
                )}
                
                <input type="hidden" name="prescriptionDataUri" value={prescriptionDataUri} />
                {state.errors?.prescriptionDataUri && (
                  <p className="text-sm font-medium text-destructive">{state.errors.prescriptionDataUri[0]}</p>
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

        {state.data && state.data.medications && (
          <Card className="max-w-2xl mx-auto mt-8 shadow-xl" ref={resultsRef}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-2xl">Prescription Details</CardTitle>
                <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {state.data.medications.length > 0 ? (
                <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                  {state.data.medications.map((med, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Pill className="h-5 w-5 text-primary" /> 
                          {med.name || 'Unnamed Medication'}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pl-2 pr-2 pt-2">
                        <DetailItem icon={HeartPulse} label="Likely For Disease" value={(med as any).expectedDisease} />
                        <DetailItem icon={Target} label="Purpose / Indication" value={med.purpose} />
                        <DetailItem icon={SideEffectsIcon} label="Common Side Effects" value={med.commonSideEffects} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground">No medications found or prescription could not be fully interpreted.</p>
              )}
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">AI interpretation provides potential insights and is not a substitute for professional medical advice. Always confirm with your doctor or pharmacist.</p>
            </CardFooter>
          </Card>
        )}
      </main>
    </>
  );
}
