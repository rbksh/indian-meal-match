import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { planParty, type PartyPlan } from "@/lib/party.functions";
import { Users, Loader2, Sparkles, ShoppingBag, Clock, Utensils } from "lucide-react";

const categoryLabels: Record<string, string> = {
  starter: "Starter",
  snack: "Snack",
  main: "Main Course",
  side: "Side",
  "bread-rice": "Bread / Rice",
  dessert: "Dessert",
  drink: "Drink",
};

const categoryEmoji: Record<string, string> = {
  starter: "🥟",
  snack: "🥨",
  main: "🍲",
  side: "🥗",
  "bread-rice": "🍚",
  dessert: "🍮",
  drink: "🥤",
};

export function PartyPlanner() {
  const [guests, setGuests] = useState(8);
  const [mealType, setMealType] = useState<"lunch" | "dinner" | "tea-party" | "festive">("dinner");
  const [preference, setPreference] = useState<"veg" | "non-veg" | "mixed">("veg");
  const [region, setRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PartyPlan | null>(null);
  const plan_party = useServerFn(planParty);

  const handlePlan = async () => {
    setError(null);
    setLoading(true);
    setPlan(null);
    try {
      const result = await plan_party({
        data: {
          guests,
          mealType,
          preference,
          region: region || undefined,
          notes: notes || undefined,
        },
      });
      setPlan(result);
    } catch (e: any) {
      setError(e?.message || "Couldn't build a plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-16 animate-fade-in-up">
      <div className="rounded-3xl bg-card p-6 md:p-8 ring-1 ring-border" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground"
            style={{ background: "var(--gradient-warm)" }}
          >
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Guests Coming Over?</h2>
            <p className="text-sm text-muted-foreground">Plan a full menu with scaled ingredient quantities.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">How many guests?</span>
            <input
              type="number"
              min={1}
              max={200}
              value={guests}
              onChange={(e) => setGuests(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Occasion</span>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as any)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="dinner">Dinner</option>
              <option value="lunch">Lunch</option>
              <option value="tea-party">Tea / Snacks</option>
              <option value="festive">Festive / Pooja</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Preference</span>
            <select
              value={preference}
              onChange={(e) => setPreference(e.target.value as any)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="veg">Pure Veg</option>
              <option value="non-veg">Non-Veg</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Regional flavour (optional)</span>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. Punjabi, South Indian, Bengali"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Any notes? (optional)</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. kids included, jain food, no onion-garlic, light meal"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
        </div>

        <button
          onClick={handlePlan}
          disabled={loading}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          style={{ background: "var(--gradient-warm)", boxShadow: "var(--shadow-card)" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Planning your menu…" : "Plan My Menu"}
        </button>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {plan && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <div className="rounded-2xl border border-border bg-secondary/40 p-5">
              <div className="text-sm font-semibold text-primary">{plan.occasion}</div>
              <p className="mt-1 text-foreground/85">{plan.summary}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShoppingBag className="h-4 w-4 text-primary" /> Shopping notes
                </div>
                <p className="mt-2 text-sm text-foreground/80">{plan.shoppingNotes}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-primary" /> Prep timeline
                </div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {plan.timeline.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-medium text-primary shrink-0">{t.when}:</span>
                      <span className="text-foreground/80">{t.task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Utensils className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Menu for {plan.guests} guests</h3>
            </div>

            <div className="grid gap-4">
              {plan.menu.map((dish, i) => (
                <article
                  key={i}
                  className="rounded-2xl border border-border bg-card p-5 animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {categoryEmoji[dish.category]} {categoryLabels[dish.category]}
                      </div>
                      <h4 className="mt-1 text-lg font-semibold">{dish.name}</h4>
                      <p className="text-sm text-muted-foreground">{dish.servingNote}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {dish.ingredients.map((ing, j) => (
                      <div
                        key={j}
                        className="flex items-baseline justify-between gap-3 rounded-lg bg-secondary/40 px-3 py-1.5 text-sm"
                      >
                        <span className="text-foreground/80">{ing.item}</span>
                        <span className="font-semibold text-primary tabular-nums">{ing.qty}</span>
                      </div>
                    ))}
                  </div>
                  {dish.quickTip && (
                    <p className="mt-3 text-xs text-foreground/70">
                      <span className="font-semibold text-primary">Tip: </span>{dish.quickTip}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
