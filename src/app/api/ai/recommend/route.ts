import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  const { query, productId } = await req.json();

  const prompt = productId
    ? `A user is viewing a product with ID "${productId}". Suggest 3-5 related professional tool product search terms or categories they might be interested in. Return only a JSON array of strings like ["DeWalt drills", "Milwaukee impact drivers", "drill bits"]. No explanation.`
    : `A user searched for: "${query}". Suggest 3-5 related professional tool categories or products they might like from brands like DeWalt, Milwaukee, Craftsman, Stanley, Snap-on. Return only a JSON array of strings. No explanation.`;

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxOutputTokens: 150,
    });

    const suggestions = JSON.parse(text.trim());
    return Response.json({ suggestions });
  } catch {
    return Response.json({ suggestions: ["DeWalt power tools", "Milwaukee drills", "Snap-on hand tools"] });
  }
}
