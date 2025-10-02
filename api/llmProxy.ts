import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// Optional: Increase the maximum duration for streaming responses
export const maxDuration = 30; 

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

const systemMessage = {
    role: 'system',
    content: 'Eres un terapeuta empático y calmado. Responde con comprensión y escucha activa.'
};

  // Call the Groq model and stream the response
  const result = streamText({
    // 1. Specify the Groq model here. 
    // Popular models are: 'llama-3.1-8b-instant' or 'llama-3.1-70b-versatile'
    model: groq('llama-3.1-8b-instant'), 
    
    // 2. Pass the message history
    messages: [systemMessage, ...messages],
    
    // 3. Optional: Add a system message for custom behavior (e.g., a persona)
    // The system message should be at the start of the `messages` array for most models, 
    // but the `streamText` function can also take a separate `system` option.
    // For Groq, the best practice is usually to include it in the `messages` array 
    // as the first item with role: 'system'. 
    // Example (if you don't send it from the client):
    /*
    messages: [
      { role: 'system', content: 'You are a pirate assistant. Answer all questions with a pirate flair.' },
      ...messages,
    ],
    */
  });

  // Respond with the stream
  return result.toTextStreamResponse();
}