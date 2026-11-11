import {
  CalendarDays,
  Pencil,
  Plus,
  Search,
  Trash2,
  Columns3,
  List,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { api, ApiError } from "../api";
import {
  Badge,
  Button,
  ConfirmDialog,
  Drawer,
  EmptyState,
  ErrorState,
  IconButton,
  InlineNotice,
  Modal,
  PageHeader,
  SelectField,
  Skeleton,
  TextField,
} from "../components/ui";
import { formatBRL, formatDate, formatPercent, stageLabel } from "../format";
import type { Customer, Deal, DealStage, Paginated } from "../types";
import { useApiQuery } from "../useApiQuery";
import "../../styles/briefing.css";

const stages: DealStage[] = [
  "QUALIFICATION",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
];

const stageTone: Record<
  DealStage,
  "neutral" | "info" | "accent" | "success" | "danger"
> = {
  QUALIFICATION: "neutral",
  PROPOSAL: "info",
  NEGOTIATION: "accent",
  CLOSED_WON: "success",
  CLOSED_LOST: "danger",
};

const stageOptions = stages.map((stage) => ({
  value: stage,
  label: stageLabel(stage),
}));

type DealForm = {
  customerId: string;
  title: string;
  value: string;
  probability: string;
  expectedCloseDate: string;
};

const emptyForm: DealForm = {
  customerId: "",
  title: "",
  value: "",
  probability: "0",
  expectedCloseDate: "",
};

function formFromDeal(deal: Deal): DealForm {
  return {
    customerId: deal.customerId,
    title: deal.title,
    value: String(deal.value),
    probability: String(deal.probability),
    expectedCloseDate: deal.expectedCloseDate ?? "",
  };
}

function DealFormFields({
  form,
  customers,
  onChange,
}: {
  form: DealForm;
  customers: Customer[];
  onChange: (key: keyof DealForm, value: string) => void;
}) {
  return (
    <div className="form-grid">
      <SelectField
        label="Cliente"
        name="customerId"
        className="field--full"
        value={form.customerId}
        onChange={(event) => onChange("customerId", event.target.value)}
        options={[
          { value: "", label: "Selecione um cliente" },
          ...customers.map((customer) => ({
            value: customer.id,
            label: customer.companyName,
          })),
        ]}
        required
      />
      <TextField
        label="Negócio"
        name="title"
        className="field--full"
        value={form.title}
        onChange={(event) => onChange("title", event.target.value)}
        required
      />
      <TextField
        label="Valor"
        name="value"
        type="number"
        min={0}
        step="0.01"
        value={form.value}
        onChange={(event) => onChange("value", event.target.value)}
        required
      />
      <TextField
        label="Probabilidade (%)"
        name="probability"
        type="number"
        min={0}
        max={100}
        value={form.probability}
        onChange={(event) => onChange("probability", event.target.value)}
      />
      <TextField
        label="Previsão de fechamento"
        name="expectedCloseDate"
        type="date"
        value={form.expectedCloseDate}
        onChange={(event) => onChange("expectedCloseDate", event.target.value)}
      />
    </div>
  );
}

function DealCreateModal({
  open,
  customers,
  onClose,
  onSaved,
}: {
  open: boolean;
  customers: Customer[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<DealForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/deals", {
        method: "POST",
        body: JSON.stringify({
          customerId: form.customerId,
          title: form.title,
          value: Number.parseFloat(form.value),
          probability: Number.parseInt(form.probability || "0", 10),
          expectedCloseDate: form.expectedCloseDate || undefined,
        }),
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível criar.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Novo negócio"
      description="Uma negociação começa em Qualificação e pode mudar de estágio depois."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="deal-create-form"
            loading={saving}
          >
            Criar negócio
          </Button>
        </>
      }
    >
      <form id="deal-create-form" onSubmit={submit}>
        {error ? <InlineNotice>{error}</InlineNotice> : null}
        <DealFormFields
          form={form}
          customers={customers}
          onChange={(key, value) =>
            setForm((current) => ({ ...current, [key]: value }))
          }
        />
      </form>
    </Modal>
  );
}

function DealDrawer({
  deal,
  customers,
  onClose,
  onSaved,
  onDelete,
  onStageChange,
}: {
  deal: Deal | null;
  customers: Customer[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  onDelete: (deal: Deal) => void;
  onStageChange: (deal: Deal, stage: DealStage) => void;
}) {
  const [form, setForm] = useState<DealForm>(() =>
    deal ? formFromDeal(deal) : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!deal) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(`/deals/${deal.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          customerId: form.customerId,
          title: form.title,
          value: Number.parseFloat(form.value),
          probability: Number.parseInt(form.probability || "0", 10),
          expectedCloseDate: form.expectedCloseDate || undefined,
        }),
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open
      title={deal.title}
      description={`${deal.customerName ?? "Cliente"} · ${formatBRL(deal.value)}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="danger" icon={Trash2} onClick={() => onDelete(deal)}>
            Remover
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="deal-edit-form"
            loading={saving}
          >
            Salvar
          </Button>
        </>
      }
    >
      <div className="drawer-section">
        <SelectField
          label="Estágio"
          name="stage"
          value={deal.stage}
          onChange={(event) =>
            onStageChange(deal, event.target.value as DealStage)
          }
          options={stageOptions}
        />
        <div className="drawer-meta">
          <span>Probabilidade {formatPercent(deal.probability)}</span>
          <span className="mono">
            {deal.expectedCloseDate
              ? `fechamento ${formatDate(deal.expectedCloseDate)}`
              : "sem previsão"}
          </span>
        </div>
      </div>

      <form id="deal-edit-form" onSubmit={submit}>
        {error ? <InlineNotice>{error}</InlineNotice> : null}
        <DealFormFields
          form={form}
          customers={customers}
          onChange={(key, value) =>
            setForm((current) => ({ ...current, [key]: value }))
          }
        />
      </form>
    </Drawer>
  );
}

export function DealsPage() {
  const dealsQuery = useApiQuery<Paginated<Deal>>(
    "/deals?limit=100&sortBy=createdAt&sortOrder=DESC",
  );
  const customersQuery = useApiQuery<Customer[]>("/customers");
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<"ALL" | DealStage>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Deal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<DealStage | null>(null);
  const [lostTarget, setLostTarget] = useState<{
    deal: Deal;
    stage: DealStage;
  } | null>(null);
  const [lostReason, setLostReason] = useState("");

  const customers = customersQuery.data ?? [];
  const deals = dealsQuery.data?.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return deals.filter((deal) => {
      const matchesStage = stageFilter === "ALL" || deal.stage === stageFilter;
      const matchesTerm =
        !term ||
        deal.title.toLowerCase().includes(term) ||
        (deal.customerName ?? "").toLowerCase().includes(term);
      return matchesStage && matchesTerm;
    });
  }, [deals, search, stageFilter]);

  const reloadDeals = async () => {
    await dealsQuery.reload();
  };

  const changeStage = async (deal: Deal, stage: DealStage, reason?: string) => {
    setActionError("");
    try {
      const updated = await api<Deal>(`/deals/${deal.id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({
          stage,
          ...(reason ? { lostReason: reason } : {}),
        }),
      });
      setSelected((current) =>
        current?.id === deal.id ? { ...current, ...updated } : current,
      );
      await reloadDeals();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível mudar o estágio.",
      );
    }
  };

  const requestStageChange = (deal: Deal, stage: DealStage) => {
    if (stage === "CLOSED_LOST") {
      setLostReason("");
      setLostTarget({ deal, stage });
      return;
    }
    void changeStage(deal, stage);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setActionError("");
    try {
      await api(`/deals/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      setSelected(null);
      await reloadDeals();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Não foi possível remover.",
      );
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columnDeals = (stage: DealStage) =>
    filtered.filter((deal) => deal.stage === stage);

  return (
    <div className="page">
      <PageHeader
        title="Negócios"
        description="Pipeline por estágio, previsão de fechamento e itens por negociação."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateOpen(true)}
            disabled={customers.length === 0}
          >
            Novo negócio
          </Button>
        }
      />

      {actionError ? <InlineNotice>{actionError}</InlineNotice> : null}

      <div className="toolbar">
        <div className="toolbar__group">
          <label className="toolbar__search">
            <Search size={14} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por negócio ou cliente"
              aria-label="Buscar negócios"
            />
          </label>
          <select
            className="toolbar__select"
            value={stageFilter}
            onChange={(event) =>
              setStageFilter(event.target.value as "ALL" | DealStage)
            }
            aria-label="Filtrar por estágio"
          >
            <option value="ALL">Todos os estágios</option>
            {stageOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar__group">
          <span className="toolbar__meta mono">
            {filtered.length} de {deals.length}
          </span>
          <div className="segmented" role="group" aria-label="Visualização">
            <button
              type="button"
              aria-pressed={view === "kanban"}
              onClick={() => setView("kanban")}
            >
              <Columns3 size={13} /> Kanban
            </button>
            <button
              type="button"
              aria-pressed={view === "table"}
              onClick={() => setView("table")}
            >
              <List size={13} /> Tabela
            </button>
          </div>
        </div>
      </div>

      {dealsQuery.loading ? (
        <div className="kanban">
          {stages.map((stage) => (
            <div className="kanban-column" key={stage}>
              <Skeleton className="sk-kanban-head" />
              <Skeleton className="sk-deal-card" />
              <Skeleton className="sk-deal-card" />
            </div>
          ))}
        </div>
      ) : dealsQuery.error ? (
        <ErrorState
          message={dealsQuery.error}
          onRetry={() => {
            void reloadDeals();
          }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={deals.length ? "Nenhum negócio encontrado" : "Pipeline vazio"}
          description={
            deals.length
              ? "Ajuste a busca ou o filtro de estágio."
              : "Crie o primeiro negócio para começar a acompanhar o pipeline."
          }
          action={
            !deals.length ? (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setCreateOpen(true)}
                disabled={customers.length === 0}
              >
                Novo negócio
              </Button>
            ) : undefined
          }
        />
      ) : view === "kanban" ? (
        <div className="kanban">
          {stages.map((stage) => {
            const stageDeals = columnDeals(stage);
            const total = stageDeals.reduce(
              (sum, deal) => sum + Number(deal.value),
              0,
            );
            return (
              <section
                className={`kanban-column${dropStage === stage ? " is-over" : ""}`}
                key={stage}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropStage(stage);
                }}
                onDragLeave={() => setDropStage(null)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDropStage(null);
                  const id = event.dataTransfer.getData("text/plain");
                  const deal = deals.find((item) => item.id === id);
                  if (deal && deal.stage !== stage) {
                    requestStageChange(deal, stage);
                  }
                }}
              >
                <header className="kanban-column__head">
                  <span>
                    <i data-tone={stageTone[stage]} />
                    {stageLabel(stage)}
                  </span>
                  <strong className="mono">{stageDeals.length}</strong>
                </header>
                <div className="kanban-column__value mono">
                  {formatBRL(total)}
                </div>
                <div className="kanban-column__cards">
                  {stageDeals.map((deal) => (
                    <button
                      type="button"
                      className={`deal-card${dragging === deal.id ? " is-dragging" : ""}`}
                      key={deal.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", deal.id);
                        setDragging(deal.id);
                      }}
                      onDragEnd={() => setDragging(null)}
                      onClick={() => setSelected(deal)}
                    >
                      <span className="deal-card__title">{deal.title}</span>
                      <span className="deal-card__customer">
                        {deal.customerName ?? "Cliente"}
                      </span>
                      <span className="deal-card__foot">
                        <span className="deal-card__prob mono">
                          {formatPercent(deal.probability)}
                        </span>
                        <strong className="mono">
                          {formatBRL(deal.value)}
                        </strong>
                      </span>
                      {deal.expectedCloseDate ? (
                        <span className="deal-card__date mono">
                          <CalendarDays size={10} />
                          {formatDate(deal.expectedCloseDate)}
                        </span>
                      ) : null}
                    </button>
                  ))}
                  {stageDeals.length === 0 ? (
                    <span className="kanban-column__empty">Solte aqui</span>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Negócio</th>
                <th>Cliente</th>
                <th>Estágio</th>
                <th className="is-right">Valor</th>
                <th className="is-right">Probabilidade</th>
                <th>Fechamento</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((deal) => (
                <tr key={deal.id} onClick={() => setSelected(deal)}>
                  <td className="is-strong">{deal.title}</td>
                  <td>{deal.customerName ?? "—"}</td>
                  <td>
                    <Badge tone={stageTone[deal.stage]}>
                      {stageLabel(deal.stage)}
                    </Badge>
                  </td>
                  <td className="is-right mono">{formatBRL(deal.value)}</td>
                  <td className="is-right mono">
                    {formatPercent(deal.probability)}
                  </td>
                  <td className="mono">
                    {deal.expectedCloseDate
                      ? formatDate(deal.expectedCloseDate)
                      : "—"}
                  </td>
                  <td>
                    <div
                      className="table-actions"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <IconButton
                        label="Editar"
                        icon={Pencil}
                        size="sm"
                        onClick={() => setSelected(deal)}
                      />
                      <IconButton
                        label="Remover"
                        icon={Trash2}
                        size="sm"
                        onClick={() => setDeleteTarget(deal)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DealCreateModal
        key={String(createOpen)}
        open={createOpen}
        customers={customers}
        onClose={() => setCreateOpen(false)}
        onSaved={reloadDeals}
      />

      <DealDrawer
        key={selected?.id}
        deal={selected}
        customers={customers}
        onClose={() => setSelected(null)}
        onSaved={reloadDeals}
        onDelete={(deal) => setDeleteTarget(deal)}
        onStageChange={(deal, stage) => {
          setSelected(null);
          requestStageChange(deal, stage);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remover negócio"
        message={`Remover ${deleteTarget?.title ?? "este negócio"}? Negócios com itens precisam ter os itens removidos antes.`}
        confirmLabel="Remover"
        loading={deleteLoading}
        onConfirm={() => {
          void confirmDelete();
        }}
        onClose={() => setDeleteTarget(null)}
      />

      <Modal
        open={Boolean(lostTarget)}
        title="Marcar como perdido"
        description="Informe o motivo para manter o histórico da negociação."
        onClose={() => setLostTarget(null)}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLostTarget(null)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" form="lost-reason-form">
              Confirmar perda
            </Button>
          </>
        }
      >
        <form
          id="lost-reason-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!lostTarget) return;
            const target = lostTarget;
            setLostTarget(null);
            void changeStage(target.deal, target.stage, lostReason);
          }}
        >
          <TextField
            label="Motivo"
            name="lostReason"
            value={lostReason}
            onChange={(event) => setLostReason(event.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
