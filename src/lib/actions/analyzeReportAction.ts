
'use server';

import { analyzeMedicalReport } from '@/ai/flows/analyze-medical-report';
import { z } from 'zod';

const FormSchema = z.object({
  reportDataUri: z.string().min(1, "Report file is required."),
  patientInformation: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
});

// Re-define types here as they are no longer exported from the flow file
type TestResultItem = {
  testName: string;
  patientValue: string;
  normalRangeOrExpected: string;
  unit?: string;
  status: 'normal' | 'low' | 'high' | 'watch' | 'danger' | 'info';
  interpretation?: string;
};

type AnalyzeMedicalReportOutput = {
  overallRiskAssessment: string;
  keyFindingsSummary: string;
  detailedTestResults?: TestResultItem[];
  conciseSummary: string;
  personalizedRecommendations: string;
};

type AnalyzeMedicalReportInput = z.infer<typeof FormSchema>;

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
    if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
      return {
        message: 'The AI model is currently overloaded. Please try again in a few moments.',
        errors: { server: ['Model overloaded'] },
        data: null,
      };
    }
    return {
      message: `Server error: ${errorMessage}`,
      errors: { server: [errorMessage] },
      data: null,
    };
  }
}
