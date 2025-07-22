
'use server';

/**
 * @fileOverview An AI agent that suggests medications based on a list of diseases.
 *
 * - suggestMedicineByDisease - A function that handles fetching medicine suggestions.
 * - SuggestMedicineByDiseaseInput - The input type for the suggestMedicineByDisease function.
 * - SuggestMedicineByDiseaseOutput - The return type for the suggestMedicineByDisease function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestMedicineByDiseaseInputSchema = z.object({
  diseases: z.array(z.string()).min(1, 'At least one disease must be provided.'),
});
type SuggestMedicineByDiseaseInput = z.infer<typeof SuggestMedicineByDiseaseInputSchema>;

const SuggestedMedicationSchema = z.object({
  name: z.string().describe('The name of the suggested medication.'),
  reason: z.string().describe('A brief explanation of why this medication is suggested for the given disease(s).'),
});

const SuggestMedicineByDiseaseOutputSchema = z.object({
  suggestions: z.array(SuggestedMedicationSchema).describe('A list of suggested medications.'),
  disclaimer: z.string().describe('A mandatory disclaimer that this is not medical advice.'),
});
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
  prompt: `You are a medical information assistant. Based on the following disease(s), suggest potential medications.

Diseases:
{{#each diseases}}
- {{{this}}}
{{/each}}

For each suggested medication, provide its name and a brief reason for its use in relation to the specified disease(s).

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
