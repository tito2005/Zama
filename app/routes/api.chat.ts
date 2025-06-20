import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { streamGroqResponse, estimateTokens } from '~/lib/.server/llm/groq-model';
import { requireUserSession, getUserById, updateTokenUsage, canUseTokens } from '~/lib/.server/auth/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const session = await requireUserSession(request);
    const user = await getUserById(session.userId);
    
    if (!user) {
      throw new Response('User not found', { status: 404 });
    }

    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Response('Invalid messages format', { status: 400 });
    }

    // Estimate tokens for the request
    const requestText = messages.map(m => m.content).join(' ');
    const estimatedTokens = await estimateTokens(requestText);
    
    // Check if user has enough tokens
    if (!await canUseTokens(user.id, estimatedTokens)) {
      return new Response(
        JSON.stringify({ 
          error: 'Token limit exceeded. Please upgrade your plan or wait for daily reset.' 
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Stream response from Groq
    const completion = await streamGroqResponse(messages, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    // Create a transform stream to track token usage
    let totalTokens = 0;
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Estimate tokens in the response chunk
        const chunkText = new TextDecoder().decode(chunk);
        totalTokens += Math.ceil(chunkText.length / 4);
        controller.enqueue(chunk);
      },
      flush() {
        // Update token usage when stream completes
        updateTokenUsage(user.id, estimatedTokens + totalTokens).catch(console.error);
      }
    });

    // Convert Groq stream to web stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(readableStream.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Response) {
      return error;
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}