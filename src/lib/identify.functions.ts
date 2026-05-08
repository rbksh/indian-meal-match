import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  imageBase64: z.string().min(50).max(15_000_000),
  mimeType: z.string().min(3).max(50),
});

export const identifyIngredients = createServerFn({ method: "POST" })
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You identify food ingredients in photos. Return ONLY a comma-separated list of simple, lowercase ingredient names (e.g. 'potato, onion, tomato, ginger'). No sentences, no quantities, no extra words.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "List every ingredient you can see in this photo." },
              {
                type: "image_url",
                image_url: { url: `data:${data.mimeType};base64,${data.imageBase64}` },
              },
            ],
          },
        ],
      }),
    });

    if (res.status === 429) throw new Response("Rate limit exceeded. Try again shortly.", { status: 429 });
    if (res.status === 402) throw new Response("AI credits exhausted. Add credits in workspace usage.", { status: 402 });
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error", res.status, t);
      throw new Response("AI gateway error", { status: 500 });
    }

    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    return { ingredients: text.trim() };
  });