import type { AudioSignals, EvidenceSignals } from "./types";

export function buildPronunciationInsights({
  evidenceSignals,
  audioSignals
}: {
  evidenceSignals?: EvidenceSignals;
  audioSignals?: AudioSignals;
}) {
  const findings: string[] = [];
  const cautions: string[] = [];
  const targets: string[] = [];

  if (audioSignals) {
    if (audioSignals.longPauseCount > 0) {
      findings.push(`${audioSignals.longPauseCount} long audio pause${audioSignals.longPauseCount === 1 ? "" : "s"} detected.`);
      targets.push("Use a short rescue phrase before silence becomes a long gap.");
    }
    if (audioSignals.speechRatio < 0.62) {
      findings.push(`Speech ratio is ${(audioSignals.speechRatio * 100).toFixed(0)}%, so silence is reducing delivery strength.`);
      targets.push("Keep speaking through the answer with shorter, simpler sentences.");
    }
  }

  if (evidenceSignals) {
    if (evidenceSignals.lowConfidenceWordCount > 0) {
      findings.push(`${evidenceSignals.lowConfidenceWordCount} lower-confidence transcript word${evidenceSignals.lowConfidenceWordCount === 1 ? "" : "s"} found.`);
      targets.push(`Repeat these words slowly: ${evidenceSignals.lowConfidenceWords.slice(0, 4).join(", ") || "the unclear words"}.`);
    }
    if (evidenceSignals.clarityRisks.length > 0) {
      findings.push(`${evidenceSignals.clarityRisks.length} transcript clarity risk${evidenceSignals.clarityRisks.length === 1 ? "" : "s"} detected.`);
      targets.push("Replay the recording and compare the risky word with the intended word.");
    }
    if (evidenceSignals.hesitationClusterCount > 0) {
      findings.push(`${evidenceSignals.hesitationClusterCount} hesitation cluster${evidenceSignals.hesitationClusterCount === 1 ? "" : "s"} detected around pauses or fillers.`);
      targets.push("Practice the same answer once more with deliberate pauses between ideas.");
    }
  }

  if (!findings.length) {
    findings.push("No strong pronunciation-risk evidence was captured for this attempt.");
  }

  cautions.push("This is delivery and clarity evidence, not a full pronunciation diagnosis.");
  if (!audioSignals) cautions.push("Audio-level evidence was unavailable, so the signal is limited.");
  if (!evidenceSignals?.averageWordConfidence) cautions.push("Word confidence metadata was unavailable for this attempt.");

  return {
    evidenceLevel: audioSignals && evidenceSignals?.averageWordConfidence ? "stronger" : audioSignals || evidenceSignals ? "partial" : "limited",
    findings,
    cautions,
    targets: Array.from(new Set(targets)).slice(0, 4)
  };
}
