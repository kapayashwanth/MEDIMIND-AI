
'use server';

/**
 * @fileOverview An AI agent that interprets medical prescriptions.
 * It identifies medications and provides details on their purpose, common side effects,
 * and the likely disease they are prescribed for, based on general medical knowledge.
 *
 * - interpretPrescription - A function that handles the prescription interpretation process.
 * - InterpretPrescriptionInput - The input type for the interpretPrescription function.
 * - InterpretPrescriptionOutput - The return type for the interpretPrescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretPrescriptionInputSchema = z.object({
  prescriptionDataUri: z
    .string()
    .describe(
      "A prescription document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type InterpretPrescriptionInput = z.infer<typeof InterpretPrescriptionInputSchema>;

const MedicationDetailsSchema = z.object({
  name: z.string().describe('The name of the medication, extracted from the prescription document.'),
  purpose: z.string().describe('Based on general medical knowledge: The primary purpose or indication for the medication. Be specific.'),
  commonSideEffects: z.string().describe('Based on general medical knowledge: A list or summary of key common side effects associated with the medication.'),
});

const DiseaseMedicationsSchema = z.object({
    expectedDisease: z.string().describe('Based on the medications, what is the likely disease or condition they are prescribed for (e.g., "Hypertension", "Type 2 Diabetes", "Bacterial Infection").'),
    medications: z.array(MedicationDetailsSchema).describe('An array of medications prescribed for this disease.'),
});

const InterpretPrescriptionOutputSchema = z.object({
  analysis: z.array(DiseaseMedicationsSchema).describe('An array of diseases, each with a list of associated medications.'),
});
export type InterpretPrescriptionOutput = z.infer<typeof InterpretPrescriptionOutputSchema>;

export async function interpretPrescription(input: InterpretPrescriptionInput): Promise<InterpretPrescriptionOutput> {
  return interpretPrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretPrescriptionPrompt',
  input: {schema: InterpretPrescriptionInputSchema},
  output: {schema: InterpretPrescriptionOutputSchema},
  prompt: `You are a medical expert specializing in interpreting prescriptions and providing drug information.
Analyze the following prescription document. Group the identified medications by the likely disease they treat.

1.  **Group by Disease**: For each likely disease or condition (e.g., "Hypertension", "Type 2 Diabetes"), create a grouping.
2.  **List Medications**: Within each disease group, list all the medications prescribed for it.
3.  **Provide Details**: For each medication, provide:
    *   \\\`name\\\`: The name of the medication *from the document*.
    *   \\\`purpose\\\`: Its primary purpose or indication.
    *   \\\`commonSideEffects\\\`: Its key common side effects.

Prescription: {{media url=prescriptionDataUri}}

Return the information structured according to the provided JSON schema, with an array of diseases, each containing its list of medications.`,
});

const interpretPrescriptionFlow = ai.defineFlow(
  {
    name: 'interpretPrescriptionFlow',
    inputSchema: InterpretPrescriptionInputSchema,
    outputSchema: InterpretPrescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.analysis) {
        return { analysis: [] };
    }
    // Ensure all required fields have a default value if not provided by AI
    const processedAnalysis = output.analysis.map(diseaseGroup => ({
        expectedDisease: diseaseGroup.expectedDisease || 'Undetermined Condition',
        medications: diseaseGroup.medications.map(med => ({
            name: med.name || 'Unnamed Medication',
            purpose: med.purpose || 'Purpose not determined by AI.',
            commonSideEffects: med.commonSideEffects || 'Side effects not determined by AI.',
        }))
    }));
    return { analysis: processedAnalysis };
  }
);
