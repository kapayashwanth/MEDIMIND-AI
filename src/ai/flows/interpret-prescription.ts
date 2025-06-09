
'use server';

/**
 * @fileOverview An AI agent that interprets medical prescriptions.
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
  name: z.string().describe('The name of the medication.'),
  purpose: z.string().describe('The primary purpose or indication for the medication. Be specific.'),
  dosage: z.string().describe('The prescribed dosage of the medication (e.g., "1 tablet", "10mg").'),
  timing: z.string().describe('The recommended timing for intake (e.g., "Twice daily", "Before meals").'),
  howToTake: z.string().optional().describe('Detailed instructions on how to take the medication (e.g., with water, with/without food, do not crush).'),
  commonSideEffects: z.string().optional().describe('A list or summary of key common side effects associated with the medication.'),
  precautions: z.string().optional().describe('Important precautions, warnings, or specific patient groups to be cautious with (e.g., pregnancy, kidney issues, allergies).'),
  storage: z.string().optional().describe('Recommended storage conditions for the medication (e.g., room temperature, refrigerate, protect from light).'),
  missedDose: z.string().optional().describe('Advice on what to do if a dose is missed.'),
});

const InterpretPrescriptionOutputSchema = z.object({
  medications: z.array(MedicationDetailsSchema).describe('An array of medications and their details.'),
});
export type InterpretPrescriptionOutput = z.infer<typeof InterpretPrescriptionOutputSchema>;

export async function interpretPrescription(input: InterpretPrescriptionInput): Promise<InterpretPrescriptionOutput> {
  return interpretPrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretPrescriptionPrompt',
  input: {schema: InterpretPrescriptionInputSchema},
  output: {schema: InterpretPrescriptionOutputSchema},
  prompt: `You are a medical expert specializing in interpreting prescriptions.

Analyze the following prescription document. For each medication identified, it is CRUCIAL to extract:
- Medication Name
- Purpose/Indication (What is this medication primarily used for? Be specific.)
- Common Side Effects (List key common side effects.)

Also extract the following details if available from the document:
- Dosage (e.g., "1 tablet", "10mg")
- Timing (e.g., "Twice daily", "As needed")
- How to Take (e.g., with food, with water, do not crush)
- Precautions & Warnings (e.g., allergies, conditions to be aware of)
- Storage Instructions
- Missed Dose Instructions (What to do if a dose is missed)

If information for a field (especially Purpose/Indication or Common Side Effects) is not explicitly stated on the prescription, you MUST indicate "Not specified on document" for that field. For other fields like storage, if not specified, you may provide common general advice (e.g., "Store at room temperature unless otherwise specified").

Prescription: {{media url=prescriptionDataUri}}

Return the information structured according to the provided JSON schema. Ensure that 'Purpose/Indication' and 'Common Side Effects' are always populated, even if it's to state they were not found on the document or are not applicable.`,
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
    // Ensure all optional fields have a default value if not provided by AI, or retain AI's "Not specified..."
    const processedMedications = output.medications.map(med => ({
        name: med.name || 'Unnamed Medication',
        purpose: med.purpose || 'Not specified', 
        dosage: med.dosage || 'Not specified',
        timing: med.timing || 'Not specified',
        howToTake: med.howToTake || 'Not specified',
        commonSideEffects: med.commonSideEffects || 'Not specified',
        precautions: med.precautions || 'Not specified',
        storage: med.storage || 'Not specified',
        missedDose: med.missedDose || 'Not specified',
    }));
    return { medications: processedMedications };
  }
);

