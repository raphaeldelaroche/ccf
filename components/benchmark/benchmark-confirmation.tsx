import { Mail, TrendingDown, Zap, Landmark } from "lucide-react";

const PILLARS = [
  {
    icon: TrendingDown,
    title: "Reduce",
    description:
      "Direct and indirect emissions, transition plans, climate governance.",
  },
  {
    icon: Zap,
    title: "Amplify",
    description:
      "Green revenues, low-carbon solutions, emissions avoided through your products and services.",
  },
  {
    icon: Landmark,
    title: "Finance",
    description:
      "Carbon credits, climate philanthropy, investments in the transition.",
  },
];

const LOGOS = [
  "Schneider Electric",
  "EDF",
  "Renault",
  "Veolia",
  "Accor",
  "LVMH",
  "Orange",
  "Klépierre",
  "Equans",
  "Eramet",
];

export function BenchmarkConfirmation() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 py-16">
      <div className="w-full max-w-4xl space-y-20">
        {/* Zone 1 — Confirmation */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center">
              <Mail className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-4xl font-semibold leading-tight">
            Your contributive potential is on its way
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {`Check your inbox — you'll receive a personalised link to your result in the next few minutes.`}
          </p>
        </div>

        {/* Zone 2 — The 3 pillars */}
        <div className="space-y-8">
          <p className="text-center text-muted-foreground text-base">
            Your result is built on the three dimensions of climate contribution
            defined by the CCF:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="border-2 border-border rounded-xl p-8 space-y-4 text-center"
              >
                <div className="flex justify-center">
                  <pillar.icon className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Zone 3 — Social proof */}
        <div className="space-y-6">
          <p className="text-center text-muted-foreground text-sm">
            They already assess their contributive potential:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {LOGOS.map((name) => (
              <div
                key={name}
                className="px-6 py-3 bg-muted rounded-lg text-sm text-muted-foreground font-medium"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
