"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { prompts } from "@/features/speaking/prompts";
import { transferableStrategySections } from "@/features/speaking/strategy-system";

export function GuidedStrategyHub() {
  const [selectedId, setSelectedId] = useState(transferableStrategySections[0].id);
  const selected = useMemo(
    () => transferableStrategySections.find((section) => section.id === selectedId) ?? transferableStrategySections[0],
    [selectedId]
  );
  const suggestedPrompts = prompts.slice(0, 4);

  return (
    <section className="learning-shell">
      <div className="strategy-layout">
        <aside className="strategy-menu learning-sidebar">
          <div>
            <span className="eyebrow">Guided strategy</span>
            <h3>Choose one system</h3>
          </div>
          <select
            className="strategy-select"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            aria-label="Choose strategy section"
          >
            {transferableStrategySections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
          <div className="strategy-menu-list">
            {transferableStrategySections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`strategy-menu-button ${section.id === selected.id ? "active" : ""}`}
                onClick={() => setSelectedId(section.id)}
              >
                <strong>{section.title}</strong>
                <span>{section.purpose}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="strategy-focus learning-focus">
          <div className="learning-header">
            <div>
              <span className="mini-note">{selected.items.length} tools</span>
              <h2>{selected.title}</h2>
              <p>{selected.howItHelps}</p>
            </div>
          </div>

          <div className="focus-card accent">
            <strong>Practice now</strong>
            <p className="subtle" style={{ marginBottom: 0 }}>
              {selected.practicePrompt}
            </p>
          </div>

          <div className="stack">
            {selected.items.map((item) => (
              <article key={item.name} className="strategy-panel learning-card">
                <div className="block-header">
                  <div>
                    <h3>{item.name}</h3>
                    <span className="muted">{item.useWhen}</span>
                  </div>
                </div>
                <div className="step-list">
                  {item.moves.map((move, index) => (
                    <div className="step-item" key={move}>
                      <span>{index + 1}</span>
                      <p>{move}</p>
                    </div>
                  ))}
                </div>
                <div className="list-item strategy-example">
                  <strong>Example:</strong> {item.example}
                </div>
              </article>
            ))}
          </div>

          <div className="practice-block">
            <div className="block-header">
              <h3>Try it with a prompt</h3>
              <span className="muted">Use the selected system while answering.</span>
            </div>
            <div className="list">
              {suggestedPrompts.map((prompt) => (
                <div key={prompt.id} className="list-item resource-link">
                  <div>
                    <strong>{prompt.title}</strong>
                    <div className="muted">{prompt.question}</div>
                  </div>
                  <Link className="button button-ghost" href={`/speaking?prompt=${prompt.id}`}>
                    Practice
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
