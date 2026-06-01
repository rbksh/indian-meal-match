import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { recipes, type Recipe } from "@/data/recipes";
import { identifyIngredients } from "@/lib/identify.functions";
import {
  Sparkles, ChefHat, Clock, Search, Camera, Loader2, X,
  Heart, Printer, Users, History, Star,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CookingPanel } from "@/components/CookingPanel";
import { PartyPlanner } from "@/components/PartyPlanner";
import { AboutSection } from "@/components/AboutSection";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import logoUrl from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Rasoi Saathi — Your Indian Kitchen Companion" },
      { name: "description", content: "Type the ingredients you have and find Indian dinners you can cook tonight. Built for desi homes." },
    ],
  }),
});

type Match = {
  recipe: Recipe;
  matched: string[];
  missing: string[];
  percent: number;
};

// Master ingredient list for autocomplete
const ALL_INGREDIENTS: string[] = Array.from(
  new Set(recipes.flatMap((r) => r["Required Ingredients"].map((s) => s.toLowerCase())))
).sort();

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

function getLastFragment(text: string): { fragment: string; start: number } {
  const m = text.match(/[,\n;]\s*([^,\n;]*)$/);
  if (m) return { fragment: m[1], start: text.length - m[1].length };
  return { fragment: text, start: 0 };
}

function printRecipe(m: Match, servings?: number) {
  const win = window.open("", "_blank", "width=720,height=900");
  if (!win) return;
  const baseServings = 4;
  const scale = servings && servings > 0 ? servings / baseServings : 1;
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Shopping List — ${m.recipe["Recipe Name"]}</title>
<style>
  body{font-family: ui-sans-serif, system-ui, sans-serif; padding:32px; color:#1f1f1f; max-width:640px; margin:auto;}
  h1{margin:0 0 4px; font-size:28px;}
  .sub{color:#666; font-size:14px; margin-bottom:20px;}
  h2{font-size:16px; text-transform:uppercase; letter-spacing:.08em; color:#b85400; margin-top:28px;}
  ul{padding-left:20px; line-height:1.8;}
  li.missing{font-weight:600;}
  li.have{color:#888; text-decoration:line-through;}
  .badge{display:inline-block; padding:3px 10px; border-radius:999px; background:#fef3e6; color:#b85400; font-size:12px; font-weight:600;}
  .footer{margin-top:40px; font-size:12px; color:#999; text-align:center;}
  @media print { .noprint{display:none;} }
</style></head><body>
<h1>${m.recipe["Recipe Name"]}</h1>
<div class="sub">${m.recipe["Prep Time"]}${m.recipe.Region ? ` · ${m.recipe.Region}` : ""}${servings ? ` · scaled for ${servings} people (×${scale.toFixed(2)})` : ""}</div>
<span class="badge">Shopping list</span>
<h2>To buy (${m.missing.length})</h2>
<ul>${m.missing.map((i) => `<li class="missing">☐ ${i}${servings ? ` <em style="color:#999;font-weight:400">(qty ×${scale.toFixed(2)})</em>` : ""}</li>`).join("") || "<li>Nothing — you have everything!</li>"}</ul>
<h2>Already have (${m.matched.length})</h2>
<ul>${m.matched.map((i) => `<li class="have">${i}</li>`).join("")}</ul>
<h2>Instructions</h2>
<p style="line-height:1.7">${m.recipe.Instructions}</p>
${m.recipe.FunFact ? `<h2>Did you know?</h2><p style="line-height:1.7">${m.recipe.FunFact}</p>` : ""}
<div class="footer">Rasoi Saathi — Built with love by Shesh Shiromani</div>
<button class="noprint" onclick="window.print()" style="position:fixed;bottom:20px;right:20px;padding:12px 18px;border:0;border-radius:12px;background:#d96a2c;color:#fff;font-weight:600;cursor:pointer">Print</button>
</body></html>`;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

function Index() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Match[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [servingsOpen, setServingsOpen] = useState<Record<string, boolean>>({});
  const [servings, setServings] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const identify = useServerFn(identifyIngredients);

  const [favorites, setFavorites] = useLocalStorage<string[]>("rs-favs", []);
  const [history, setHistory] = useLocalStorage<{ name: string; at: number }[]>("rs-history", []);

  const { fragment } = getLastFragment(query);
  const suggestions = useMemo(() => {
    const f = fragment.trim().toLowerCase();
    if (f.length < 1) return [];
    const tokens = new Set(tokenize(query));
    return ALL_INGREDIENTS
      .filter((i) => i.startsWith(f) && !tokens.has(i))
      .slice(0, 8);
  }, [fragment, query]);

  const applySuggestion = (s: string) => {
    const { start } = getLastFragment(query);
    const before = query.slice(0, start);
    const next = (before ? before.replace(/\s*$/, "") + (before.trim().endsWith(",") ? " " : ", ") : "") + s + ", ";
    setQuery(next);
    textareaRef.current?.focus();
  };

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
      if (!detected) setScanError("Couldn't detect ingredients. Try a clearer photo.");
      else setQuery((prev) => (prev ? `${prev}, ${detected}` : detected));
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
    const visible = matches.filter((m) => m.percent > 0);
    setResults(visible);
    if (visible[0]) {
      const top = visible[0].recipe["Recipe Name"];
      setHistory((h) => [{ name: top, at: Date.now() }, ...h.filter((x) => x.name !== top)].slice(0, 12));
    }
  };

  const toggleFav = (name: string) => {
    setFavorites((f) => (f.includes(name) ? f.filter((x) => x !== name) : [name, ...f]).slice(0, 50));
  };

  const hasResults = results !== null;
  const favRecipes = favorites
    .map((n) => recipes.find((r) => r["Recipe Name"] === n))
    .filter(Boolean) as Recipe[];

  return (
    <main className="min-h-screen px-4 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="Rasoi Saathi logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-2xl bg-card ring-1 ring-border p-1 shadow-[var(--shadow-card)]"
            />
            <div>
              <div className="text-2xl md:text-3xl font-bold tracking-tight">
                <span className="gradient-text">Rasoi Saathi</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Built with love by Shesh Shiromani</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#about" className="hidden sm:inline-flex items-center rounded-full border border-border bg-card/70 px-3 py-2 text-xs font-medium hover:bg-accent">About</a>
            <ThemeToggle />
          </div>
        </div>

        <header className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Smart Indian Recipe Finder
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
                {preview && <img src={preview} alt="Scanned ingredients" className="h-16 w-16 rounded-xl object-cover ring-1 ring-border" />}
                <div className="flex-1 text-sm">
                  {scanning && <span className="inline-flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Identifying ingredients…</span>}
                  {!scanning && scanError && <span className="text-destructive">{scanError}</span>}
                  {!scanning && !scanError && preview && <span className="text-muted-foreground">Detected ingredients added below ✨</span>}
                </div>
                <button onClick={() => { setPreview(null); setScanError(null); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-background" aria-label="Clear scan"><X className="h-4 w-4" /></button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              placeholder="e.g. aloo, tamatar, pyaz, adrak, jeera, paneer, dhaniya, methi, hing…"
              className="block w-full resize-none rounded-2xl bg-transparent p-6 text-lg md:text-xl leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              rows={5}
            />
            {showSuggest && suggestions.length > 0 && (
              <div className="mx-3 mb-2 flex flex-wrap gap-1.5 rounded-2xl bg-secondary/50 p-2 animate-fade-in-up">
                <span className="self-center px-1 text-xs text-muted-foreground">Suggestions:</span>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={(e) => { e.preventDefault(); applySuggestion(s); }}
                    className="rounded-full bg-card px-3 py-1 text-xs font-medium ring-1 ring-border hover:bg-accent"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-3">
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value = ""; }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={scanning} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-60">
                {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Snap ingredients
              </button>
              <button onClick={find} className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]" style={{ background: "var(--gradient-warm)", boxShadow: "var(--shadow-card)" }}>
                <Search className="h-4 w-4" /> Find Meals
              </button>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">Type, snap, or pick from suggestions. We will help fill in the rest.</p>
        </section>

        {(favRecipes.length > 0 || history.length > 0) && (
          <section className="mt-10 grid gap-4 md:grid-cols-2">
            {favRecipes.length > 0 && (
              <div className="rounded-3xl bg-card p-5 ring-1 ring-border shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2 text-sm font-semibold"><Star className="h-4 w-4 text-primary" /> Favourites <span className="text-xs font-normal text-muted-foreground">({favRecipes.length})</span></div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {favRecipes.map((r) => (
                    <span key={r["Recipe Name"]} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                      {r["Recipe Name"]}
                      <button onClick={() => toggleFav(r["Recipe Name"])} className="text-muted-foreground hover:text-destructive" aria-label="Remove favourite"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {history.length > 0 && (
              <div className="rounded-3xl bg-card p-5 ring-1 ring-border shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4 text-primary" /> Recently cooked</div>
                  <button onClick={() => setHistory([])} className="text-xs text-muted-foreground hover:text-destructive">Clear</button>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {history.slice(0, 6).map((h) => (
                    <li key={h.name + h.at} className="flex items-center justify-between gap-2">
                      <span className="truncate">{h.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{new Date(h.at).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

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
              const name = m.recipe["Recipe Name"];
              const isFav = favorites.includes(name);
              const sOpen = servingsOpen[name];
              const sVal = servings[name];
              const scale = sVal && sVal > 0 ? sVal / 4 : null;
              return (
                <article
                  key={name}
                  className={`group rounded-3xl bg-card p-6 md:p-7 ring-1 ring-border transition-all hover:-translate-y-0.5 animate-fade-in-up ${isPerfect ? "animate-glow ring-2" : ""}`}
                  style={{ animationDelay: `${i * 60}ms`, boxShadow: isPerfect ? undefined : "var(--shadow-card)", borderColor: isPerfect ? "var(--success)" : undefined }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{name}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {m.recipe["Prep Time"]}</span>
                        <span>·</span>
                        <span>{m.matched.length}/{m.recipe["Required Ingredients"].length} ingredients</span>
                        {m.recipe.Region && (<><span>·</span><span className="font-medium text-primary">{m.recipe.Region}</span></>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFav(name)}
                        aria-label={isFav ? "Remove from favourites" : "Save to favourites"}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors ${isFav ? "text-primary-foreground" : "bg-background text-muted-foreground hover:text-primary"}`}
                        style={isFav ? { background: "var(--gradient-warm)" } : undefined}
                      >
                        <Heart className="h-4 w-4" fill={isFav ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => printRecipe(m, sVal)}
                        aria-label="Print shopping list"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-primary"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <div className="rounded-full px-4 py-1.5 text-sm font-bold"
                        style={isPerfect
                          ? { background: "var(--success)", color: "var(--success-foreground)" }
                          : m.percent >= 60
                            ? { background: "var(--accent)", color: "var(--accent-foreground)" }
                            : { background: "var(--muted)", color: "var(--muted-foreground)" }}>
                        {m.percent}% match
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.percent}%`, background: isPerfect ? "var(--success)" : "var(--gradient-warm)" }} />
                  </div>

                  {m.missing.length > 0 && (
                    <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 text-sm" style={{ background: "var(--warning)", color: "var(--warning-foreground)" }}>
                      <span className="font-semibold">Missing:</span>
                      <span>{m.missing.join(", ")}</span>
                    </div>
                  )}

                  <p className="mt-5 text-[15px] leading-relaxed text-foreground/80">{m.recipe.Instructions}</p>
                  {m.recipe.FunFact && (
                    <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4 text-sm">
                      <span className="font-semibold text-primary">Did you know? </span>
                      <span className="text-foreground/80">{m.recipe.FunFact}</span>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setServingsOpen((o) => ({ ...o, [name]: !o[name] }))}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
                    >
                      <Users className="h-3.5 w-3.5" /> {sOpen ? "Hide servings" : "Cooking for more people?"}
                    </button>
                    {sOpen && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 text-xs">
                        <span className="text-muted-foreground">Serves</span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={sVal ?? ""}
                          onChange={(e) => setServings((s) => ({ ...s, [name]: Number(e.target.value) }))}
                          placeholder="4"
                          className="w-14 rounded-md bg-background px-2 py-1 text-center text-sm ring-1 ring-border focus:outline-none"
                        />
                        <span className="text-muted-foreground">people</span>
                        {scale && (
                          <span className="font-semibold text-primary">→ multiply ingredients by ×{scale.toFixed(2)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <CookingPanel />
        <PartyPlanner />
        <AboutSection />
        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Built for hungry families · {recipes.length} Indian dinners ready to match
        </footer>
      </div>
    </main>
  );
}
