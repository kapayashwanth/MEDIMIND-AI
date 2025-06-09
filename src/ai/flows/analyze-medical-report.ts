'use server';

/**
 * @fileOverview An AI agent to analyze medical test reports and highlight potential key findings,
 * assess risk, and provide personalized recommendations.
 *
 * - analyzeMedicalReport - A function that handles the medical report analysis process.
 * - AnalyzeMedicalReportInput - The input type for the analyzeMedicalReport function.
 * - AnalyzeMedicalReportOutput - The return type for the analyzeMedicalReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMedicalReportInputSchema = z.object({
  reportDataUri: z
    .string()
    .describe(
      "A medical test report (e.g., X-ray, MRI, lab results) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  patientInformation: z
    .string()
    .describe('Relevant patient information, such as medical history, symptoms.'),
  age: z.string().optional().describe("The patient's age."),
  gender: z.string().optional().describe("The patient's gender."),
});
export type AnalyzeMedicalReportInput = z.infer<typeof AnalyzeMedicalReportInputSchema>;

const AnalyzeMedicalReportOutputSchema = z.object({
  keyFindings: z
    .string()
    .describe('Key findings highlighted from the medical test report. Be comprehensive and specific.'),
  summary: z.string().describe('A concise summary of the report analysis.'),
  riskAssessment: z
    .string()
    .describe('Overall risk assessment based on the findings. Categorize as "Normal", "Watch", or "Danger". Explain the reasoning for the assessment.'),
  personalizedRecommendations: z
    .string()
    .describe('Personalized health recommendations based on the report, patient information (including age and gender if provided), and risk assessment. Offer actionable advice.'),
});
export type AnalyzeMedicalReportOutput = z.infer<typeof AnalyzeMedicalReportOutputSchema>;

export async function analyzeMedicalReport(
  input: AnalyzeMedicalReportInput
): Promise<AnalyzeMedicalReportOutput> {
  return analyzeMedicalReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMedicalReportPrompt',
  input: {schema: AnalyzeMedicalReportInputSchema},
  output: {schema: AnalyzeMedicalReportOutputSchema},
  prompt: `You are an advanced medical AI assistant. Your task is to analyze the provided medical test report and patient information.

Patient Information:
- General: {{{patientInformation}}}
{{#if age}}- Age: {{{age}}}{{/if}}
{{#if gender}}- Gender: {{{gender}}}{{/if}}

Report Data: {{media url=reportDataUri}}

Based on all the provided information, please:
1.  Identify and list all significant Key Findings from the report. Be thorough.
2.  Provide a concise Summary of the analysis.
3.  Determine an overall Risk Assessment. This should be categorized as "Normal", "Watch", or "Danger". Clearly state the category and briefly explain your reasoning based on the findings.
4.  Generate Personalized Recommendations. These should be actionable and tailored to the patient, considering their report, provided information (age, gender, history), and the risk assessment. Focus on potential next steps, lifestyle adjustments, or questions to ask a healthcare professional.

Ensure your output strictly follows the defined JSON schema.`,
});

const analyzeMedicalReportFlow = ai.defineFlow(
  {
    name: 'analyzeMedicalReportFlow',
    inputSchema: AnalyzeMedicalReportInputSchema,
    outputSchema: AnalyzeMedicalReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI analysis did not return an output.');
    }
    // Ensure all required fields are present, even if empty strings, to match schema
    return {
      keyFindings: output.keyFindings || '',
      summary: output.summary || '',
      riskAssessment: output.riskAssessment || 'Not Determined',
      personalizedRecommendations: output.personalizedRecommendations || 'No specific recommendations generated.',
    };
  }
);
