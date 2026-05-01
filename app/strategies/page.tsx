import Link from "next/link";
import { GuidedStrategyHub } from "@/components/guided-strategy-hub";
import { GuidedWritingStrategyHub } from "@/components/guided-writing-strategy-hub";

type StrategyMode = "speaking" | "writing";

export default async function StrategiesPage({
  searchParams
}: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const mode: StrategyMode = params?.mode === "writing" ? "writing" : "speaking";

  return (
    <main className="review-workspace">
      <div className="speaking-hero">
        <div>
          <span className="eyebrow">Strategy hub</span>
          <h1>Learn one system, then use it in practice.</h1>
          <p>Strategies stay learning-first: transferable systems for speaking and writing, not hidden scoring rules.</p>
        </div>
        <Link className="button button-primary" href={mode === "speaking" ? "/speaking" : "/writing"}>
          Practice {mode}
        </Link>
      </div>

      <section className="strategy-surface-switch" aria-label="Strategy type">
        <Link href="/strategies?mode=speaking" className={mode === "speaking" ? "active" : ""} aria-current={mode === "speaking" ? "page" : undefined}>
          <strong>Speaking strategies</strong>
          <span>Fluency, structure, rescue patterns, topic handling</span>
        </Link>
        <Link href="/strategies?mode=writing" className={mode === "writing" ? "active" : ""} aria-current={mode === "writing" ? "page" : undefined}>
          <strong>Writing strategies</strong>
          <span>Task 2 position, paragraphs, vocabulary, grammar range</span>
        </Link>
      </section>

      {mode === "speaking" ? <GuidedStrategyHub /> : <GuidedWritingStrategyHub />}
    </main>
  );
}
