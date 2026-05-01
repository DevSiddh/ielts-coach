"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { writingPrompts } from "@/features/writing/prompts";
import { writingStrategySections } from "@/features/writing/strategy-system";

export function GuidedWritingStrategyHub() {
  const [selectedId, setSelectedId] = useState(writingStrategySections[0].id);
  const selected = useMemo(
    () => writingStrategySections.find((section) => section.id === selectedId) ?? writingStrategySections[0],
    [selectedId]
  );
  const suggestedPrompts = writingPrompts.slice(0, 4);

  return (
    <section className="learning-shell writing-strategy-shell" aria-labelledby="writing-strategies-title">
      <div className="strategy-layout">
        <aside className="strategy-menu learning-sidebar">
          <div>
            <span className="eyebrow">Writing strategy</span>
            <h3>Choose one system</h3>
          </div>
          <select
            className="strategy-select"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            aria-label="Choose writing strategy section"
          >
            {writingStrategySections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
          <div className="strategy-menu-list">
            {writingStrategySections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`strategy-menu-button ${section.id === selected.id ? "active" : ""}`}
                onClick={() => setSelectedId(section.id)}
              >
                <strong>{section.title}</strong>
                <span>{section.criterion}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="strategy-focus learning-focus">
          <div className="learning-header">
            <div>
              <span className="mini-note">{selected.criterion}</span>
              <h2 id="writing-strategies-title">{selected.title}</h2>
              <p>{selected.howItHelps}</p>
            </div>
          </div>

          <div className="focus-card accent">
            <strong>Practice before writing</strong>
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
              <h3>Try it with a Task 2 prompt</h3>
              <span className="muted">Use the selected system in the writing console.</span>
            </div>
            <div className="list">
              {suggestedPrompts.map((prompt) => (
                <div key={prompt.id} className="list-item resource-link">
                  <div>
                    <strong>{prompt.title}</strong>
                    <div className="muted">{prompt.question}</div>
                  </div>
                  <Link className="button button-ghost" href={`/writing?prompt=${prompt.id}`}>
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
