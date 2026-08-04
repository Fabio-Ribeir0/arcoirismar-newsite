"use client";

import { useState, type ReactNode } from "react";

export function Tabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [ativa, setAtiva] = useState(tabs[0]?.id);

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAtiva(tab.id)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              ativa === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} hidden={ativa !== tab.id} className="space-y-10">
          {tab.content}
        </div>
      ))}
    </div>
  );
}
