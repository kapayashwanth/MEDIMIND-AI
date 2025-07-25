
'use server';

import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { z } from 'zod';

const FormSchema = z.object({
  text: z.string().min(1, "Text to speak is required."),
  voice: z.string().optional(),
});

type TextToSpeechInput = z.infer<typeof FormSchema>;

export type TextToSpeechState = {
  audioDataUri?: string | null;
  error?: string | null;
};

export async function textToSpeechAction(
  formData: FormData
): Promise<TextToSpeechState> {
  const validatedFields = FormSchema.safeParse({
    text: formData.get('text'),
    voice: formData.get('voice'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid input for text-to-speech.',
    };
  }

  try {
    const result = await textToSpeech(validatedFields.data);
    if (result && result.audioDataUri) {
      return { audioDataUri: result.audioDataUri };
    } else {
      return { error: 'Text-to-speech generation failed to return audio.' };
    }
  } catch (error) {
    console.error('Error in textToSpeechAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded')) {
      return {
        error: 'The TTS model is currently overloaded. Please try again in a few moments.',
      };
    }
    return { error: `Server error: ${errorMessage}` };
  }
}
