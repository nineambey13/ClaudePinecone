// In your anthropicService.ts
import { Anthropic } from "@anthropic-ai/sdk";

// For Vite, environment variables need to be accessed using import.meta.env
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
});

export async function createChatCompletion(prompt: string) {
  const msg = await anthropic.messages.create({
    model: import.meta.env.VITE_CLAUDE_MODEL || "claude-3-sonnet-20240229",
    max_tokens: 1000,
    temperature: 1,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });
  
  return msg;
}