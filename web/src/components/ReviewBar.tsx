import { Moon, Sun } from "lucide-react";

export type ProposalKey = "a" | "b" | "c";

export function ReviewBar({
  proposal,
  onProposal,
  theme,
  onTheme,
}: {
  proposal: ProposalKey;
  onProposal: (proposal: ProposalKey) => void;
  theme: "light" | "dark";
  onTheme: () => void;
}) {
  const labels: Record<ProposalKey, string> = {
    a: "A · Console",
    b: "B · Briefing",
    c: "C · Atlas",
  };

  return (
    <div className="review-bar" role="group" aria-label="Escolha da proposta">
      <span className="review-bar__label">Proposta</span>
      <div className="review-bar__group">
        {(["a", "b", "c"] as ProposalKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className="review-bar__button"
            aria-pressed={proposal === key}
            onClick={() => onProposal(key)}
          >
            {labels[key]}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="review-bar__theme"
        onClick={onTheme}
        aria-label={theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
        title={theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
}
