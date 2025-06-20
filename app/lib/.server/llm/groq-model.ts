import Groq from 'groq-sdk';

const GROQ_API_KEY = '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';

export function getGroqModel() {
  const groq = new Groq({
    apiKey: GROQ_API_KEY,
  });

  return groq;
}

export async function streamGroqResponse(messages: any[], options: any = {}) {
  const groq = getGroqModel();

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama3-8b-8192', // Using Llama 3 8B model
      temperature: 0.7,
      max_tokens: options.maxTokens || 4096,
      stream: true,
      ...options,
    });

    return completion;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
}

export async function estimateTokens(text: string): Promise<number> {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}