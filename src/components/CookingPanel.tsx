import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getCookingGuide, type CookingGuide } from "@/lib/cooking.functions";
import { Play, ListChecks, Loader2, ChefHat, Check, ArrowRight, ArrowLeft, Youtube, Timer, Pause, RotateCcw, Sparkles } from "lucide-react";

function StepTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => { setRemaining(seconds); setRunning(false); setDone(false); }, [seconds]);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (ref.current) window.clearInterval(ref.current);
          setRunning(false);
          setDone(true);
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.frequency.value = 880; g.gain.value = 0.2;
            o.start(); setTimeout(() => { o.stop(); ctx.close(); }, 600);
          } catch {}
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="mt-5 rounded-2xl border border-border bg-secondary/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Timer className="h-4 w-4 text-primary" /> Timer
        </div>
        <div className={`font-mono text-3xl font-bold tabular-nums ${done ? "text-success" : "text-foreground"}`} style={done ? { color: "var(--success)" } : undefined}>
          {mm}:{ss}
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: done ? "var(--success)" : "var(--gradient-warm)" }} />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => { if (done) { setRemaining(seconds); setDone(false); setRunning(true); } else setRunning((r) => !r); }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-warm)" }}
        >
          {done ? (<><RotateCcw className="h-4 w-4" /> Restart</>) : running ? (<><Pause className="h-4 w-4" /> Pause</>) : (<><Play className="h-4 w-4" /> Start</>)}
        </button>
        <button
          onClick={() => { setRunning(false); setRemaining(seconds); setDone(false); }}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
      {done && <p className="mt-2 text-center text-sm font-semibold" style={{ color: "var(--success)" }}>Time's up! ✨</p>}
    </div>
  );
}

type Mode = "video" | "tracker";

export function CookingPanel() {
  const [meal, setMeal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guide, setGuide] = useState<CookingGuide | null>(null);
  const [mode, setMode] = useState<Mode>("tracker");
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const fetchGuide = useServerFn(getCookingGuide);

  const submit = async () => {
    if (!meal.trim()) return;
    setLoading(true); setError(null); setGuide(null);
    setStepIdx(0); setDone(new Set());
    try {
      const g = await fetchGuide({ data: { meal: meal.trim() } });
      setGuide(g);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch guide");
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = (i: number) => {
    const next = new Set(done);
    next.has(i) ? next.delete(i) : next.add(i);
    setDone(next);
  };

  return (
    <section className="mt-16 animate-fade-in-up">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <ChefHat className="h-3.5 w-3.5 text-primary" />
          Cook a specific dish
        </div>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
          Want to cook <span className="gradient-text">something specific?</span>
        </h2>
        <p className="mt-2 text-muted-foreground">
          Type a dish and get videos from top Indian Chefs and a beginner-friendly step tracker.
        </p>
      </div>

      <div className="mt-8 rounded-3xl bg-card p-3 ring-1 ring-border shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. Butter Chicken, Masala Dosa, Chole Bhature…"
            className="flex-1 rounded-2xl bg-transparent px-5 py-4 text-lg text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={loading || !meal.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{ background: "var(--gradient-warm)" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChefHat className="h-4 w-4" />}
            {loading ? "Cooking up…" : "Show me how"}
          </button>
        </div>
        {error && <p className="mt-3 px-2 text-sm text-destructive">{error}</p>}
      </div>

      {guide && (
        <div className="mt-6 animate-fade-in-up">
          {guide.funFact && (
            <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Did you know?
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{guide.funFact}</p>
            </div>
          )}
          <div className="mb-4 flex justify-center">
            <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
              <button
                onClick={() => setMode("video")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  mode === "video" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                style={mode === "video" ? { background: "var(--gradient-warm)" } : undefined}
              >
                <Play className="h-3.5 w-3.5" /> Watch video
              </button>
              <button
                onClick={() => setMode("tracker")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  mode === "tracker" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                style={mode === "tracker" ? { background: "var(--gradient-warm)" } : undefined}
              >
                <ListChecks className="h-3.5 w-3.5" /> Step tracker
              </button>
            </div>
          </div>

          {mode === "video" && (
            <div className="rounded-3xl bg-card p-4 ring-1 ring-border shadow-[var(--shadow-card)]">
              <p className="px-2 pb-3 text-sm text-muted-foreground">
                Hand-picked video recommendations from top Indian food channels. Tap one to watch it on YouTube.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {guide.videos.map((v, i) => (
                  <a
                    key={`${v.channel}-${i}`}
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF0000] text-white">
                      <Youtube className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold group-hover:text-primary">{v.title}</h3>
                      <p className="truncate text-xs text-muted-foreground">by {v.channel}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {mode === "tracker" && (
            <div className="rounded-3xl bg-card p-6 ring-1 ring-border shadow-[var(--shadow-card)]">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {stepIdx + 1} of {guide.steps.length}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {done.size}/{guide.steps.length} done
                </span>
              </div>
              <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(done.size / guide.steps.length) * 100}%`,
                    background: "var(--gradient-warm)",
                  }}
                />
              </div>

              <div key={stepIdx} className="animate-fade-in-up">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground"
                    style={{ background: "var(--gradient-warm)" }}
                  >
                    {stepIdx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold tracking-tight">{guide.steps[stepIdx].title}</h3>
                    <p className="mt-2 text-lg leading-relaxed text-foreground/80">
                      {guide.steps[stepIdx].detail}
                    </p>
                    {typeof guide.steps[stepIdx].timerSeconds === "number" && guide.steps[stepIdx].timerSeconds! > 0 && (
                      <StepTimer key={`${stepIdx}-${guide.steps[stepIdx].timerSeconds}`} seconds={guide.steps[stepIdx].timerSeconds!} />
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
                    disabled={stepIdx === 0}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </button>
                  <button
                    onClick={() => toggleDone(stepIdx)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      done.has(stepIdx)
                        ? "text-success-foreground"
                        : "border border-border bg-background text-foreground"
                    }`}
                    style={done.has(stepIdx) ? { background: "var(--success)" } : undefined}
                  >
                    <Check className="h-4 w-4" /> {done.has(stepIdx) ? "Done" : "Mark done"}
                  </button>
                  <button
                    onClick={() => setStepIdx(Math.min(guide.steps.length - 1, stepIdx + 1))}
                    disabled={stepIdx === guide.steps.length - 1}
                    className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                    style={{ background: "var(--gradient-warm)" }}
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                {guide.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStepIdx(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === stepIdx ? "ring-2 ring-primary" : ""
                    }`}
                    style={{
                      background: done.has(i) ? "var(--success)" : i === stepIdx ? "var(--primary)" : "var(--muted)",
                    }}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}