
'use server';

import { interpretPrescription, InterpretPrescriptionInput, InterpretPrescriptionOutput } from '@/ai/flows/interpret-prescription';
import { z } from 'zod';

const FormSchema = z.object({
  prescriptionDataUri: z.string().min(1, "Prescription file is required."),
});

export type InterpretPrescriptionState = {
  message?: string | null;
  errors?: {
    prescriptionDataUri?: string[];
    server?: string[];
  };
  data?: InterpretPrescriptionOutput | null;
};

export async function interpretPrescriptionAction(
  prevState: InterpretPrescriptionState,
  formData: FormData
): Promise<InterpretPrescriptionState> {
  const validatedFields = FormSchema.safeParse({
    prescriptionDataUri: formData.get('prescriptionDataUri'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input.',
      data: null,
    };
  }

  const input: InterpretPrescriptionInput = {
    prescriptionDataUri: validatedFields.data.prescriptionDataUri,
  };

  try {
    const result = await interpretPrescription(input);
    // A successful response can include an empty array of medications.
    // The check should be for a valid `result` object, not whether it contains items.
    if (result && result.medications !== undefined) {
      return {
        message: 'Prescription interpreted successfully.',
        data: result,
      };
    } else {
      return {
        message: 'AI analysis returned an invalid response. Please try again.',
        errors: { server: ['AI analysis returned an invalid response.'] },
        data: null,
      };
    }
  } catch (error) {
    console.error('Error interpreting prescription:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `Server error: ${errorMessage}`,
      errors: { server: [errorMessage] },
      data: null,
    };
  }
}
