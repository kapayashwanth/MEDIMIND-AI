
'use server';

import { searchMedicine } from '@/ai/flows/search-medicine-flow';
import type { Medicine } from '@/types';
import { z } from 'zod';

const FormSchema = z.object({
  searchTerm: z.string().min(1, "Search term cannot be empty."),
});

// This type is used by the searchMedicine function.
// It's defined here because the flow file cannot export types.
export type SearchMedicineInput = {
  searchTerm: string;
};


export type SearchMedicineState = {
  message?: string | null;
  errors?: {
    searchTerm?: string[];
    server?: string[];
  };
  data?: Medicine | null; // Can be a single Medicine object or null
};

export async function searchMedicineAction(
  prevState: SearchMedicineState,
  formData: FormData
): Promise<SearchMedicineState> {
  const validatedFields = FormSchema.safeParse({
    searchTerm: formData.get('searchTerm'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid search term.',
      data: null,
    };
  }

  const input: SearchMedicineInput = {
    searchTerm: validatedFields.data.searchTerm,
  };

  try {
    const result = await searchMedicine(input);
    if (result) {
      return {
        message: 'Medicine information retrieved successfully.',
        data: result,
      };
    } else {
      return {
        message: `No information found for "${input.searchTerm}".`,
        data: null,
      };
    }
  } catch (error)
 {
    console.error('Error searching medicine:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while searching for medicine.';
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
