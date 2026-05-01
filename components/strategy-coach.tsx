import { strategies } from "@/features/speaking/strategies";
import type { StrategyCategory } from "@/features/speaking/types";

type Props = {
  strategyCategory: StrategyCategory;
};

export function StrategyCoach({ strategyCategory }: Props) {
  const strategy = strategies[strategyCategory];

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 8 }}>
        <div>
          <h3>Strategy Coach</h3>
          <span className="muted">{strategy.label}</span>
        </div>
        <span className="label-chip">{strategy.idealLength}</span>
      </div>

      <p className="subtle" style={{ marginTop: 0 }}>
        {strategy.focus}
      </p>

      <div className="strategy-grid">
        <div className="strategy-panel">
          <strong>Structure</strong>
          <div className="step-list" style={{ marginTop: 12 }}>
            {strategy.structure.map((step, index) => (
              <div className="step-item" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="strategy-panel">
          <strong>Start Strong</strong>
          <div className="list" style={{ marginTop: 12 }}>
            {strategy.openingOptions.map((item) => (
              <div className="list-item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="strategy-panel">
          <strong>Build The Answer</strong>
          <div className="list" style={{ marginTop: 12 }}>
            {strategy.developmentMoves.map((item) => (
              <div className="list-item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="strategy-panel">
          <strong>If You Get Stuck</strong>
          <div className="list" style={{ marginTop: 12 }}>
            {strategy.rescueLines.map((item) => (
              <div className="list-item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="strategy-panel">
          <strong>High-Band Language</strong>
          <div className="tags" style={{ marginTop: 12 }}>
            {strategy.highBandPhrases.map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="strategy-panel">
          <strong>Common Mistakes</strong>
          <div className="list" style={{ marginTop: 12 }}>
            {strategy.commonMistakes.map((item) => (
              <div className="list-item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="strategy-grid" style={{ marginTop: 14 }}>
        <div className="strategy-panel">
          <strong>Band Upgrade Plan</strong>
          <div className="list" style={{ marginTop: 12 }}>
            {strategy.upgradeTips.map((item) => (
              <div className="list-item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="strategy-panel">
          <strong>Band Ladder</strong>
          <div className="list" style={{ marginTop: 12 }}>
            {[
              { label: "Band 6", items: strategy.bandLadders.band6 },
              { label: "Band 7", items: strategy.bandLadders.band7 },
              { label: "Band 8", items: strategy.bandLadders.band8 }
            ].map((band) => (
              <div className="list-item" key={band.label}>
                <strong>{band.label}:</strong> {band.items.join(" ")}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
