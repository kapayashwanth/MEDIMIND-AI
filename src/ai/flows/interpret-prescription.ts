
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
  expectedDisease: z.string().describe('Based on the medication and its purpose, what is the likely disease or condition it is prescribed for (e.g., "Hypertension", "Type 2 Diabetes", "Bacterial Infection").'),
});

const InterpretPrescriptionOutputSchema = z.object({
  medications: z.array(MedicationDetailsSchema).describe('An array of medications with their details.'),
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
Analyze the following prescription document. For each medication identified:

1.  **Medication Name**: Extract the name of the medication *from the document*.
2.  **Purpose/Indication**: Based on your **general medical knowledge** of the identified medication, describe its primary purpose(s) or indication(s).
3.  **Common Side Effects**: Based on your **general medical knowledge**, list its key common side effects.
4.  **Expected Disease**: Based on the medication and its purpose, infer the likely **disease or condition** it is prescribed to treat (e.g., "Hypertension", "Type 2 Diabetes", "Bacterial Infection").

Prescription: {{media url=prescriptionDataUri}}

Return the information structured according to the provided JSON schema. Ensure all fields are populated for each medication. If a medication name cannot be reliably extracted, do not include an entry for it.`,
});

const interpretPrescriptionFlow = ai.defineFlow(
  {
    name: 'interpretPrescriptionFlow',
    inputSchema: InterpretPrescriptionInputSchema,
    outputSchema: InterpretPrescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.medications) {
        return { medications: [] };
    }
    // Ensure all required fields have a default value if not provided by AI
    const processedMedications = output.medications.map(med => ({
        name: med.name || 'Unnamed Medication',
        purpose: med.purpose || 'Purpose not determined by AI.',
        commonSideEffects: med.commonSideEffects || 'Side effects not determined by AI.',
        expectedDisease: med.expectedDisease || 'Expected disease not determined by AI.',
    }));
    return { medications: processedMedications };
  }
);
