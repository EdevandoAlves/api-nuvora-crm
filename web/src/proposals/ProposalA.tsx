import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
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
import { Donut, Sparkline, TrendChart } from "../components/Charts";
import { Rail } from "../components/Rail";
import "./ProposalA.css";

const maxStage = Math.max(...stages.map((stage) => stage.value));

const activityIcons = {
  deal: BriefcaseBusiness,
  task: Check,
  note: StickyNote,
  call: Phone,
};

export function ProposalA() {
  return (
    <div className="a-shell">
      <Rail />
      <div className="a-main">
        <header className="a-topbar">
          <div className="a-crumb">
            Nuvora <span>/</span> Dashboard
          </div>
          <div className="a-actions">
            <button type="button" className="a-search">
              <Search size={15} />
              <span>Buscar clientes, negócios…</span>
              <kbd>⌘K</kbd>
            </button>
            <button type="button" className="a-period">
              <CalendarDays size={15} />
              Últimos 30 dias
              <ChevronDown size={14} />
            </button>
            <button type="button" className="a-primary">
              <Plus size={15} />
              Novo negócio
            </button>
          </div>
        </header>

        <main className="a-content">
          <div className="a-pagehead">
            <div>
              <h1>Dashboard</h1>
              <p>Visão operacional da carteira, do pipeline e do time.</p>
            </div>
            <span className="a-updated">
              <span className="a-updated__dot" />
              Atualizado há 2 min
            </span>
          </div>

          <section className="a-kpis" aria-label="Indicadores">
            <article className="a-kpi">
              <span className="a-kpi__label">Pipeline aberto</span>
              <strong className="a-kpi__value mono">
                {formatCompactBRL(kpis.pipeline)}
              </strong>
              <span className="a-kpi__foot">
                <span className="a-delta a-delta--up">
                  <ArrowUpRight size={12} /> 8,4%
                </span>
                <span>vs. período anterior</span>
              </span>
              <Sparkline data={[12, 15, 14, 18, 17, 21, 20, 24]} />
            </article>
            <article className="a-kpi">
              <span className="a-kpi__label">Ganho no mês</span>
              <strong className="a-kpi__value mono">
                {formatCompactBRL(kpis.won)}
              </strong>
              <span className="a-kpi__foot">
                <span className="a-delta a-delta--up">
                  <ArrowUpRight size={12} /> 12,1%
                </span>
                <span>9 negócios fechados</span>
              </span>
              <Sparkline
                data={[8, 9, 11, 10, 14, 13, 16, 18]}
                tone="var(--chart-2)"
              />
            </article>
            <article className="a-kpi">
              <span className="a-kpi__label">Tarefas para hoje</span>
              <strong className="a-kpi__value mono">{kpis.tasks}</strong>
              <span className="a-kpi__foot">
                <span className="a-delta a-delta--warn">3 atrasadas</span>
                <span>de 18 previstas</span>
              </span>
              <Sparkline data={[20, 18, 22, 19, 16, 18, 17, 18]} />
            </article>
            <article className="a-kpi">
              <span className="a-kpi__label">Conversão lead → cliente</span>
              <strong className="a-kpi__value mono">
                {formatPercent(kpis.conversion)}
              </strong>
              <span className="a-kpi__foot">
                <span className="a-delta a-delta--down">-1,2 pp</span>
                <span>meta 30%</span>
              </span>
              <Sparkline
                data={[22, 24, 23, 26, 25, 28, 27, 27]}
                tone="var(--chart-3)"
              />
            </article>
          </section>

          <section className="a-grid">
            <div className="a-col a-col--8">
              <article className="a-panel">
                <header className="a-panel__head">
                  <h2>Pipeline por estágio</h2>
                  <button type="button" className="a-link">
                    Ver negócios <ChevronRight size={14} />
                  </button>
                </header>
                <div className="a-panel__body a-stages">
                  {stages.map((stage) => (
                    <div className="a-stage" key={stage.key}>
                      <span className="a-stage__label">
                        <i data-tone={stage.tone} />
                        {stage.label}
                      </span>
                      <span className="a-stage__count mono">
                        {stage.count}
                      </span>
                      <div className="a-stage__track">
                        <span
                          data-tone={stage.tone}
                          style={{ width: `${(stage.value / maxStage) * 100}%` }}
                        />
                      </div>
                      <span className="a-stage__value mono">
                        {formatCompactBRL(stage.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="a-panel">
                <header className="a-panel__head">
                  <h2>Ganho vs. perda</h2>
                  <div className="a-legend">
                    <span>
                      <i data-tone="success" /> Ganho
                    </span>
                    <span>
                      <i data-tone="danger" /> Perda
                    </span>
                  </div>
                </header>
                <div className="a-chart">
                  <TrendChart data={trend} />
                </div>
              </article>

              <article className="a-panel">
                <header className="a-panel__head">
                  <h2>Negócios em risco</h2>
                  <span className="a-meta">
                    Sem atividade há mais de 7 dias
                  </span>
                </header>
                <div className="a-table-wrap">
                  <table className="a-table">
                    <thead>
                      <tr>
                        <th>Negócio</th>
                        <th>Cliente</th>
                        <th>Estágio</th>
                        <th className="is-right">Valor</th>
                        <th className="is-right">Dias parado</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {riskDeals.map((deal) => (
                        <tr key={deal.id}>
                          <td>{deal.title}</td>
                          <td>{deal.customer}</td>
                          <td>
                            <span className="a-stage-pill">{deal.stage}</span>
                          </td>
                          <td className="is-right mono">
                            {formatBRL(deal.value)}
                          </td>
                          <td className="is-right mono">{deal.days}</td>
                          <td className="is-right">
                            <button
                              type="button"
                              className="a-row-action"
                              aria-label={`Abrir ${deal.title}`}
                            >
                              <ChevronRight size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>

            <aside className="a-col a-col--4">
              <article className="a-panel">
                <header className="a-panel__head">
                  <h2>Tarefas de hoje</h2>
                  <span className="a-meta mono">{kpis.tasks}</span>
                </header>
                <ul className="a-tasks">
                  {tasks.map((task, index) => (
                    <li key={task.id} className="a-task">
                      <button
                        type="button"
                        className={`a-check${index === 4 ? " is-done" : ""}`}
                        aria-label={`Concluir ${task.title}`}
                      >
                        {index === 4 ? <Check size={11} /> : null}
                      </button>
                      <div className="a-task__copy">
                        <span className="a-task__title">{task.title}</span>
                        <span className="a-task__meta">
                          {task.customer} ·{" "}
                          <span className="mono">{task.time}</span>
                        </span>
                      </div>
                      <i
                        className="a-priority"
                        data-priority={task.priority}
                        title={`Prioridade ${task.priority}`}
                      />
                    </li>
                  ))}
                </ul>
              </article>

              <article className="a-panel">
                <header className="a-panel__head">
                  <h2>Saúde da carteira</h2>
                  <span className="a-meta mono">{kpis.customers}</span>
                </header>
                <div className="a-panel__body a-health">
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
                    size={118}
                  />
                  <ul className="a-health__legend">
                    {health.map((item) => (
                      <li key={item.label}>
                        <i data-tone={item.tone} />
                        <span>{item.label}</span>
                        <strong className="mono">{item.value}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="a-panel">
                <header className="a-panel__head">
                  <h2>Atividade recente</h2>
                  <button type="button" className="a-link">
                    Ver tudo
                  </button>
                </header>
                <ul className="a-activity">
                  {activity.map((item) => {
                    const Icon = activityIcons[item.kind];
                    return (
                      <li key={item.id} className="a-activity__row">
                        <span className="a-activity__icon">
                          <Icon size={13} />
                        </span>
                        <div>
                          <span className="a-activity__text">{item.text}</span>
                          <span className="a-activity__meta">
                            <span className="mono">{item.time}</span> ·{" "}
                            {item.meta}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </article>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
