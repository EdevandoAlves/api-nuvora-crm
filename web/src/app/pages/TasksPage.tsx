import { Check, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
  TextareaField,
  TextField,
} from "../components/ui";
import {
  formatDate,
  formatDayLabel,
  isOpenStage,
  priorityLabel,
  taskTypeLabel,
} from "../format";
import type {
  Customer,
  Deal,
  Paginated,
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "../types";
import { useApiQuery } from "../useApiQuery";

const typeOptions = [
  { value: "CALL", label: "Ligação" },
  { value: "EMAIL", label: "E-mail" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "DEMO", label: "Demo" },
  { value: "PROPOSAL", label: "Proposta" },
  { value: "MEETING", label: "Reunião" },
];

const priorityOptions = [
  { value: "HIGH", label: "Alta" },
  { value: "MEDIUM", label: "Média" },
  { value: "LOW", label: "Baixa" },
];

const statusOptions = [
  { value: "PENDING", label: "Pendente" },
  { value: "COMPLETED", label: "Concluída" },
  { value: "CANCELLED", label: "Cancelada" },
];

const priorityTone: Record<TaskPriority, "danger" | "accent" | "neutral"> = {
  HIGH: "danger",
  MEDIUM: "accent",
  LOW: "neutral",
};

const statusTone: Record<TaskStatus, "info" | "success" | "neutral"> = {
  PENDING: "info",
  COMPLETED: "success",
  CANCELLED: "neutral",
};

type TaskForm = {
  customerId: string;
  dealId: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  dueDate: string;
};

function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const emptyForm: TaskForm = {
  customerId: "",
  dealId: "",
  title: "",
  description: "",
  type: "CALL",
  priority: "MEDIUM",
  dueDate: localToday(),
};

function TaskFormFields({
  form,
  customers,
  deals,
  includeRelations,
  onChange,
}: {
  form: TaskForm;
  customers: Customer[];
  deals: Deal[];
  includeRelations: boolean;
  onChange: (key: keyof TaskForm, value: string) => void;
}) {
  const customerDeals = deals.filter(
    (deal) => deal.customerId === form.customerId && isOpenStage(deal.stage),
  );

  return (
    <div className="form-grid">
      {includeRelations ? (
        <>
          <SelectField
            label="Cliente"
            name="customerId"
            className="field--full"
            value={form.customerId}
            onChange={(event) => {
              onChange("customerId", event.target.value);
              onChange("dealId", "");
            }}
            options={[
              { value: "", label: "Selecione um cliente" },
              ...customers.map((customer) => ({
                value: customer.id,
                label: customer.companyName,
              })),
            ]}
            required
          />
          <SelectField
            label="Negócio"
            name="dealId"
            value={form.dealId}
            onChange={(event) => onChange("dealId", event.target.value)}
            options={[
              { value: "", label: "Sem negócio" },
              ...customerDeals.map((deal) => ({
                value: deal.id,
                label: deal.title,
              })),
            ]}
            disabled={!form.customerId}
          />
        </>
      ) : null}
      <TextField
        label="Tarefa"
        name="title"
        className="field--full"
        value={form.title}
        onChange={(event) => onChange("title", event.target.value)}
        required
      />
      <SelectField
        label="Tipo"
        name="type"
        value={form.type}
        onChange={(event) => onChange("type", event.target.value)}
        options={typeOptions}
      />
      <SelectField
        label="Prioridade"
        name="priority"
        value={form.priority}
        onChange={(event) => onChange("priority", event.target.value)}
        options={priorityOptions}
      />
      <TextField
        label="Prazo"
        name="dueDate"
        type="date"
        value={form.dueDate}
        onChange={(event) => onChange("dueDate", event.target.value)}
        required
      />
      <div className="field--full">
        <TextareaField
          label="Descrição"
          name="description"
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
        />
      </div>
    </div>
  );
}

function TaskCreateModal({
  open,
  customers,
  deals,
  onClose,
  onSaved,
}: {
  open: boolean;
  customers: Customer[];
  deals: Deal[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify({
          customerId: form.customerId,
          dealId: form.dealId || undefined,
          title: form.title,
          description: form.description || undefined,
          type: form.type,
          priority: form.priority,
          dueDate: form.dueDate,
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
      title="Nova tarefa"
      description="Um próximo passo com cliente, prazo e prioridade."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="task-create-form"
            loading={saving}
          >
            Criar tarefa
          </Button>
        </>
      }
    >
      <form id="task-create-form" onSubmit={submit}>
        {error ? <InlineNotice>{error}</InlineNotice> : null}
        <TaskFormFields
          form={form}
          customers={customers}
          deals={deals}
          includeRelations
          onChange={(key, value) =>
            setForm((current) => ({ ...current, [key]: value }))
          }
        />
      </form>
    </Modal>
  );
}

function TaskDrawer({
  task,
  onClose,
  onSaved,
  onDelete,
  onStatusChange,
}: {
  task: Task | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  const [form, setForm] = useState<TaskForm>(() =>
    task
      ? {
          customerId: task.customerId,
          dealId: task.dealId ?? "",
          title: task.title,
          description: task.description ?? "",
          type: task.type,
          priority: task.priority,
          dueDate: task.dueDate,
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!task) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(`/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          type: form.type,
          priority: form.priority,
          dueDate: form.dueDate,
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
      title={task.title}
      description={`${task.customerName ?? "Cliente"} · ${taskTypeLabel(task.type)}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="danger" icon={Trash2} onClick={() => onDelete(task)}>
            Remover
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="task-edit-form"
            loading={saving}
          >
            Salvar
          </Button>
        </>
      }
    >
      <div className="drawer-section">
        <SelectField
          label="Status"
          name="status"
          value={task.status}
          onChange={(event) =>
            onStatusChange(task, event.target.value as TaskStatus)
          }
          options={statusOptions}
        />
        <div className="drawer-meta">
          <span className="mono">
            {formatDayLabel(task.dueDate)} · {formatDate(task.dueDate)}
          </span>
          <span>{priorityLabel(task.priority)}</span>
        </div>
      </div>

      <form id="task-edit-form" onSubmit={submit}>
        {error ? <InlineNotice>{error}</InlineNotice> : null}
        <TaskFormFields
          form={form}
          customers={[]}
          deals={[]}
          includeRelations={false}
          onChange={(key, value) =>
            setForm((current) => ({ ...current, [key]: value }))
          }
        />
      </form>
    </Drawer>
  );
}

export function TasksPage() {
  const tasksQuery = useApiQuery<Paginated<Task>>(
    "/tasks?limit=100&sortBy=dueDate&sortOrder=ASC",
  );
  const customersQuery = useApiQuery<Customer[]>("/customers");
  const dealsQuery = useApiQuery<Paginated<Deal>>(
    "/deals?limit=100&sortBy=createdAt&sortOrder=DESC",
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | TaskStatus>("ALL");
  const [priority, setPriority] = useState<"ALL" | TaskPriority>("ALL");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const tasks = tasksQuery.data?.data ?? [];
  const customers = customersQuery.data ?? [];
  const deals = dealsQuery.data?.data ?? [];
  const today = localToday();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = status === "ALL" || task.status === status;
      const matchesPriority = priority === "ALL" || task.priority === priority;
      const overdue = task.status === "PENDING" && task.dueDate < today;
      const matchesOverdue = !overdueOnly || overdue;
      const matchesTerm =
        !term ||
        task.title.toLowerCase().includes(term) ||
        (task.customerName ?? "").toLowerCase().includes(term);
      return matchesStatus && matchesPriority && matchesOverdue && matchesTerm;
    });
  }, [tasks, search, status, priority, overdueOnly, today]);

  const reloadTasks = async () => {
    await tasksQuery.reload();
  };

  const changeStatus = async (task: Task, next: TaskStatus) => {
    setActionError("");
    try {
      const updated = await api<Task>(`/tasks/${task.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setSelected((current) =>
        current?.id === task.id ? { ...current, ...updated } : current,
      );
      await reloadTasks();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível mudar o status.",
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setActionError("");
    try {
      await api(`/tasks/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      setSelected(null);
      await reloadTasks();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Não foi possível remover.",
      );
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Tarefas"
        description="Próximos passos por cliente, prazo e prioridade."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateOpen(true)}
            disabled={customers.length === 0}
          >
            Nova tarefa
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
              placeholder="Buscar por tarefa ou cliente"
              aria-label="Buscar tarefas"
            />
          </label>
          <select
            className="toolbar__select"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "ALL" | TaskStatus)
            }
            aria-label="Filtrar por status"
          >
            <option value="ALL">Todos os status</option>
            {statusOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="toolbar__select"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as "ALL" | TaskPriority)
            }
            aria-label="Filtrar por prioridade"
          >
            <option value="ALL">Todas as prioridades</option>
            {priorityOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="toolbar-chip"
            aria-pressed={overdueOnly}
            onClick={() => setOverdueOnly((value) => !value)}
          >
            Atrasadas
          </button>
        </div>
        <span className="toolbar__meta mono">
          {filtered.length} de {tasks.length}
        </span>
      </div>

      {tasksQuery.loading ? (
        <div className="table-skeleton">
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="sk-row" />
          ))}
        </div>
      ) : tasksQuery.error ? (
        <ErrorState
          message={tasksQuery.error}
          onRetry={() => {
            void reloadTasks();
          }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={tasks.length ? "Nenhuma tarefa encontrada" : "Sem tarefas"}
          description={
            tasks.length
              ? "Ajuste os filtros ou a busca."
              : "Crie a primeira tarefa para organizar os próximos passos."
          }
          action={
            !tasks.length ? (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setCreateOpen(true)}
                disabled={customers.length === 0}
              >
                Nova tarefa
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th />
                <th>Tarefa</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Prioridade</th>
                <th>Prazo</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => {
                const overdue =
                  task.status === "PENDING" && task.dueDate < today;
                return (
                  <tr key={task.id} onClick={() => setSelected(task)}>
                    <td>
                      <button
                        type="button"
                        className={`task-toggle${task.status === "COMPLETED" ? " is-done" : ""}`}
                        aria-label={
                          task.status === "COMPLETED"
                            ? "Reabrir tarefa"
                            : "Concluir tarefa"
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          void changeStatus(
                            task,
                            task.status === "COMPLETED"
                              ? "PENDING"
                              : "COMPLETED",
                          );
                        }}
                      >
                        {task.status === "COMPLETED" ? (
                          <Check size={10} />
                        ) : null}
                      </button>
                    </td>
                    <td className="is-strong">{task.title}</td>
                    <td>{task.customerName ?? "—"}</td>
                    <td>{taskTypeLabel(task.type)}</td>
                    <td>
                      <Badge tone={priorityTone[task.priority]}>
                        {priorityLabel(task.priority)}
                      </Badge>
                    </td>
                    <td className={`mono${overdue ? " is-overdue" : ""}`}>
                      {formatDayLabel(task.dueDate)}
                    </td>
                    <td>
                      <Badge tone={statusTone[task.status]}>
                        {task.status === "PENDING"
                          ? "Pendente"
                          : task.status === "COMPLETED"
                            ? "Concluída"
                            : "Cancelada"}
                      </Badge>
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
                          onClick={() => setSelected(task)}
                        />
                        <IconButton
                          label="Remover"
                          icon={Trash2}
                          size="sm"
                          onClick={() => setDeleteTarget(task)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TaskCreateModal
        key={String(createOpen)}
        open={createOpen}
        customers={customers}
        deals={deals}
        onClose={() => setCreateOpen(false)}
        onSaved={reloadTasks}
      />

      <TaskDrawer
        key={selected?.id}
        task={selected}
        onClose={() => setSelected(null)}
        onSaved={reloadTasks}
        onDelete={(task) => setDeleteTarget(task)}
        onStatusChange={(task, next) => {
          setSelected(null);
          void changeStatus(task, next);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remover tarefa"
        message={`Remover ${deleteTarget?.title ?? "esta tarefa"}?`}
        confirmLabel="Remover"
        loading={deleteLoading}
        onConfirm={() => {
          void confirmDelete();
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
