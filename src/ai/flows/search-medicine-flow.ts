'use server';
/**
 * @fileOverview An AI agent that provides information about a specific medicine.
 *
 * - searchMedicine - A function that handles fetching medicine details.
 * - SearchMedicineInput - The input type for the searchMedicine function.
 * - MedicineInformationOutput - The return type for the searchMedicine function (conforms to Medicine type).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Medicine as MedicineInformationOutput } from '@/types'; // Use existing Medicine type for output

const SearchMedicineInputSchema = z.object({
  searchTerm: z.string().describe('The name of the medicine to search for.'),
});
export type SearchMedicineInput = z.infer<typeof SearchMedicineInputSchema>;

// Define a Zod schema that matches the Medicine type from @/types
// Making imageUrl and imageHint optional as AI might not always find them.
const MedicineOutputSchema = z.object({
  name: z.string().describe('The common name of the medicine.'),
  description: z.string().describe('A brief description of the medicine and what it is.'),
  usage: z.string().describe('How the medicine is typically used, its indications, and what it treats.'),
  dosageForms: z.array(z.string()).describe('Common dosage forms (e.g., tablet, capsule, syrup).'),
  commonSideEffects: z.array(z.string()).describe('A list of common side effects.'),
  imageUrl: z.string().optional().describe('A publicly accessible URL for an image of the medicine, if available. Otherwise, omit.'),
  imageHint: z.string().optional().describe('A 1-2 word hint for the image (e.g., "pills capsules", "syrup bottle"). Otherwise, omit.'),
});

export async function searchMedicine(input: SearchMedicineInput): Promise<MedicineInformationOutput | null> {
  return searchMedicineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchMedicinePrompt',
  input: {schema: SearchMedicineInputSchema},
  output: {schema: MedicineOutputSchema},
  prompt: `You are a helpful medical information assistant.
The user is searching for information about a medicine.
Medicine Name: {{{searchTerm}}}

Based on your knowledge, please provide the following details for this medicine:
1.  **Name**: The common name of the medicine.
2.  **Description**: A brief description of what the medicine is.
3.  **Usage**: What this medicine is typically used for and its main indications.
4.  **Dosage Forms**: Common ways this medicine is available (e.g., tablet, capsule, liquid). List them as an array of strings.
5.  **Common Side Effects**: A list of common side effects associated with this medicine. List them as an array of strings.
6.  **Image Hint**: Provide a 1-2 word hint for an image of the medicine (e.g., "pills capsules", "syrup bottle"). Do not provide a URL.

Return the information structured according to the provided JSON output schema.
If you cannot find reliable information for the specified medicine, return null for all fields or indicate that the medicine was not found.
Focus on providing accurate and general information.
`,
});

const searchMedicineFlow = ai.defineFlow(
  {
    name: 'searchMedicineFlow',
    inputSchema: SearchMedicineInputSchema,
    outputSchema: z.nullable(MedicineOutputSchema), // Output can be null if not found
  },
  async (input: SearchMedicineInput) => {
    const {output} = await prompt(input);
    
    if (!output || !output.name) { // If no name, assume not found
      return null;
    }

    // Ensure array fields are arrays even if AI returns single string (though schema should prevent this)
    const dosageForms = Array.isArray(output.dosageForms) ? output.dosageForms : (output.dosageForms ? [output.dosageForms as any] : []);
    const commonSideEffects = Array.isArray(output.commonSideEffects) ? output.commonSideEffects : (output.commonSideEffects ? [output.commonSideEffects as any] : []);
    
    return {
      name: output.name,
      description: output.description || 'Description not available.',
      usage: output.usage || 'Usage information not available.',
      dosageForms: dosageForms,
      commonSideEffects: commonSideEffects,
      // Always use a placeholder and rely on the hint.
      imageUrl: `https://placehold.co/600x400.png`,
      imageHint: output.imageHint || 'medicine',
    };
  }
);
