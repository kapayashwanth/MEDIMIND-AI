
'use server';

import { chat } from '@/ai/flows/chatbot-flow';
import { z } from 'zod';

export type ChatbotState = {
  response?: string | null;
  error?: string | null;
};

// Define the schema inside the action file, as it's the only place it's used for validation.
const FormInputSchema = z.object({
  history: z.array(z.string()), // History comes as stringified JSON from hidden inputs
  message: z.string().min(1, "Message cannot be empty."),
});

export async function chatbotAction(
  prevState: ChatbotState,
  formData: FormData
): Promise<ChatbotState> {
  const validatedFields = FormInputSchema.safeParse({
    history: formData.getAll('history'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.flatten().fieldErrors.message?.[0] || 'Invalid input.';
    return {
      error: errorMessage,
      response: null,
    };
  }
  
  // The AI flow expects a specific structure. We construct it here.
  const historyForAI = validatedFields.data.history.map(h => {
      const parsed = JSON.parse(h);
      return { role: parsed.role, content: [{ text: parsed.text }]};
  });

  const inputForAI = {
    history: historyForAI,
    message: validatedFields.data.message
  };

  try {
    const result = await chat(inputForAI);
    return {
      response: result.response,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      error: `Server error: ${errorMessage}`,
      response: null,
    };
  }
}
