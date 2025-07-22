
'use server';

/**
 * @fileOverview An AI agent to analyze medical test reports.
 * It extracts key test values, compares them to normal ranges,
 * assesses overall risk, and provides concise summaries and personalized recommendations.
 *
 * - analyzeMedicalReport - A function that handles the medical report analysis process.
 * - AnalyzeMedicalReportInput - The input type for the analyzeMedicalReport function.
 * - AnalyzeMedicalReportOutput - The return type for the analyzeMedicalReport function.
 * - TestResultItem - The type for individual test results within the output.
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
    .optional()
    .describe('Optional: Relevant patient information, such as medical history, symptoms.'),
  age: z.string().optional().describe("The patient's age."),
  gender: z.string().optional().describe("The patient's gender (e.g., Male, Female, Other)."),
});
type AnalyzeMedicalReportInput = z.infer<typeof AnalyzeMedicalReportInputSchema>;

const TestResultItemSchema = z.object({
  testName: z.string().describe('The name of the medical test or observation (e.g., "Hemoglobin", "Glucose Fasting", "Chest X-Ray Finding").'),
  patientValue: z.string().describe("The patient's value or the observed finding (e.g., '14.5 g/dL', '95 mg/dL', 'Small opacity in left lower lobe'). Include units if applicable."),
  normalRangeOrExpected: z.string().describe("The normal reference range for quantitative tests (e.g., '13.5-17.5 g/dL', '70-99 mg/dL') or the expected/normal finding for qualitative observations (e.g., 'No opacities', 'Clear lungs')."),
  unit: z.string().optional().describe("Unit for the patient's value and normal range, if applicable (e.g. 'mg/dL', 'g/dL'). This helps in structured display."),
  status: z.enum(['normal', 'low', 'high', 'watch', 'danger', 'info'])
    .describe("Status of the finding: 'normal' (implies within expected range), 'watch' (for borderline or mildly abnormal findings needing observation), 'danger' (for significantly abnormal or critical findings), 'low' (value is significantly low), 'high' (value is significantly high), 'info' (for general qualitative observations that aren't specific deviations but part of the report)."),
  interpretation: z.string().optional().describe("A very concise interpretation if the status is not 'normal' or 'info'. Max 1-2 short sentences.")
});
type TestResultItem = z.infer<typeof TestResultItemSchema>;

const AnalyzeMedicalReportOutputSchema = z.object({
  overallRiskAssessment: z
    .string()
    .describe('Overall risk assessment based on all findings. Categorize as "Normal", "Watch", or "Danger". Explain the reasoning very concisely (1-2 sentences).'),
  keyFindingsSummary: z
    .string()
    .describe('A very concise summary (2-3 sentences max) highlighting the most critical abnormal findings from the detailed test results. If all results are normal, state that clearly.'),
  detailedTestResults: z.array(TestResultItemSchema)
    .optional()
    .describe('An array of specific test results and observations extracted from the report. Focus on quantifiable metrics and significant qualitative findings.'),
  conciseSummary: z
    .string()
    .describe('A brief, overall summary of the report type and general content (1-2 sentences max).'),
  personalizedRecommendations: z
    .string()
    .describe('Concise, actionable health recommendations (2-3 short bullet points max or a brief paragraph) based on the report, patient information, and risk assessment. Focus on next steps or questions for a doctor.'),
});
type AnalyzeMedicalReportOutput = z.infer<typeof AnalyzeMedicalReportOutputSchema>;

export async function analyzeMedicalReport(
  input: AnalyzeMedicalReportInput
): Promise<AnalyzeMedicalReportOutput> {
  return analyzeMedicalReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMedicalReportPrompt',
  input: {schema: AnalyzeMedicalReportInputSchema},
  output: {schema: AnalyzeMedicalReportOutputSchema},
  prompt: `You are an expert medical AI assistant. Analyze the provided medical test report and patient information. Your primary goal is to extract structured test results and provide concise, actionable insights.

Patient Information:
{{#if patientInformation}}- General: {{{patientInformation}}}{{else}}- General: No additional patient information provided.{{/if}}
{{#if age}}- Age: {{{age}}}{{/if}}
{{#if gender}}- Gender: {{{gender}}}{{/if}}

Report Data: {{media url=reportDataUri}}

Based on all the provided information, please perform the following:

1.  **Detailed Test Results**:
    *   For each significant quantifiable test found in the report (e.g., blood tests, vitals), extract:
        *   \\\`testName\\\`: The name of the test.
        *   \\\`patientValue\\\`: The patient's result for that test, including units.
        *   \\\`normalRangeOrExpected\\\`: The normal reference range for that test, including units.
        *   \\\`unit\\\`: The measurement unit (e.g., mg/dL, g/dL).
        *   \\\`status\\\`: Categorize the patient's value:
            *   'normal': If within the normal range.
            *   'low': If significantly below the normal range and concerning.
            *   'high': If significantly above the normal range and concerning.
            *   'watch': If borderline or mildly outside the normal range, warranting observation.
            *   'danger': If critically outside the normal range, indicating potential immediate concern.
        *   \\\`interpretation\\\`: A *very brief* (1-2 sentences max) explanation if the status is not 'normal'.
    *   For significant qualitative findings (e.g., from imaging reports like X-rays, MRIs):
        *   \\\`testName\\\`: A descriptive name for the observation (e.g., "Lung Field Observation", "Bone Structure Finding").
        *   \\\`patientValue\\\`: The observed finding (e.g., "Clear to auscultation", "No acute fracture identified", "Small opacity noted in left lower lobe").
        *   \\\`normalRangeOrExpected\\\`: The expected or normal finding (e.g., "Clear", "No fracture", "No opacity").
        *   \\\`status\\\`:
            *   'normal': If the finding is as expected.
            *   'info': For descriptive findings that are part of the report but not necessarily deviations.
            *   'watch': For findings that are mildly abnormal or need follow-up.
            *   'danger': For significant abnormal findings (e.g., "Large mass detected").
        *   \\\`interpretation\\\`: A *very brief* explanation if the status is not 'normal' or 'info'.
    *   Populate the \\\`detailedTestResults\\\` array with these structured items. Be selective; focus on the most relevant results.

2.  **Concise Summary**: Provide a very brief (1-2 sentences) overall summary of what the report is (e.g., "This is a blood panel report focusing on metabolic markers.").

3.  **Key Findings Summary**: Based *only* on the \\\`detailedTestResults\\\`, write a very concise summary (2-3 sentences max) of the *most critical abnormal findings*. If all tests are normal, state "All key results are within normal limits."

4.  **Overall Risk Assessment**: Based on the entirety of the report and findings, determine an overall risk level. Categorize as "Normal", "Watch", or "Danger". Briefly (1-2 sentences) explain your reasoning.

5.  **Personalized Recommendations**: Generate 2-3 short, actionable bullet points or a brief paragraph for personalized health recommendations. These should be based on the report, patient info (age, gender if provided), and risk assessment. Focus on potential next steps or important questions to ask a healthcare professional. Be very concise.

IMPORTANT: Adhere strictly to the output JSON schema. Ensure all narrative fields are extremely concise as specified. Prioritize accuracy in extracting test values and ranges.`,
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
    // Ensure all required fields are present, even if empty strings or default values, to match schema
    return {
      overallRiskAssessment: output.overallRiskAssessment || 'Risk assessment not determined.',
      keyFindingsSummary: output.keyFindingsSummary || 'No key findings summary provided.',
      detailedTestResults: output.detailedTestResults || [],
      conciseSummary: output.conciseSummary || 'No overall summary provided.',
      personalizedRecommendations: output.personalizedRecommendations || 'No specific recommendations generated.',
    };
  }
);
