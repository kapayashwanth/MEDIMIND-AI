
'use server';

/**
 * @fileOverview An AI agent that interprets medical prescriptions.
 * It identifies medications and provides details on their purpose and side effects
 * based on general medical knowledge, and extracts other specifics from the document.
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
  dosage: z.string().optional().describe('Extracted from the prescription document if available: The prescribed dosage (e.g., "1 tablet", "10mg").'),
  timing: z.string().optional().describe('Extracted from the prescription document if available: The recommended timing for intake (e.g., "Twice daily", "Before meals").'),
  howToTake: z.string().optional().describe('Extracted from the prescription document if available: Detailed instructions on how to take the medication (e.g., with water, with/without food, do not crush).'),
  commonSideEffects: z.string().describe('Based on general medical knowledge: A list or summary of key common side effects associated with the medication.'),
  precautions: z.string().optional().describe('Extracted from the prescription document if available: Important precautions, warnings, or specific patient groups to be cautious with (e.g., pregnancy, kidney issues, allergies).'),
  storage: z.string().optional().describe('Extracted from the prescription document if available: Recommended storage conditions for the medication. If not specified on document, general advice may be provided (e.g., room temperature, refrigerate, protect from light).'),
  missedDose: z.string().optional().describe('Extracted from the prescription document if available: Advice on what to do if a dose is missed.'),
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
  prompt: `You are a medical expert specializing in interpreting prescriptions and providing drug information.
Analyze the following prescription document. For each medication identified:

1.  **Medication Name**: Extract the name of the medication *from the document*. This is crucial.

2.  **Purpose/Indication**: Based on your **general medical knowledge** of the identified medication, describe its primary purpose(s) or indication(s). Be specific. This information should come from your knowledge base, not solely from the document.

3.  **Common Side Effects**: Based on your **general medical knowledge** of the identified medication, list its key common side effects. This information should come from your knowledge base, not solely from the document.

4.  **Document-Derived Details**: For the following details, extract them *only if they are explicitly available on the provided prescription document*:
    *   Dosage (e.g., "1 tablet", "10mg")
    *   Timing (e.g., "Twice daily", "As needed")
    *   How to Take (e.g., with food, with water, do not crush)
    *   Precautions & Warnings (e.g., allergies, conditions to be aware of if mentioned on the document)
    *   Storage Instructions (from the document)
    *   Missed Dose Instructions (from the document)

    If any of these document-derived details (Dosage, Timing, How to Take, Precautions, Storage, Missed Dose) are not specified on the document, their value in the output schema should be "Not specified on document".
    Exception for Storage: If 'Storage Instructions' are not specified on the document for an identified medication, you may provide common general advice (e.g., "Store at room temperature away from moisture and heat, unless otherwise directed.").

Prescription: {{media url=prescriptionDataUri}}

Return the information structured according to the provided JSON schema. Ensure that 'name', 'purpose', and 'commonSideEffects' are always populated for each medication based on the instructions above. For other fields, populate if found on document or use "Not specified on document" as instructed. If a medication name cannot be reliably extracted, do not include an entry for it.`,
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
        purpose: med.purpose || 'Purpose not determined by AI.', 
        dosage: med.dosage || 'Not specified on document',
        timing: med.timing || 'Not specified on document',
        howToTake: med.howToTake || 'Not specified on document',
        commonSideEffects: med.commonSideEffects || 'Side effects not determined by AI.',
        precautions: med.precautions || 'Not specified on document',
        storage: med.storage || (med.name ? 'Store at room temperature away from moisture and heat, unless otherwise directed.' : 'Not specified on document'),
        missedDose: med.missedDose || 'Not specified on document',
    }));
    return { medications: processedMedications };
  }
);

