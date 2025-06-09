
'use server';

import { analyzeMedicalReport, AnalyzeMedicalReportInput, AnalyzeMedicalReportOutput } from '@/ai/flows/analyze-medical-report';
import { z } from 'zod';

const FormSchema = z.object({
  reportDataUri: z.string().min(1, "Report file is required."),
  patientInformation: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
});

export type AnalyzeReportState = {
  message?: string | null;
  errors?: {
    reportDataUri?: string[];
    patientInformation?: string[];
    age?: string[];
    gender?: string[];
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
    age: formData.get('age'),
    gender: formData.get('gender'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input.',
      data: null,
    };
  }

  const input: AnalyzeMedicalReportInput = {
    reportDataUri: validatedFields.data.reportDataUri,
    patientInformation: validatedFields.data.patientInformation,
    age: validatedFields.data.age,
    gender: validatedFields.data.gender === 'unspecified' ? undefined : validatedFields.data.gender,
  };

  try {
    const result = await analyzeMedicalReport(input);
    if (result && result.overallRiskAssessment && result.conciseSummary && result.personalizedRecommendations) {
      return {
        message: 'Report analyzed successfully.',
        data: result,
      };
    } else {
      return {
        message: 'AI analysis returned incomplete data. Please ensure all key fields were processed.',
        errors: { server: ['AI analysis returned incomplete data.'] },
        data: null,
      };
    }
  } catch (error) {
    console.error('Error analyzing report:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `Server error: ${errorMessage}`,
      errors: { server: [errorMessage] },
      data: null,
    };
  }
}
