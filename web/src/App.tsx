import { useEffect, useState, type ComponentType } from "react";
import { ReviewBar, type ProposalKey } from "./components/ReviewBar";
import { ProposalA } from "./proposals/ProposalA";
import { ProposalB } from "./proposals/ProposalB";
import { ProposalC } from "./proposals/ProposalC";

const proposalComponents: Record<ProposalKey, ComponentType> = {
  a: ProposalA,
  b: ProposalB,
  c: ProposalC,
};

function readInitialProposal(): ProposalKey {
  const value = new URLSearchParams(window.location.search).get("p");
  return value === "b" || value === "c" ? value : "a";
}

function readInitialTheme(): "light" | "dark" {
  const value = new URLSearchParams(window.location.search).get("theme");
  if (value === "light" || value === "dark") return value;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const [proposal, setProposal] = useState<ProposalKey>(readInitialProposal);
  const [theme, setTheme] = useState<"light" | "dark">(readInitialTheme);
  const Proposal = proposalComponents[proposal];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const params = new URLSearchParams(window.location.search);
    params.set("p", proposal);
    params.set("theme", theme);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [proposal, theme]);

  return (
    <>
      <Proposal />
      <ReviewBar
        proposal={proposal}
        onProposal={setProposal}
        theme={theme}
        onTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      />
    </>
  );
}
