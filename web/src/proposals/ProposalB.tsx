import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Phone,
  Plus,
  Search,
  StickyNote,
} from "lucide-react";
import {
  activity,
  formatBRL,
  formatCompactBRL,
  formatPercent,
  health,
  kpis,
  riskDeals,
  stages,
  tasks,
  trend,
} from "../data";
import { Donut, TrendChart } from "../components/Charts";
import { Rail } from "../components/Rail";
import "../styles/briefing.css";

const activityIcons = {
  deal: BriefcaseBusiness,
  task: Check,
  note: StickyNote,
  call: Phone,
};

const maxStage = Math.max(...stages.map((stage) => stage.value));

export function ProposalB() {
  return (
    <div className="b-shell">
      <Rail />
      <div className="b-main">
        <header className="b-head">
          <div>
            <span className="b-date">Terça, 11 de novembro</span>
            <h1>O que merece atenção hoje</h1>
            <p>
              Um recorte direto da operação: caixa, pipeline e próximos passos.
            </p>
          </div>
          <div className="b-head__actions">
            <button type="button" className="b-icon" aria-label="Buscar">
              <Search size={16} />
            </button>
            <button type="button" className="b-ghost">
              Filtros
            </button>
            <button type="button" className="b-cta">
              <Plus size={15} />
              Novo
            </button>
          </div>
        </header>

        <section className="b-pulse" aria-label="Resumo do dia">
          <div>
            <span>Pipeline aberto</span>
            <strong className="mono">{formatCompactBRL(kpis.pipeline)}</strong>
            <em className="is-up">
              <ArrowUpRight size={12} /> 8,4%
            </em>
          </div>
          <div>
            <span>Ganho no mês</span>
            <strong className="mono">{formatCompactBRL(kpis.won)}</strong>
            <em className="is-up">
              <ArrowUpRight size={12} /> 12,1%
            </em>
          </div>
          <div>
            <span>Perdido no mês</span>
            <strong className="mono">{formatCompactBRL(kpis.lost)}</strong>
            <em className="is-down">
              <ArrowDownRight size={12} /> 4,8%
            </em>
          </div>
          <div>
            <span>Conversão</span>
            <strong className="mono">{formatPercent(kpis.conversion)}</strong>
            <em className="is-muted">meta 30%</em>
          </div>
        </section>

        <section className="b-grid">
          <div className="b-left">
            <section className="b-section">
              <header className="b-section__head">
                <h2>Hoje</h2>
                <span className="mono">{kpis.tasks} tarefas</span>
              </header>
              <ul className="b-agenda">
                {tasks.map((task, index) => (
                  <li key={task.id} className="b-agenda__row">
                    <span className="b-agenda__time mono">{task.time}</span>
                    <span className="b-agenda__line" aria-hidden="true">
                      <i className={index === 4 ? "is-done" : ""} />
                    </span>
                    <div className="b-agenda__copy">
                      <span
                        className={`b-agenda__title${index === 4 ? " is-done" : ""}`}
                      >
                        {task.title}
                      </span>
                      <span className="b-agenda__meta">{task.customer}</span>
                    </div>
                    <span className="b-agenda__priority" data-p={task.priority}>
                      {task.priority === "high"
                        ? "Alta"
                        : task.priority === "medium"
                          ? "Média"
                          : "Baixa"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="b-section">
              <header className="b-section__head">
                <h2>Atividade</h2>
                <button type="button" className="b-link">
                  Ver tudo <ChevronRight size={13} />
                </button>
              </header>
              <ol className="b-timeline">
                {activity.map((item) => {
                  const Icon = activityIcons[item.kind];
                  return (
                    <li key={item.id} className="b-timeline__row">
                      <span className="b-timeline__dot">
                        <Icon size={11} />
                      </span>
                      <span className="b-timeline__time mono">{item.time}</span>
                      <div>
                        <span className="b-timeline__text">{item.text}</span>
                        <span className="b-timeline__meta">{item.meta}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>

          <aside className="b-right">
            <section className="b-cash">
              <span className="b-cash__label">Caixa do mês</span>
              <strong className="b-cash__value mono">
                {formatCompactBRL(kpis.won)}
              </strong>
              <div className="b-cash__row">
                <span>Ganho</span>
                <strong className="mono">{formatCompactBRL(kpis.won)}</strong>
              </div>
              <div className="b-cash__row">
                <span>Perdido</span>
                <strong className="mono is-down">
                  {formatCompactBRL(kpis.lost)}
                </strong>
              </div>
              <div className="b-cash__row">
                <span>Pipeline aberto</span>
                <strong className="mono">
                  {formatCompactBRL(kpis.pipeline)}
                </strong>
              </div>
            </section>

            <section className="b-section b-pipeline">
              <header className="b-section__head">
                <h2>Pipeline</h2>
                <span className="mono">64 abertos</span>
              </header>
              <div className="b-stages">
                {stages.map((stage) => (
                  <div className="b-stage" key={stage.key}>
                    <div className="b-stage__top">
                      <span>
                        <i data-tone={stage.tone} />
                        {stage.label}
                      </span>
                      <strong className="mono">
                        {formatCompactBRL(stage.value)}
                      </strong>
                    </div>
                    <div className="b-stage__track">
                      <span
                        data-tone={stage.tone}
                        style={{ width: `${(stage.value / maxStage) * 100}%` }}
                      />
                    </div>
                    <span className="b-stage__count mono">
                      {stage.count} negócios
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="b-section">
              <header className="b-section__head">
                <h2>Saúde da carteira</h2>
                <span className="mono">{kpis.customers}</span>
              </header>
              <div className="b-health">
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
                  size={116}
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
          </aside>
        </section>

        <section className="b-section b-trend">
          <header className="b-section__head">
            <h2>Ganho vs. perda</h2>
            <div className="b-legend">
              <span>
                <i data-tone="success" /> Ganho
              </span>
              <span>
                <i data-tone="danger" /> Perda
              </span>
            </div>
          </header>
          <div className="b-chart">
            <TrendChart data={trend} height={196} />
          </div>
        </section>

        <section className="b-section b-attention">
          <header className="b-section__head">
            <h2>Precisa de atenção</h2>
            <span className="mono">4 negócios</span>
          </header>
          <div className="b-attention__grid">
            {riskDeals.map((deal) => (
              <button type="button" className="b-risk" key={deal.id}>
                <span className="b-risk__flag">
                  <AlertTriangle size={12} />
                  {deal.days} dias parado
                </span>
                <strong>{deal.title}</strong>
                <span className="b-risk__customer">{deal.customer}</span>
                <span className="b-risk__foot">
                  <span>{deal.stage}</span>
                  <span className="mono">{formatBRL(deal.value)}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
