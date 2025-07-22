
'use server';

import { 
  suggestMedicineByDisease, 
  SuggestMedicineByDiseaseInput, 
  SuggestMedicineByDiseaseOutput,
  SuggestMedicineByDiseaseInputSchema
} from '@/ai/flows/medicine-by-disease-flow';

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

  const input: SuggestMedicineByDiseaseInput = {
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
    return {
      message: `Server error: ${errorMessage}`,
      errors: { server: [errorMessage] },
      data: null,
    };
  }
}
