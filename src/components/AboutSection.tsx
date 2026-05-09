import { Heart, Leaf, Sparkles, Soup } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="mt-20 animate-fade-in-up">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Heart className="h-3.5 w-3.5 text-primary" /> About Rasoi Saathi
        </div>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
          A little <span className="gradient-text">kitchen companion</span> for every Indian home
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Rasoi Saathi turns whatever's in your dabbas and fridge into wholesome Indian meals — from
          everyday dal-chawal to hidden regional gems. Built for moms, students, and curious cooks.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { icon: Soup, title: "100+ desi recipes", desc: "From Bihari Litti Chokha to Coorgi Pandi Curry — including hidden gems most people don't know." },
          { icon: Leaf, title: "Speaks your language", desc: "Ingredients in everyday Hindi — aloo, hing, dhaniya, kasuri methi — no fancy jargon." },
          { icon: Sparkles, title: "Smart helpers", desc: "Snap your ingredients, get step-by-step trackers with timers, plan parties, and more." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-3xl bg-card p-6 ring-1 ring-border shadow-[var(--shadow-card)]">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-warm)" }}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-lg font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}