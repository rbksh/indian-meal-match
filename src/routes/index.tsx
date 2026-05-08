import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { recipes, type Recipe } from "@/data/recipes";
import { identifyIngredients } from "@/lib/identify.functions";
import { Sparkles, ChefHat, Clock, Search, Camera, Loader2, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CookingPanel } from "@/components/CookingPanel";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Rasoi Saathi — Your Indian Kitchen Companion" },
      { name: "description", content: "Type the ingredients you have at home and instantly find Indian family dinner recipes you can cook tonight." },
    ],
  }),
});

type Match = {
  recipe: Recipe;
  matched: string[];
  missing: string[];
  percent: number;
};

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[\n,;.\/]+|\s{2,}|\sand\s|\s&\s/g)
    .flatMap((s) => s.split(/\s*,\s*/))
    .map((s) => s.trim())
    .filter(Boolean);
}

function ingredientMatches(ingredient: string, tokens: string[]): boolean {
  const ing = ingredient.toLowerCase();
  return tokens.some((t) => ing.includes(t) || t.includes(ing));
}

function Index() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Match[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const identify = useServerFn(identifyIngredients);

  const handlePhoto = async (file: File) => {
    setScanError(null);
    setScanning(true);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    setPreview(dataUrl);
    try {
      const base64 = dataUrl.split(",")[1] ?? "";
      const result = await identify({ data: { imageBase64: base64, mimeType: file.type || "image/jpeg" } });
      const detected = (result.ingredients || "").trim();
      if (!detected) {
        setScanError("Couldn't detect ingredients. Try a clearer photo.");
      } else {
        setQuery((prev) => (prev ? `${prev}, ${detected}` : detected));
      }
    } catch (e: any) {
      setScanError(e?.message || "Failed to analyze image.");
    } finally {
      setScanning(false);
    }
  };

  const find = () => {
    const tokens = tokenize(query);
    if (tokens.length === 0) {
      setResults([]);
      return;
    }
    const matches: Match[] = recipes.map((recipe) => {
      const required = recipe["Required Ingredients"];
      const matched: string[] = [];
      const missing: string[] = [];
      required.forEach((ing) => {
        if (ingredientMatches(ing, tokens)) matched.push(ing);
        else missing.push(ing);
      });
      return {
        recipe,
        matched,
        missing,
        percent: Math.round((matched.length / required.length) * 100),
      };
    });
    matches.sort((a, b) => b.percent - a.percent);
    setResults(matches.filter((m) => m.percent > 0));
  };

  const hasResults = results !== null;

  return (
    <main className="min-h-screen px-4 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="gradient-text">Rasoi Saathi</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Built with love by Shesh Shiromani
            </p>
          </div>
          <ThemeToggle />
        </div>
        <header className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Smart Indian Recipe Finder
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight">
            What's in your <span className="gradient-text">kitchen?</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Type the ingredients you have. We'll find the Indian dinners you can cook tonight.
          </p>
        </header>

        <section className="mt-10 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <div className="rounded-3xl bg-card p-2 shadow-[var(--shadow-elegant)] ring-1 ring-border">
            {(preview || scanning || scanError) && (
              <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3 m-1">
                {preview && (
                  <img src={preview} alt="Scanned ingredients" className="h-16 w-16 rounded-xl object-cover ring-1 ring-border" />
                )}
                <div className="flex-1 text-sm">
                  {scanning && (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Identifying ingredients…
                    </span>
                  )}
                  {!scanning && scanError && <span className="text-destructive">{scanError}</span>}
                  {!scanning && !scanError && preview && (
                    <span className="text-muted-foreground">Detected ingredients added below ✨</span>
                  )}
                </div>
                <button
                  onClick={() => { setPreview(null); setScanError(null); }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-background"
                  aria-label="Clear scan"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. aloo, tamatar, pyaz, adrak, jeera, paneer, dhaniya, methi, hing…"
              className="block w-full resize-none rounded-2xl bg-transparent p-6 text-lg md:text-xl leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              rows={5}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhoto(f);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                Snap ingredients
              </button>
              <button
                onClick={find}
                className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "var(--gradient-warm)", boxShadow: "var(--shadow-card)" }}
              >
                <Search className="h-4 w-4" />
                Find Meals
              </button>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Type, or snap a photo of your ingredients — AI will fill them in.
          </p>
        </section>

        <section className="mt-12">
          {hasResults && results!.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center animate-fade-in-up">
              <ChefHat className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">No matching recipes. Try adding more ingredients.</p>
            </div>
          )}

          <div className="grid gap-5">
            {results?.map((m, i) => {
              const isPerfect = m.percent === 100;
              return (
                <article
                  key={m.recipe["Recipe Name"]}
                  className={`group rounded-3xl bg-card p-6 md:p-7 ring-1 ring-border transition-all hover:-translate-y-0.5 animate-fade-in-up ${
                    isPerfect ? "animate-glow ring-2" : ""
                  }`}
                  style={{
                    animationDelay: `${i * 60}ms`,
                    boxShadow: isPerfect ? undefined : "var(--shadow-card)",
                    borderColor: isPerfect ? "var(--success)" : undefined,
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                        {m.recipe["Recipe Name"]}
                      </h2>
                      <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {m.recipe["Prep Time"]}
                        </span>
                        <span>·</span>
                        <span>{m.matched.length}/{m.recipe["Required Ingredients"].length} ingredients</span>
                        {m.recipe.Region && (
                          <>
                            <span>·</span>
                            <span className="font-medium text-primary">{m.recipe.Region}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div
                      className="rounded-full px-4 py-1.5 text-sm font-bold"
                      style={
                        isPerfect
                          ? { background: "var(--success)", color: "var(--success-foreground)" }
                          : m.percent >= 60
                            ? { background: "var(--accent)", color: "var(--accent-foreground)" }
                            : { background: "var(--muted)", color: "var(--muted-foreground)" }
                      }
                    >
                      {m.percent}% match
                    </div>
                  </div>

                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${m.percent}%`,
                        background: isPerfect ? "var(--success)" : "var(--gradient-warm)",
                      }}
                    />
                  </div>

                  {m.missing.length > 0 && (
                    <div
                      className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 text-sm"
                      style={{ background: "var(--warning)", color: "var(--warning-foreground)" }}
                    >
                      <span className="font-semibold">Missing:</span>
                      <span>{m.missing.join(", ")}</span>
                    </div>
                  )}

                  <p className="mt-5 text-[15px] leading-relaxed text-foreground/80">
                    {m.recipe.Instructions}
                  </p>
                  {m.recipe.FunFact && (
                    <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4 text-sm">
                      <span className="font-semibold text-primary">Did you know? </span>
                      <span className="text-foreground/80">{m.recipe.FunFact}</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <CookingPanel />
        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Built for hungry families · {recipes.length} Indian dinners ready to match
        </footer>
      </div>
    </main>
  );
}
