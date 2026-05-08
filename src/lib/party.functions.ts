import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  guests: z.number().int().min(1).max(200),
  mealType: z.enum(["lunch", "dinner", "tea-party", "festive"]),
  preference: z.enum(["veg", "non-veg", "mixed"]),
  region: z.string().max(60).optional(),
  notes: z.string().max(300).optional(),
});

export type DishPlan = {
  name: string;
  category: "starter" | "snack" | "main" | "side" | "bread-rice" | "dessert" | "drink";
  servingNote: string;
  ingredients: { item: string; qty: string }[];
  quickTip?: string;
};

export type PartyPlan = {
  guests: number;
  occasion: string;
  summary: string;
  shoppingNotes: string;
  timeline: { when: string; task: string }[];
  menu: DishPlan[];
};

export const planParty = createServerFn({ method: "POST" })
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data }): Promise<PartyPlan> => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const userMsg = `Plan a complete Indian ${data.mealType} menu for ${data.guests} guests.
Preference: ${data.preference}.
${data.region ? `Preferred regional cuisine: ${data.region}.` : ""}
${data.notes ? `Host notes: ${data.notes}` : ""}

Give scaled ingredient quantities for the EXACT guest count (${data.guests} people). Use Indian household measures (katori, cup, chamach, kg, gm, ml, piece). Use simple Indian ingredient names (aloo, pyaz, tamatar, dhaniya, hing, etc.).`;

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
              "You are an experienced Indian home-cook helping a busy mom plan a meal for guests. Build a balanced menu: 1-2 starters/snacks, 2-3 mains (sabzi/dal/curry), a bread or rice, 1 side (raita/salad/chutney), and 1 dessert. Optionally a drink. Quantities MUST be scaled to the exact guest count using sensible Indian household serving sizes (e.g. 60-80g paneer per person, 1 katori dal per person, 2 rotis per person). Use simple Indian ingredient names. Add a short summary, a smart shopping note, and a prep timeline working backward from serving time. Always respond using the provided tool.",
          },
          { role: "user", content: userMsg },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "party_plan",
              description: "Return a complete scaled Indian party menu.",
              parameters: {
                type: "object",
                properties: {
                  occasion: { type: "string", description: "1-line description of the occasion/meal." },
                  summary: { type: "string", description: "2-3 friendly sentences summarising the menu choice." },
                  shoppingNotes: { type: "string", description: "Smart tips for buying / prepping ahead." },
                  timeline: {
                    type: "array",
                    minItems: 3,
                    maxItems: 8,
                    items: {
                      type: "object",
                      properties: {
                        when: { type: "string", description: "e.g. 'Morning of', '1 hour before', '15 min before serving'" },
                        task: { type: "string" },
                      },
                      required: ["when", "task"],
                      additionalProperties: false,
                    },
                  },
                  menu: {
                    type: "array",
                    minItems: 5,
                    maxItems: 10,
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: {
                          type: "string",
                          enum: ["starter", "snack", "main", "side", "bread-rice", "dessert", "drink"],
                        },
                        servingNote: { type: "string", description: "How much to serve per person and total." },
                        quickTip: { type: "string", description: "Optional one-line cooking shortcut or tip." },
                        ingredients: {
                          type: "array",
                          minItems: 3,
                          maxItems: 16,
                          items: {
                            type: "object",
                            properties: {
                              item: { type: "string", description: "Indian ingredient name" },
                              qty: { type: "string", description: "Scaled quantity with unit, e.g. '500 gm', '1.5 katori', '6 pyaz'" },
                            },
                            required: ["item", "qty"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["name", "category", "servingNote", "ingredients"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["occasion", "summary", "shoppingNotes", "timeline", "menu"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "party_plan" } },
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
    const parsed = JSON.parse(args) as Omit<PartyPlan, "guests">;
    return { guests: data.guests, ...parsed };
  });
