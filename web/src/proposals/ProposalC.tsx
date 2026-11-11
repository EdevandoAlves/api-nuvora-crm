import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Columns3,
  List,
  Phone,
  Plus,
  Search,
  StickyNote,
} from "lucide-react";
import {
  activity,
  dealsByStage,
  formatCompactBRL,
  health,
  kpis,
  stages,
  tasks,
  trend,
} from "../data";
import { Donut, TrendBars } from "../components/Charts";
import { Rail } from "../components/Rail";
import "./ProposalC.css";
import "./ProposalC.css";

const activityIcons = {
  deal: BriefcaseBusiness,
  task: Check,
  note: StickyNote,
  call: Phone,
};

const wonStage = stages.find((stage) => stage.key === "CLOSED_WON")!;
const lostStage = stages.find((stage) => stage.key === "CLOSED_LOST")!;
const toneColor = {
  accent: "var(--chart-1)",
  success: "var(--chart-2)",
  danger: "var(--chart-4)",
  info: "var(--chart-3)",
  slate: "var(--chart-5)",
} as const;

export function ProposalC() {
  return (
    <div className="c-shell">
      <Rail dark />
      <div className="c-main">
        <header className="c-topbar">
          <div className="c-title">
            <span>Dashboard</span>
            <h1>Pipeline</h1>
          </div>
          <div className="c-viewswitch" role="group" aria-label="Visualização">
            <button type="button" aria-pressed="true">
              <Columns3 size={14} /> Kanban
            </button>
            <button type="button" aria-pressed="false">
              <List size={14} /> Tabela
            </button>
          </div>
          <div className="c-actions">
            <button type="button" className="c-icon" aria-label="Buscar">
              <Search size={15} />
            </button>
            <button type="button" className="c-period">
              <CalendarDays size={14} />
              Novembro
              <ChevronDown size={13} />
            </button>
            <button type="button" className="c-cta">
              <Plus size={14} />
              Negócio
            </button>
          </div>
        </header>

        <main className="c-content">
          <section className="c-stage-strip" aria-label="Etapas do pipeline">
            {stages.map((stage) => (
              <button
                type="button"
                className="c-stage-tile"
                key={stage.key}
                data-active={stage.key === "NEGOTIATION" ? "true" : undefined}
                style={{ borderTopColor: toneColor[stage.tone] }}
              >
                <span>{stage.label}</span>
                <strong className="mono">{stage.count}</strong>
                <em className="mono">{formatCompactBRL(stage.value)}</em>
                <small className="mono">
                  {stage.key === "CLOSED_WON" || stage.key === "CLOSED_LOST"
                    ? "fechados"
                    : "em aberto"}
                </small>
              </button>
            ))}
          </section>

          <section className="c-board-wrap">
            <div className="c-board" role="list" aria-label="Negócios por etapa">
              {[...stages.slice(0, 3), wonStage, lostStage].map((stage) => (
                <div
                  className={`c-column${
                    stage.key === "CLOSED_WON" ? " c-column--won" : ""
                  }${stage.key === "CLOSED_LOST" ? " c-column--lost" : ""}`}
                  key={stage.key}
                  role="listitem"
                >
                  <header className="c-column__head">
                    <span>
                      <i data-tone={stage.tone} />
                      {stage.label}
                    </span>
                    <strong className="mono">{stage.count}</strong>
                  </header>
                  <div className="c-column__value mono">
                    {formatCompactBRL(stage.value)}
                  </div>
                  <div className="c-column__cards">
                    {(dealsByStage[stage.key] ?? []).map((deal) => (
                      <button
                        type="button"
                        className="c-card"
                        key={deal.id}
                      >
                        <span className="c-card__title">{deal.title}</span>
                        <span className="c-card__customer">{deal.customer}</span>
                        <div className="c-card__prob">
                          <span style={{ width: `${deal.probability}%` }} />
                        </div>
                        <div className="c-card__foot">
                          <span className="c-card__owner" title={deal.owner}>
                            {deal.owner}
                          </span>
                          <strong className="mono">
                            {formatCompactBRL(deal.value)}
                          </strong>
                        </div>
                        <span className="c-card__days mono">
                          {deal.days === 1 ? "1 dia" : `${deal.days} dias`}
                        </span>
                      </button>
                    ))}
                    <button type="button" className="c-add">
                      <Plus size={13} /> Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="c-side">
              <section className="c-panel">
                <header className="c-panel__head">
                  <h2>Hoje</h2>
                  <span className="mono">{kpis.tasks}</span>
                </header>
                <ul className="c-tasks">
                  {tasks.slice(0, 4).map((task, index) => (
                    <li key={task.id}>
                      <button
                        type="button"
                        className={`c-check${index === 3 ? " is-done" : ""}`}
                        aria-label={`Concluir ${task.title}`}
                      >
                        {index === 3 ? <Check size={10} /> : null}
                      </button>
                      <div>
                        <span>{task.title}</span>
                        <small>
                          {task.customer} ·{" "}
                          <span className="mono">{task.time}</span>
                        </small>
                      </div>
                      <i data-priority={task.priority} />
                    </li>
                  ))}
                </ul>
              </section>

              <section className="c-panel">
                <header className="c-panel__head">
                  <h2>Carteira</h2>
                  <span className="mono">{kpis.customers}</span>
                </header>
                <div className="c-health">
                  <Donut
                    data={health.map((item) => ({
                      ...item,
                      tone:
                        item.tone === "slate"
                          ? "5"
                          : item.tone === "info"
                            ? "3"
                            : item.tone,
                    }))}
                    centerValue={String(kpis.customers)}
                    centerLabel="clientes"
                    size={104}
                  />
                  <ul>
                    {health.map((item) => (
                      <li key={item.label}>
                        <i data-tone={item.tone} />
                        <span>{item.label}</span>
                        <strong className="mono">{item.value}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="c-panel">
                <header className="c-panel__head">
                  <h2>Ganho vs. perda</h2>
                  <div className="c-legend">
                    <span>
                      <i data-tone="success" /> Ganho
                    </span>
                    <span>
                      <i data-tone="danger" /> Perda
                    </span>
                  </div>
                </header>
                <TrendBars data={trend} />
              </section>
            </aside>
          </section>

          <section className="c-activity">
            <header>
              <h2>Atividade recente</h2>
              <span>Últimas 24 horas</span>
            </header>
            <div className="c-activity__grid">
              {activity.map((item) => {
                const Icon = activityIcons[item.kind];
                return (
                  <div className="c-activity__item" key={item.id}>
                    <span className="c-activity__icon">
                      <Icon size={12} />
                    </span>
                    <div>
                      <span>{item.text}</span>
                      <small>
                        <span className="mono">{item.time}</span> · {item.meta}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
