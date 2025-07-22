
'use server';

/**
 * @fileOverview An AI agent that suggests medications based on a list of diseases.
 *
 * - suggestMedicineByDisease - A function that handles fetching medicine suggestions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input schema is now internal to this file
const SuggestMedicineByDiseaseInputSchema = z.object({
  diseases: z.array(z.string()).min(1, 'At least one disease must be provided.'),
});

const SuggestedMedicationSchema = z.object({
  name: z.string().describe('The brand name or generic name of the suggested medication (e.g., Paracetamol, Dolo 650).'),
  frequency: z.string().describe('The typical frequency for taking the medicine (e.g., "Once a day", "Twice a day after meals").'),
  sideEffects: z.string().describe('A brief list or summary of common side effects.'),
});

// Output schema is now internal to this file
const SuggestMedicineByDiseaseOutputSchema = z.object({
  suggestions: z.array(SuggestedMedicationSchema).describe('A list of suggested medications with their details.'),
  disclaimer: z.string().describe('A mandatory disclaimer that this is not medical advice.'),
});

// Type aliases for internal use
type SuggestMedicineByDiseaseInput = z.infer<typeof SuggestMedicineByDiseaseInputSchema>;
type SuggestMedicineByDiseaseOutput = z.infer<typeof SuggestMedicineByDiseaseOutputSchema>;


export async function suggestMedicineByDisease(
  input: SuggestMedicineByDiseaseInput
): Promise<SuggestMedicineByDiseaseOutput> {
  return suggestMedicineByDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMedicineByDiseasePrompt',
  input: { schema: SuggestMedicineByDiseaseInputSchema },
  output: { schema: SuggestMedicineByDiseaseOutputSchema },
  prompt: `You are a medical information assistant. Based on the following disease(s), suggest common medications, including well-known brand names where applicable (e.g., for Fever, suggest Paracetamol and Dolo 650).

Diseases:
{{#each diseases}}
- {{{this}}}
{{/each}}

For each suggested medication, provide:
1.  **name**: The generic or common brand name of the medicine.
2.  **frequency**: The typical frequency of intake (e.g., "Twice a day after meals").
3.  **sideEffects**: A brief summary of common side effects.

Finally, provide a clear and direct disclaimer that this information is for educational purposes only and is not a substitute for professional medical advice. The user must consult a healthcare professional before taking any medication.
`,
});

const suggestMedicineByDiseaseFlow = ai.defineFlow(
  {
    name: 'suggestMedicineByDiseaseFlow',
    inputSchema: SuggestMedicineByDiseaseInputSchema,
    outputSchema: SuggestMedicineByDiseaseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI analysis did not return an output.');
    }
    return {
      suggestions: output.suggestions || [],
      disclaimer: output.disclaimer || 'Disclaimer: The information provided is for educational purposes only and is not a substitute for professional medical advice. Always consult a healthcare provider for any health concerns or before starting any new treatment.',
    };
  }
);
