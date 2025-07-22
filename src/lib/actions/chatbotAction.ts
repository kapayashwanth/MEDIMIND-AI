
'use server';

import { chat, ChatInputSchema, ChatInput } from '@/ai/flows/chatbot-flow';

export type ChatbotState = {
  response?: string | null;
  error?: string | null;
};

// Helper to parse message history from FormData
const parseHistory = (formData: FormData): ChatInput['history'] => {
    return formData.getAll('history').map(h => {
        const parsed = JSON.parse(h as string);
        return {
            role: parsed.role,
            content: [{ text: parsed.text }]
        }
    });
}

export async function chatbotAction(
  prevState: ChatbotState,
  formData: FormData
): Promise<ChatbotState> {
  const validatedFields = ChatInputSchema.safeParse({
    history: parseHistory(formData),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid input. " + validatedFields.error.flatten().fieldErrors.message?.[0],
      response: null,
    };
  }
  
  try {
    const result = await chat(validatedFields.data);
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
