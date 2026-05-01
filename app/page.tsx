import Link from "next/link";

const workflow = [
  { label: "Question", detail: "Pick a real IELTS prompt." },
  { label: "Record", detail: "Capture your spoken answer." },
  { label: "Transcript", detail: "Keep raw speech evidence." },
  { label: "Score", detail: "See one main issue." },
  { label: "Retry", detail: "Repeat with a focused target." }
];

const surfaces = [
  {
    title: "Speaking console",
    body: "The daily-use workspace for recording, transcribing, scoring, and retrying.",
    href: "/speaking",
    cta: "Start practice"
  },
  {
    title: "Strategy lab",
    body: "Learn one transferable speaking system, then apply it inside the console.",
    href: "/strategies",
    cta: "Learn a system"
  },
  {
    title: "Attempt review",
    body: "Revisit scores, raw transcripts, retry targets, and deep evidence only when needed.",
    href: "/history",
    cta: "Review attempts"
  }
];

export default function HomePage() {
  return (
    <main className="product-home">
      <section className="home-hero-panel">
        <div>
          <span className="eyebrow">Premium speaking workflow</span>
          <h1>Practice IELTS speaking in one focused loop.</h1>
          <p>
            A daily console for answering real prompts, preserving raw transcript evidence, getting a strict band
            estimate, and retrying with one clear target.
          </p>
          <div className="console-actions">
            <Link className="button button-primary" href="/speaking">
              Open speaking console
            </Link>
            <Link className="button button-ghost" href="/strategies">
              Study a strategy first
            </Link>
          </div>
        </div>

        <aside className="home-score-preview">
          <span className="mini-note">Daily focus</span>
          <strong>Record → Score → Retry</strong>
          <p>Default view stays simple. Evidence opens only when you ask for detailed analysis.</p>
        </aside>
      </section>

      <section className="workflow-strip">
        {workflow.map((step, index) => (
          <div key={step.label} className="workflow-step">
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
            <p>{step.detail}</p>
          </div>
        ))}
      </section>

      <section className="surface-grid">
        {surfaces.map((surface) => (
          <Link key={surface.href} className="surface-card" href={surface.href}>
            <span className="mini-note">{surface.cta}</span>
            <strong>{surface.title}</strong>
            <p>{surface.body}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
