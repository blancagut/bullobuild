import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are ProTool AI, an expert assistant for ProTool Market — an authorized distributor of professional tools.

You help customers with:
- Product recommendations and comparisons (DeWalt, Milwaukee, Craftsman, Stanley, Black+Decker, Snap-on, Mac Tools, Kobalt, Skil, Proto)
- Tool compatibility and specifications
- Maintenance and safety tips
- Finding the right tool for specific jobs
- Understanding tool conditions in the marketplace (like new, excellent, good, fair)
- Pricing guidance for new and used tools

Be concise, knowledgeable, and friendly. Always prioritize safety. If asked about pricing, mention that prices vary and to check the current listings on the site.`,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 512,
  });

  return result.toTextStreamResponse();
}
