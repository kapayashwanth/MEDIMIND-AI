
'use server';

import { 
  suggestMedicineByDisease, 
} from '@/ai/flows/medicine-by-disease-flow';
import { z } from 'zod';

// Define the schema inside the action file, as it's the only place it's used for validation.
const SuggestMedicineByDiseaseInputSchema = z.object({
  diseases: z.array(z.string()).min(1, 'At least one disease must be provided.'),
});

// Re-define types needed for the action's state, as they are no longer exported from the flow.
type SuggestedMedication = {
  name: string;
  reason: string;
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

  // The 'suggestMedicineByDisease' function still expects the same input structure,
  // we just don't need to import the type explicitly anymore.
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
    return {
      message: `Server error: ${errorMessage}`,
      errors: { server: [errorMessage] },
      data: null,
    };
  }
}
