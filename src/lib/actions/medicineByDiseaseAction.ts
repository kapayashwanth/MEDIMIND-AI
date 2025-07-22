
'use server';

import { 
  suggestMedicineByDisease, 
} from '@/ai/flows/medicine-by-disease-flow';
import { z } from 'zod';

const SuggestMedicineByDiseaseInputSchema = z.object({
  diseases: z.array(z.string()).min(1, 'At least one disease must be provided.'),
});

type SuggestedMedication = {
  name: string;
  frequency: string;
  sideEffects: string;
};

type SuggestMedicineByDiseaseOutput = {
  suggestions: SuggestedMedication[];
  disclaimer: string;
};

export type SuggestMedicineState = {
  message?: string | null;
  errors?: {
    diseases?: string[];
    server?: string[];
  };
  data?: SuggestMedicineByDiseaseOutput | null;
};

export async function suggestMedicineByDiseaseAction(
  prevState: SuggestMedicineState,
  formData: FormData
): Promise<SuggestMedicineState> {
  const validatedFields = SuggestMedicineByDiseaseInputSchema.safeParse({
    diseases: formData.getAll('diseases'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input.',
      data: null,
    };
  }

  const input = {
    diseases: validatedFields.data.diseases,
  };

  try {
    const result = await suggestMedicineByDisease(input);
    return {
      message: 'Suggestions retrieved successfully.',
      data: result,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
      return {
        message: 'The AI model is currently overloaded. Please try again in a few moments.',
        errors: { server: ['Model overloaded'] },
        data: null,
      };
    }
    return {
      message: `Server error: ${errorMessage}`,
      errors: { server: [errorMessage] },
      data: null,
    };
  }
}
