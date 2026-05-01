import Link from "next/link";
import { strategies } from "@/features/speaking/strategies";
import type { SpeakingPrompt } from "@/features/speaking/types";

type Props = {
  prompt: SpeakingPrompt;
};

export function StrategyPreview({ prompt }: Props) {
  const strategy = strategies[prompt.strategyCategory];

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 8 }}>
        <div>
          <h3>Strategy For This Question</h3>
          <span className="muted">{strategy.label}</span>
        </div>
        <span className="label-chip">{strategy.idealLength}</span>
      </div>

      <p className="subtle" style={{ marginTop: 0 }}>
        {strategy.focus}
      </p>

      <div className="list">
        {strategy.structure.slice(0, 3).map((item) => (
          <div className="list-item" key={item}>
            {item}
          </div>
        ))}
      </div>

      <div className="hero-actions">
        <Link className="button button-primary" href={`/strategies#${prompt.strategyCategory}`}>
          Open full strategy
        </Link>
        <div className="tags">
          {strategy.highBandPhrases.slice(0, 3).map((item) => (
            <span className="tag" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
