import { Plus, Search, Trash2, Pencil, ChevronRight } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../api";
import {
  Badge,
  Button,
  ConfirmDialog,
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
import {
  customerStatusLabel,
  customerStatusTone,
  formatBRL,
  formatCnpj,
  formatDate,
} from "../format";
import type { Customer, CustomerStatus } from "../types";
import { useApiQuery } from "../useApiQuery";

type CustomerForm = {
  companyName: string;
  cnpj: string;
  industry: string;
  website: string;
  employeeCount: string;
  annualRevenue: string;
  status: CustomerStatus;
  source: string;
};

const emptyForm: CustomerForm = {
  companyName: "",
  cnpj: "",
  industry: "",
  website: "",
  employeeCount: "",
  annualRevenue: "",
  status: "LEAD",
  source: "",
};

const statusOptions = [
  { value: "LEAD", label: "Lead" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "CUSTOMER", label: "Cliente" },
  { value: "CHURNED", label: "Churn" },
];

function formFromCustomer(customer: Customer): CustomerForm {
  return {
    companyName: customer.companyName,
    cnpj: customer.cnpj ?? "",
    industry: customer.industry ?? "",
    website: customer.website ?? "",
    employeeCount:
      customer.employeeCount === null ? "" : String(customer.employeeCount),
    annualRevenue:
      customer.annualRevenue === null ? "" : String(customer.annualRevenue),
    status: customer.status,
    source: customer.source ?? "",
  };
}

export function CustomersPage() {
  const { data, loading, error, reload } =
    useApiQuery<Customer[]>("/customers");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | CustomerStatus>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter((customer) => {
      const matchesStatus = status === "ALL" || customer.status === status;
      const matchesTerm =
        !term ||
        customer.companyName.toLowerCase().includes(term) ||
        (customer.cnpj ?? "").includes(term) ||
        (customer.industry ?? "").toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [data, search, status]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setActionError("");
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setForm(formFromCustomer(customer));
    setFormError("");
    setActionError("");
    setModalOpen(true);
  };

  const update = (key: keyof CustomerForm) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        companyName: form.companyName.trim(),
        cnpj: form.cnpj || undefined,
        industry: form.industry || undefined,
        website: form.website || undefined,
        employeeCount: form.employeeCount
          ? Number.parseInt(form.employeeCount, 10)
          : undefined,
        annualRevenue: form.annualRevenue
          ? Number.parseFloat(form.annualRevenue)
          : undefined,
        status: form.status,
        source: form.source || undefined,
      };
      if (editing) {
        await api(`/customers/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/customers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setActionError("");
    try {
      await api(`/customers/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      await reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Não foi possível remover.",
      );
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Clientes"
        description="Carteira da organização, com status, dados cadastrais e acesso à ficha completa."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            Novo cliente
          </Button>
        }
      />

      <div className="toolbar">
        <div className="toolbar__group">
          <label className="toolbar__search">
            <Search size={14} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por empresa, CNPJ ou setor"
              aria-label="Buscar clientes"
            />
          </label>
          <select
            className="toolbar__select"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "ALL" | CustomerStatus)
            }
            aria-label="Filtrar por status"
          >
            <option value="ALL">Todos os status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <span className="toolbar__meta mono">
          {filtered.length} de {data?.length ?? 0}
        </span>
      </div>

      {actionError ? <InlineNotice>{actionError}</InlineNotice> : null}

      {loading ? (
        <div className="table-skeleton">
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="sk-row" />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            void reload();
          }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={data?.length ? "Nenhum cliente encontrado" : "Carteira vazia"}
          description={
            data?.length
              ? "Ajuste a busca ou o filtro de status."
              : "Cadastre o primeiro cliente para começar a operar."
          }
          action={
            !data?.length ? (
              <Button variant="primary" icon={Plus} onClick={openCreate}>
                Novo cliente
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>CNPJ</th>
                <th>Status</th>
                <th>Setor</th>
                <th className="is-right">Funcionários</th>
                <th className="is-right">Receita anual</th>
                <th>Atualizado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => navigate(`/clientes/${customer.id}`)}
                >
                  <td className="is-strong">{customer.companyName}</td>
                  <td className="mono">{formatCnpj(customer.cnpj)}</td>
                  <td>
                    <Badge tone={customerStatusTone(customer.status)}>
                      {customerStatusLabel(customer.status)}
                    </Badge>
                  </td>
                  <td>{customer.industry ?? "—"}</td>
                  <td className="is-right mono">
                    {customer.employeeCount ?? "—"}
                  </td>
                  <td className="is-right mono">
                    {customer.annualRevenue !== null
                      ? formatBRL(customer.annualRevenue)
                      : "—"}
                  </td>
                  <td className="mono">{formatDate(customer.updatedAt)}</td>
                  <td>
                    <div
                      className="table-actions"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <IconButton
                        label="Editar"
                        icon={Pencil}
                        size="sm"
                        onClick={() => openEdit(customer)}
                      />
                      <IconButton
                        label="Remover"
                        icon={Trash2}
                        size="sm"
                        onClick={() => setDeleting(customer)}
                      />
                      <ChevronRight size={14} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Editar cliente" : "Novo cliente"}
        description="Dados cadastrais usados na carteira e nos negócios."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="customer-form"
              loading={saving}
            >
              Salvar cliente
            </Button>
          </>
        }
      >
        <form id="customer-form" className="form-grid" onSubmit={submit}>
          {formError ? (
            <div className="field--full">
              <InlineNotice>{formError}</InlineNotice>
            </div>
          ) : null}
          <TextField
            label="Empresa"
            name="companyName"
            className="field--full"
            value={form.companyName}
            onChange={(event) => update("companyName")(event.target.value)}
            required
          />
          <TextField
            label="CNPJ"
            name="cnpj"
            value={form.cnpj}
            onChange={(event) =>
              update("cnpj")(event.target.value.replace(/\D/g, "").slice(0, 14))
            }
            inputMode="numeric"
            hint="14 dígitos, opcional."
          />
          <TextField
            label="Setor"
            name="industry"
            value={form.industry}
            onChange={(event) => update("industry")(event.target.value)}
          />
          <TextField
            label="Site"
            name="website"
            type="url"
            value={form.website}
            onChange={(event) => update("website")(event.target.value)}
            placeholder="https://"
          />
          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={(event) => update("status")(event.target.value)}
            options={statusOptions}
          />
          <TextField
            label="Funcionários"
            name="employeeCount"
            type="number"
            min={0}
            value={form.employeeCount}
            onChange={(event) => update("employeeCount")(event.target.value)}
          />
          <TextField
            label="Receita anual"
            name="annualRevenue"
            type="number"
            min={0}
            step="0.01"
            value={form.annualRevenue}
            onChange={(event) => update("annualRevenue")(event.target.value)}
          />
          <TextField
            label="Origem"
            name="source"
            value={form.source}
            onChange={(event) => update("source")(event.target.value)}
            placeholder="Indicação, inbound…"
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remover cliente"
        message={`Remover ${deleting?.companyName ?? "este cliente"}? A operação não pode ser desfeita.`}
        confirmLabel="Remover"
        loading={deleteLoading}
        onConfirm={() => {
          void confirmDelete();
        }}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
