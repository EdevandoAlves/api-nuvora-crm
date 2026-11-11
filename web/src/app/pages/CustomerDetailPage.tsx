import {
  ArrowLeft,
  CheckSquare2,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
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
  SelectField,
  Skeleton,
  TextareaField,
  TextField,
} from "../components/ui";
import {
  customerStatusLabel,
  customerStatusTone,
  formatBRL,
  formatCnpj,
  formatDate,
  formatTime,
  interactionTypeLabel,
} from "../format";
import type {
  Contact,
  Customer,
  Interaction,
  InteractionType,
  Paginated,
} from "../types";
import { useApiQuery } from "../useApiQuery";
import "../../styles/briefing.css";

const interactionIcons: Record<InteractionType, typeof Mail> = {
  EMAIL: Mail,
  CALL: Phone,
  MEETING: Users,
  NOTE: StickyNote,
  TASK: CheckSquare2,
  WHATSAPP: MessageCircle,
};

const interactionOptions = [
  { value: "CALL", label: "Ligação" },
  { value: "EMAIL", label: "E-mail" },
  { value: "MEETING", label: "Reunião" },
  { value: "NOTE", label: "Nota" },
  { value: "TASK", label: "Tarefa" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

function ContactFormModal({
  customerId,
  contact,
  open,
  onClose,
  onSaved,
}: {
  customerId: string;
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    firstName: contact?.firstName ?? "",
    lastName: contact?.lastName ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    position: contact?.position ?? "",
    linkedin: contact?.linkedin ?? "",
    notes: contact?.notes ?? "",
    isPrimary: contact?.isPrimary ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        position: form.position || undefined,
        linkedin: form.linkedin || undefined,
        notes: form.notes || undefined,
        isPrimary: form.isPrimary,
      };
      if (contact) {
        await api(`/customers/${customerId}/contacts/${contact.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api(`/customers/${customerId}/contacts`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
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
    <Modal
      open={open}
      title={contact ? "Editar contato" : "Novo contato"}
      description="Pessoas que participam da relação com este cliente."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="contact-form"
            loading={saving}
          >
            Salvar contato
          </Button>
        </>
      }
    >
      <form id="contact-form" className="form-grid" onSubmit={submit}>
        {error ? (
          <div className="field--full">
            <InlineNotice>{error}</InlineNotice>
          </div>
        ) : null}
        <TextField
          label="Nome"
          name="firstName"
          value={form.firstName}
          onChange={(event) => update("firstName", event.target.value)}
          required
        />
        <TextField
          label="Sobrenome"
          name="lastName"
          value={form.lastName}
          onChange={(event) => update("lastName", event.target.value)}
          required
        />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
        />
        <TextField
          label="Telefone"
          name="phone"
          value={form.phone}
          onChange={(event) => update("phone", event.target.value)}
        />
        <TextField
          label="Cargo"
          name="position"
          value={form.position}
          onChange={(event) => update("position", event.target.value)}
        />
        <TextField
          label="LinkedIn"
          name="linkedin"
          type="url"
          value={form.linkedin}
          onChange={(event) => update("linkedin", event.target.value)}
          placeholder="https://"
        />
        <div className="field--full">
          <TextareaField
            label="Notas"
            name="notes"
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
          />
        </div>
        <label className="checkbox field--full">
          <input
            type="checkbox"
            checked={form.isPrimary}
            onChange={(event) => update("isPrimary", event.target.checked)}
          />
          Contato principal deste cliente
        </label>
      </form>
    </Modal>
  );
}

function InteractionFormModal({
  customerId,
  contacts,
  interaction,
  open,
  onClose,
  onSaved,
}: {
  customerId: string;
  contacts: Contact[];
  interaction: Interaction | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    type: interaction?.type ?? "CALL",
    subject: interaction?.subject ?? "",
    description: interaction?.description ?? "",
    contactId: interaction?.contactId ?? "",
    duration:
      interaction?.duration === null || interaction?.duration === undefined
        ? ""
        : String(interaction.duration),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        type: form.type,
        subject: form.subject || undefined,
        description: form.description,
        contactId: form.contactId || undefined,
        duration: form.duration
          ? Number.parseInt(form.duration, 10)
          : undefined,
      };
      if (interaction) {
        await api(`/customers/${customerId}/interactions/${interaction.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api(`/customers/${customerId}/interactions`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
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
    <Modal
      open={open}
      title={interaction ? "Editar interação" : "Registrar interação"}
      description="Histórico de contato que alimenta a atividade do dashboard."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="interaction-form"
            loading={saving}
          >
            Salvar interação
          </Button>
        </>
      }
    >
      <form id="interaction-form" className="form-grid" onSubmit={submit}>
        {error ? (
          <div className="field--full">
            <InlineNotice>{error}</InlineNotice>
          </div>
        ) : null}
        <SelectField
          label="Tipo"
          name="type"
          value={form.type}
          onChange={(event) => update("type", event.target.value)}
          options={interactionOptions}
        />
        <TextField
          label="Assunto"
          name="subject"
          value={form.subject}
          onChange={(event) => update("subject", event.target.value)}
        />
        <SelectField
          label="Contato"
          name="contactId"
          value={form.contactId}
          onChange={(event) => update("contactId", event.target.value)}
          options={[
            { value: "", label: "Sem contato específico" },
            ...contacts.map((contact) => ({
              value: contact.id,
              label: `${contact.firstName} ${contact.lastName}`,
            })),
          ]}
        />
        <TextField
          label="Duração (min)"
          name="duration"
          type="number"
          min={0}
          value={form.duration}
          onChange={(event) => update("duration", event.target.value)}
        />
        <div className="field--full">
          <TextareaField
            label="Descrição"
            name="description"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const customerQuery = useApiQuery<Customer>(id ? `/customers/${id}` : null);
  const contactsQuery = useApiQuery<Contact[]>(
    id ? `/customers/${id}/contacts` : null,
  );
  const interactionsQuery = useApiQuery<Paginated<Interaction>>(
    id ? `/customers/${id}/interactions?limit=50` : null,
  );

  const [contactModal, setContactModal] = useState<{
    open: boolean;
    contact: Contact | null;
  }>({ open: false, contact: null });
  const [interactionModal, setInteractionModal] = useState<{
    open: boolean;
    interaction: Interaction | null;
  }>({ open: false, interaction: null });
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [deletingInteraction, setDeletingInteraction] =
    useState<Interaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadRelated = async () => {
    await Promise.all([contactsQuery.reload(), interactionsQuery.reload()]);
  };

  if (!id) {
    return (
      <div className="page">
        <ErrorState message="Cliente não encontrado." />
      </div>
    );
  }

  if (customerQuery.loading) {
    return (
      <div className="page">
        <Skeleton className="sk-title" />
        <Skeleton className="sk-panel" />
      </div>
    );
  }

  if (customerQuery.error || !customerQuery.data) {
    return (
      <div className="page">
        <ErrorState
          message={customerQuery.error || "Cliente não encontrado."}
          onRetry={() => {
            void customerQuery.reload();
          }}
        />
      </div>
    );
  }

  const customer = customerQuery.data;
  const contacts = contactsQuery.data ?? [];
  const interactions = interactionsQuery.data?.data ?? [];

  const confirmDeleteContact = async () => {
    if (!deletingContact) return;
    setDeleteLoading(true);
    setActionError("");
    try {
      await api(`/customers/${id}/contacts/${deletingContact.id}`, {
        method: "DELETE",
      });
      setDeletingContact(null);
      await loadRelated();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível remover o contato.",
      );
      setDeletingContact(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDeleteInteraction = async () => {
    if (!deletingInteraction) return;
    setDeleteLoading(true);
    setActionError("");
    try {
      await api(`/customers/${id}/interactions/${deletingInteraction.id}`, {
        method: "DELETE",
      });
      setDeletingInteraction(null);
      await loadRelated();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível remover a interação.",
      );
      setDeletingInteraction(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page">
      <Link to="/clientes" className="back-link">
        <ArrowLeft size={13} /> Clientes
      </Link>

      <header className="b-head">
        <div>
          <span className="b-date">{customer.industry ?? "Cliente"}</span>
          <h1>{customer.companyName}</h1>
          <p>
            {formatCnpj(customer.cnpj)}
            {customer.source ? ` · ${customer.source}` : ""}
            {customer.website ? ` · ${customer.website}` : ""}
          </p>
        </div>
        <div className="b-head__actions">
          <Badge tone={customerStatusTone(customer.status)}>
            {customerStatusLabel(customer.status)}
          </Badge>
          <Button
            variant="secondary"
            icon={Plus}
            onClick={() => setContactModal({ open: true, contact: null })}
          >
            Contato
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() =>
              setInteractionModal({ open: true, interaction: null })
            }
          >
            Interação
          </Button>
        </div>
      </header>

      <dl className="detail-list">
        <div>
          <dt>CNPJ</dt>
          <dd className="mono">{formatCnpj(customer.cnpj)}</dd>
        </div>
        <div>
          <dt>Setor</dt>
          <dd>{customer.industry ?? "—"}</dd>
        </div>
        <div>
          <dt>Funcionários</dt>
          <dd className="mono">{customer.employeeCount ?? "—"}</dd>
        </div>
        <div>
          <dt>Receita anual</dt>
          <dd className="mono">
            {customer.annualRevenue !== null
              ? formatBRL(customer.annualRevenue)
              : "—"}
          </dd>
        </div>
        <div>
          <dt>Site</dt>
          <dd>
            {customer.website ? (
              <a href={customer.website} target="_blank" rel="noreferrer">
                {customer.website}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt>Atualizado</dt>
          <dd className="mono">{formatDate(customer.updatedAt)}</dd>
        </div>
      </dl>

      {actionError ? <InlineNotice>{actionError}</InlineNotice> : null}

      <div className="detail-grid">
        <section className="b-section">
          <header className="b-section__head">
            <h2>Contatos</h2>
            <span className="mono">{contacts.length}</span>
          </header>
          {contactsQuery.loading ? (
            <div className="table-skeleton">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="sk-row" />
              ))}
            </div>
          ) : contactsQuery.error ? (
            <ErrorState
              message={contactsQuery.error}
              onRetry={() => {
                void contactsQuery.reload();
              }}
            />
          ) : contacts.length === 0 ? (
            <EmptyState
              title="Nenhum contato"
              description="Cadastre as pessoas que participam da relação com este cliente."
              action={
                <Button
                  variant="secondary"
                  icon={Plus}
                  onClick={() => setContactModal({ open: true, contact: null })}
                >
                  Novo contato
                </Button>
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cargo</th>
                    <th>Contato</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="is-strong">
                        {contact.firstName} {contact.lastName}
                        {contact.isPrimary ? (
                          <span className="contact-primary">principal</span>
                        ) : null}
                      </td>
                      <td>{contact.position ?? "—"}</td>
                      <td>
                        <span className="contact-meta">
                          {contact.email ?? contact.phone ?? "—"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <IconButton
                            label="Editar contato"
                            icon={Pencil}
                            size="sm"
                            onClick={() =>
                              setContactModal({ open: true, contact })
                            }
                          />
                          <IconButton
                            label="Remover contato"
                            icon={Trash2}
                            size="sm"
                            onClick={() => setDeletingContact(contact)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="detail-stack">
          <section className="b-section">
            <header className="b-section__head">
              <h2>Interações</h2>
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={() =>
                  setInteractionModal({ open: true, interaction: null })
                }
              >
                Registrar
              </Button>
            </header>
            {interactionsQuery.loading ? (
              <div className="table-skeleton">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="sk-row" />
                ))}
              </div>
            ) : interactionsQuery.error ? (
              <ErrorState
                message={interactionsQuery.error}
                onRetry={() => {
                  void interactionsQuery.reload();
                }}
              />
            ) : interactions.length === 0 ? (
              <EmptyState
                title="Sem interações"
                description="Registre a primeira ligação, reunião ou nota."
              />
            ) : (
              <div className="history-list">
                {interactions.map((interaction) => {
                  const Icon = interactionIcons[interaction.type];
                  const contact = contacts.find(
                    (item) => item.id === interaction.contactId,
                  );
                  return (
                    <div className="history-row" key={interaction.id}>
                      <span className="history-row__icon">
                        <Icon size={12} />
                      </span>
                      <div className="history-row__body">
                        <span className="history-row__title">
                          {interaction.subject ??
                            interactionTypeLabel(interaction.type)}
                        </span>
                        <span className="history-row__meta">
                          {formatTime(interaction.createdAt)} ·{" "}
                          {formatDate(interaction.createdAt)}
                          {contact
                            ? ` · ${contact.firstName} ${contact.lastName}`
                            : ""}
                        </span>
                        <p>{interaction.description}</p>
                      </div>
                      <div className="history-row__actions">
                        <IconButton
                          label="Editar interação"
                          icon={Pencil}
                          size="sm"
                          onClick={() =>
                            setInteractionModal({
                              open: true,
                              interaction,
                            })
                          }
                        />
                        <IconButton
                          label="Remover interação"
                          icon={Trash2}
                          size="sm"
                          onClick={() => setDeletingInteraction(interaction)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </div>

      <ContactFormModal
        key={`${contactModal.contact?.id ?? "new-contact"}-${contactModal.open}`}
        customerId={id}
        contact={contactModal.contact}
        open={contactModal.open}
        onClose={() => setContactModal({ open: false, contact: null })}
        onSaved={loadRelated}
      />

      <InteractionFormModal
        key={`${interactionModal.interaction?.id ?? "new-interaction"}-${interactionModal.open}`}
        customerId={id}
        contacts={contacts}
        interaction={interactionModal.interaction}
        open={interactionModal.open}
        onClose={() => setInteractionModal({ open: false, interaction: null })}
        onSaved={loadRelated}
      />

      <ConfirmDialog
        open={Boolean(deletingContact)}
        title="Remover contato"
        message={`Remover ${deletingContact?.firstName ?? "este contato"}?`}
        confirmLabel="Remover"
        loading={deleteLoading}
        onConfirm={() => {
          void confirmDeleteContact();
        }}
        onClose={() => setDeletingContact(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingInteraction)}
        title="Remover interação"
        message="A interação será removida do histórico deste cliente."
        confirmLabel="Remover"
        loading={deleteLoading}
        onConfirm={() => {
          void confirmDeleteInteraction();
        }}
        onClose={() => setDeletingInteraction(null)}
      />
    </div>
  );
}
