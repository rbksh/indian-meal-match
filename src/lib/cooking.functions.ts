import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  meal: z.string().min(1).max(120),
});

export type CookingGuide = {
  meal: string;
  steps: { title: string; detail: string }[];
  videos: { title: string; channel: string; videoId: string }[];
};

export const getCookingGuide = createServerFn({ method: "POST" })
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data }): Promise<CookingGuide> => {
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
              "You help home cooks make Indian dishes. Always respond using the provided tool. Use very simple, friendly language a beginner can follow. Give 6 to 10 short cooking steps. Suggest 3 real, popular YouTube cooking videos from well-known Indian food YouTubers (e.g. Hebbar's Kitchen, Ranveer Brar, Sanjeev Kapoor Khazana, Kabita's Kitchen, Nisha Madhulika, Cook with Parul, Your Food Lab, Tasted Recipes). Provide accurate 11-character YouTube video IDs you are confident exist for that exact dish.",
          },
          { role: "user", content: `Dish to cook: ${data.meal}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "cooking_guide",
              description: "Return cooking steps and YouTube video suggestions.",
              parameters: {
                type: "object",
                properties: {
                  steps: {
                    type: "array",
                    minItems: 4,
                    maxItems: 12,
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short step title (max 6 words)" },
                        detail: { type: "string", description: "1-2 simple sentences explaining what to do." },
                      },
                      required: ["title", "detail"],
                      additionalProperties: false,
                    },
                  },
                  videos: {
                    type: "array",
                    minItems: 1,
                    maxItems: 4,
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        channel: { type: "string" },
                        videoId: { type: "string", description: "11-character YouTube video ID" },
                      },
                      required: ["title", "channel", "videoId"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["steps", "videos"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "cooking_guide" } },
      }),
    });

    if (res.status === 429) throw new Response("Rate limit exceeded. Try again shortly.", { status: 429 });
    if (res.status === 402) throw new Response("AI credits exhausted.", { status: 402 });
    if (!res.ok) {
      const t = await res.text();
      console.error("AI error", res.status, t);
      throw new Response("AI gateway error", { status: 500 });
    }

    const json = await res.json();
    const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No tool result");
    const parsed = JSON.parse(args) as Omit<CookingGuide, "meal">;
    return { meal: data.meal, ...parsed };
  });