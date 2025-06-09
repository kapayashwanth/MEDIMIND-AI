'use server';

/**
 * @fileOverview An AI agent to analyze medical test reports and highlight potential key findings.
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
      "A medical test report (e.g., X-ray, MRI) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  patientInformation: z
    .string()
    .describe('Relevant patient information, such as medical history.'),
});
export type AnalyzeMedicalReportInput = z.infer<typeof AnalyzeMedicalReportInputSchema>;

const AnalyzeMedicalReportOutputSchema = z.object({
  keyFindings: z
    .string()
    .describe('Key findings highlighted from the medical test report.'),
  summary: z.string().describe('A concise summary of the report analysis.'),
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
  prompt: `You are a medical AI assistant specializing in analyzing medical test reports.

You will analyze the provided medical test report and highlight potential key findings.
Consider the patient's information when analyzing the report.

Patient Information: {{{patientInformation}}}

Report: {{media url=reportDataUri}}

Key Findings:`,
});

const analyzeMedicalReportFlow = ai.defineFlow(
  {
    name: 'analyzeMedicalReportFlow',
    inputSchema: AnalyzeMedicalReportInputSchema,
    outputSchema: AnalyzeMedicalReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
