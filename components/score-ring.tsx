import type { CSSProperties } from "react";

type Props = {
  score: number;
};

export function ScoreRing({ score }: Props) {
  const percent = Math.max(0, Math.min(score / 9, 1));
  const ringStyle = { "--score": percent } as CSSProperties;

  return (
    <div className="score-ring" style={ringStyle}>
      <div style={{ textAlign: "center" }}>
        <strong>{score ? score.toFixed(1) : "-"}</strong>
        <div className="muted">band</div>
      </div>
    </div>
  );
}
