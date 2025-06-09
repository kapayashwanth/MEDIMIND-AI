'use server';

import { analyzeMedicalReport, AnalyzeMedicalReportInput, AnalyzeMedicalReportOutput } from '@/ai/flows/analyze-medical-report';
import { z } from 'zod';

const FormSchema = z.object({
  reportDataUri: z.string().min(1, "Report file is required."),
  patientInformation: z.string().min(1, "Patient information is required."),
});

export type AnalyzeReportState = {
  message?: string | null;
  errors?: {
    reportDataUri?: string[];
    patientInformation?: string[];
    server?: string[];
  };
  data?: AnalyzeMedicalReportOutput | null;
};

export async function analyzeReportAction(
  prevState: AnalyzeReportState,
  formData: FormData
): Promise<AnalyzeReportState> {
  const validatedFields = FormSchema.safeParse({
    reportDataUri: formData.get('reportDataUri'),
    patientInformation: formData.get('patientInformation'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input.',
    };
  }

  const input: AnalyzeMedicalReportInput = {
    reportDataUri: validatedFields.data.reportDataUri,
    patientInformation: validatedFields.data.patientInformation,
  };

  try {
    const result = await analyzeMedicalReport(input);
    if (result && result.keyFindings && result.summary) {
      return {
        message: 'Report analyzed successfully.',
        data: result,
      };
    } else {
      return {
        message: 'AI analysis returned incomplete data. Please try again.',
        errors: { server: ['AI analysis returned incomplete data.'] },
      };
    }
  } catch (error) {
    console.error('Error analyzing report:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `Server error: ${errorMessage}`,
      errors: { server: [errorMessage] },
    };
  }
}
