import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckSquare2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  StickyNote,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Donut, TrendChart } from "../../components/Charts";
import {
  EmptyState,
  ErrorState,
  IconButton,
  Button,
  Skeleton,
} from "../components/ui";
import {
  formatBRL,
  formatCompactBRL,
  formatDateLong,
  formatDayLabel,
  formatPercent,
  formatTime,
  formatWeekLabel,
  priorityLabel,
  stageLabel,
  taskTypeLabel,
} from "../format";
import type { DealStage, DashboardActivity } from "../types";
import { useDashboardData } from "./useDashboardData";
import "../../styles/briefing.css";

const stageOrder: DealStage[] = [
  "QUALIFICATION",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
];

const activityIcons: Record<
  DashboardActivity["type"],
  typeof BriefcaseBusiness
> = {
  EMAIL: Mail,
  CALL: Phone,
  MEETING: Users,
  NOTE: StickyNote,
  TASK: CheckSquare2,
  WHATSAPP: MessageCircle,
};

const healthItems = [
  { key: "LEAD", label: "Lead", tone: "5" },
  { key: "PROSPECT", label: "Prospect", tone: "3" },
  { key: "CUSTOMER", label: "Cliente", tone: "2" },
  { key: "CHURNED", label: "Churn", tone: "4" },
];

function DashboardSkeleton() {
  return (
    <div className="b-main" aria-busy="true">
      <div className="b-head">
        <div>
          <Skeleton className="sk-date" />
          <Skeleton className="sk-title" />
          <Skeleton className="sk-subtitle" />
        </div>
      </div>
      <div className="b-pulse">
        {[0, 1, 2, 3].map((item) => (
          <div key={item}>
            <Skeleton className="sk-label" />
            <Skeleton className="sk-number" />
          </div>
        ))}
      </div>
      <div className="b-grid">
        <div className="b-left">
          <Skeleton className="sk-panel" />
          <Skeleton className="sk-panel" />
        </div>
        <div className="b-right">
          <Skeleton className="sk-panel" />
          <Skeleton className="sk-panel" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data, loading, error, reload } = useDashboardData();
  const navigate = useNavigate();
  const [today] = useState(() => new Date());

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="b-main">
        <ErrorState
          message={error}
          onRetry={() => {
            void reload();
          }}
        />
      </div>
    );
  }

  if (!data) return null;

  const { summary, activity, trend, tasks, topDeals } = data;
  const closed = summary.deals.wonValue + summary.deals.lostValue;
  const winRate = closed > 0 ? (summary.deals.wonValue / closed) * 100 : 0;
  const openDealCount = stageOrder
    .slice(0, 3)
    .reduce((total, stage) => total + (summary.deals.byStage[stage] ?? 0), 0);
  const maxStageValue = Math.max(
    ...stageOrder.map((stage) => summary.deals.valueByStage[stage] ?? 0),
    1,
  );
  const healthData = healthItems.map((item) => ({
    label: item.label,
    value: summary.customers.byStatus[item.key] ?? 0,
    tone: item.tone,
  }));
  const trendData = trend.map((point) => ({
    label: formatWeekLabel(point.weekStart),
    won: point.won,
    lost: point.lost,
  }));
  const hasTrend = trendData.some((point) => point.won > 0 || point.lost > 0);

  return (
    <div className="b-main">
      <header className="b-head">
        <div>
          <span className="b-date">{formatDateLong(today)}</span>
          <h1>O que merece atenção hoje</h1>
          <p>
            Um recorte direto da operação: caixa, pipeline e próximos passos.
          </p>
        </div>
        <div className="b-head__actions">
          <IconButton
            label="Buscar"
            icon={Search}
            onClick={() => window.dispatchEvent(new Event("nuvora:command"))}
          />
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={loading}
            onClick={() => {
              void reload();
            }}
          >
            Atualizar
          </Button>
        </div>
      </header>

      <section className="b-pulse" aria-label="Resumo do dia">
        <div>
          <span>Pipeline aberto</span>
          <strong className="mono">
            {formatCompactBRL(summary.deals.pipelineValue)}
          </strong>
          <em className="is-muted">{openDealCount} em aberto</em>
        </div>
        <div>
          <span>Ganho</span>
          <strong className="mono">
            {formatCompactBRL(summary.deals.wonValue)}
          </strong>
          <em className="is-up">
            <ArrowUpRight size={12} />
            {summary.deals.byStage.CLOSED_WON ?? 0} fechados
          </em>
        </div>
        <div>
          <span>Perdido</span>
          <strong className="mono">
            {formatCompactBRL(summary.deals.lostValue)}
          </strong>
          <em className="is-muted">
            {summary.deals.byStage.CLOSED_LOST ?? 0} perdidos
          </em>
        </div>
        <div>
          <span>Taxa de ganho</span>
          <strong className="mono">{formatPercent(winRate)}</strong>
          <em className="is-muted">ganhos / fechados</em>
        </div>
      </section>

      <section className="b-grid">
        <div className="b-left">
          <section className="b-section">
            <header className="b-section__head">
              <h2>Hoje</h2>
              <span className="mono">{summary.tasks.pending} pendentes</span>
            </header>
            {tasks.length === 0 ? (
              <EmptyState
                title="Nenhuma tarefa para hoje"
                description="Quando houver follow-ups pendentes, eles aparecem aqui."
              />
            ) : (
              <ul className="b-agenda">
                {tasks.map((task) => (
                  <li key={task.id} className="b-agenda__row">
                    <span className="b-agenda__time mono">
                      {formatDayLabel(task.dueDate)}
                    </span>
                    <span className="b-agenda__line" aria-hidden="true">
                      <i />
                    </span>
                    <div className="b-agenda__copy">
                      <span className="b-agenda__title">{task.title}</span>
                      <span className="b-agenda__meta">
                        {task.customerName ?? "Cliente"} ·{" "}
                        {taskTypeLabel(task.type)}
                      </span>
                    </div>
                    <span
                      className="b-agenda__priority"
                      data-p={task.priority.toLowerCase()}
                    >
                      {priorityLabel(task.priority)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="b-section">
            <header className="b-section__head">
              <h2>Atividade</h2>
              <span className="mono">
                {summary.interactions.last30Days} nos últimos 30 dias
              </span>
            </header>
            {activity.length === 0 ? (
              <EmptyState
                title="Sem atividade recente"
                description="Interações registradas nos clientes aparecem neste histórico."
              />
            ) : (
              <ol className="b-timeline">
                {activity.map((item) => {
                  const Icon = activityIcons[item.type];
                  return (
                    <li key={item.id} className="b-timeline__row">
                      <span className="b-timeline__dot">
                        <Icon size={11} />
                      </span>
                      <span className="b-timeline__time mono">
                        {formatTime(item.createdAt)}
                      </span>
                      <div>
                        <span className="b-timeline__text">
                          {item.subject ?? item.description}
                        </span>
                        <span className="b-timeline__meta">
                          {item.customer.companyName}
                          {item.user ? ` · ${item.user.firstName}` : ""}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        <aside className="b-right">
          <section className="b-cash">
            <span className="b-cash__label">Caixa</span>
            <strong className="b-cash__value mono">
              {formatCompactBRL(summary.deals.wonValue)}
            </strong>
            <div className="b-cash__row">
              <span>Ganho</span>
              <strong className="mono">
                {formatCompactBRL(summary.deals.wonValue)}
              </strong>
            </div>
            <div className="b-cash__row">
              <span>Perdido</span>
              <strong className="mono is-down">
                {formatCompactBRL(summary.deals.lostValue)}
              </strong>
            </div>
            <div className="b-cash__row">
              <span>Pipeline aberto</span>
              <strong className="mono">
                {formatCompactBRL(summary.deals.pipelineValue)}
              </strong>
            </div>
          </section>

          <section className="b-section b-pipeline">
            <header className="b-section__head">
              <h2>Pipeline</h2>
              <span className="mono">{openDealCount} abertos</span>
            </header>
            <div className="b-stages">
              {stageOrder.map((stage) => {
                const value = summary.deals.valueByStage[stage] ?? 0;
                const count = summary.deals.byStage[stage] ?? 0;
                return (
                  <div className="b-stage" key={stage}>
                    <div className="b-stage__top">
                      <span>
                        <i
                          data-tone={
                            stage === "CLOSED_WON"
                              ? "success"
                              : stage === "CLOSED_LOST"
                                ? "danger"
                                : stage === "NEGOTIATION"
                                  ? "accent"
                                  : stage === "PROPOSAL"
                                    ? "info"
                                    : "slate"
                          }
                        />
                        {stageLabel(stage)}
                      </span>
                      <strong className="mono">
                        {formatCompactBRL(value)}
                      </strong>
                    </div>
                    <div className="b-stage__track">
                      <span
                        data-tone={
                          stage === "CLOSED_WON"
                            ? "success"
                            : stage === "CLOSED_LOST"
                              ? "danger"
                              : stage === "NEGOTIATION"
                                ? "accent"
                                : stage === "PROPOSAL"
                                  ? "info"
                                  : "slate"
                        }
                        style={{ width: `${(value / maxStageValue) * 100}%` }}
                      />
                    </div>
                    <span className="b-stage__count mono">
                      {count} {count === 1 ? "negócio" : "negócios"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="b-section">
            <header className="b-section__head">
              <h2>Saúde da carteira</h2>
              <span className="mono">{summary.customers.total}</span>
            </header>
            <div className="b-health">
              <Donut
                data={healthData}
                centerValue={String(summary.customers.total)}
                centerLabel="clientes"
                size={116}
              />
              <ul>
                {healthData.map((item) => (
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
        {hasTrend ? (
          <div className="b-chart">
            <TrendChart
              data={trendData}
              height={196}
              formatY={(value) => `${Math.round(value / 1000)}k`}
            />
          </div>
        ) : (
          <EmptyState
            title="Ainda não há negócios fechados"
            description="O comparativo de ganho e perda aparece quando houver negócios concluídos."
          />
        )}
      </section>

      <section className="b-section b-attention">
        <header className="b-section__head">
          <h2>Maiores negócios abertos</h2>
          <span className="mono">{topDeals.length} em aberto</span>
        </header>
        {topDeals.length === 0 ? (
          <EmptyState
            title="Nenhum negócio em aberto"
            description="Crie um negócio para começar a acompanhar o pipeline."
          />
        ) : (
          <div className="b-attention__grid">
            {topDeals.map((deal) => (
              <button
                type="button"
                className="b-risk b-deal"
                key={deal.id}
                onClick={() => navigate("/negocios")}
              >
                <span className="b-deal__stage">
                  {stageLabel(deal.stage)}
                </span>
                <strong>{deal.title}</strong>
                <span className="b-risk__customer">
                  {deal.customerName ?? "Cliente"}
                </span>
                <span className="b-risk__foot">
                  <span>{deal.probability}% de probabilidade</span>
                  <span className="mono">{formatBRL(deal.value)}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
