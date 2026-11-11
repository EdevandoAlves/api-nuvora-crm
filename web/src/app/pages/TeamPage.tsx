import { Pencil, Plus } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { api, ApiError } from "../api";
import { useAuth } from "../auth";
import {
  Badge,
  Button,
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
import { formatDate, initials, isManagementRole, roleLabel } from "../format";
import type { TeamUser, UserRole } from "../types";
import { useApiQuery } from "../useApiQuery";

const roleTone: Record<
  UserRole,
  "accent" | "info" | "neutral" | "success" | "danger"
> = {
  OWNER: "accent",
  ADMIN: "info",
  MANAGER: "neutral",
  SALES: "success",
  SUPPORT: "neutral",
};

const allRoles: { value: UserRole; label: string }[] = [
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "SALES", label: "Sales" },
  { value: "SUPPORT", label: "Support" },
];

function allowedRoles(actorRole: UserRole | undefined) {
  if (actorRole === "OWNER") return allRoles;
  return allRoles.filter(
    (role) => role.value !== "OWNER" && role.value !== "ADMIN",
  );
}

function TeamUserModal({
  open,
  actorRole,
  user,
  onClose,
  onSaved,
}: {
  open: boolean;
  actorRole: UserRole | undefined;
  user: TeamUser | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "SALES",
    isActive: user?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const roles = allowedRoles(actorRole);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (user) {
        await api(`/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            role: form.role,
            isActive: form.isActive,
          }),
        });
      } else {
        await api("/users", {
          method: "POST",
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            role: form.role,
          }),
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
      title={user ? "Editar usuário" : "Novo usuário"}
      description="Papéis definem o que cada pessoa vê e pode alterar."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="team-user-form"
            loading={saving}
          >
            {user ? "Salvar usuário" : "Criar usuário"}
          </Button>
        </>
      }
    >
      <form id="team-user-form" className="form-grid" onSubmit={submit}>
        {error ? (
          <div className="field--full">
            <InlineNotice>{error}</InlineNotice>
          </div>
        ) : null}
        <TextField
          label="Nome"
          name="firstName"
          value={form.firstName}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              firstName: event.target.value,
            }))
          }
          required
        />
        <TextField
          label="Sobrenome"
          name="lastName"
          value={form.lastName}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              lastName: event.target.value,
            }))
          }
          required
        />
        {!user ? (
          <>
            <TextField
              label="E-mail"
              name="email"
              type="email"
              className="field--full"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              required
            />
            <TextField
              label="Senha inicial"
              name="password"
              type="password"
              className="field--full"
              minLength={8}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              hint="Mínimo de 8 caracteres."
              required
            />
          </>
        ) : null}
        <SelectField
          label="Papel"
          name="role"
          value={form.role}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              role: event.target.value as UserRole,
            }))
          }
          options={roles}
        />
        {user ? (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
            />
            Usuário ativo
          </label>
        ) : null}
      </form>
    </Modal>
  );
}

export function TeamPage() {
  const { user } = useAuth();
  const canRead = Boolean(user && isManagementRole(user.role));
  const usersQuery = useApiQuery<TeamUser[]>(canRead ? "/users" : null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamUser | null>(null);
  const [actionError, setActionError] = useState("");

  const canWrite = user?.role === "OWNER" || user?.role === "ADMIN";
  const users = usersQuery.data ?? [];

  const visibleUsers = useMemo(() => {
    if (user?.role === "OWNER") return users;
    return users;
  }, [users, user?.role]);

  const openCreate = () => {
    setEditing(null);
    setActionError("");
    setModalOpen(true);
  };

  const openEdit = (target: TeamUser) => {
    setEditing(target);
    setActionError("");
    setModalOpen(true);
  };

  if (!canRead) {
    return (
      <div className="page">
        <PageHeader
          title="Equipe"
          description="Usuários, papéis e limites da organização."
        />
        <InlineNotice>
          Seu papel permite apenas o próprio perfil. A gestão da equipe é
          restrita a Owner, Admin e Manager.
        </InlineNotice>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Equipe"
        description="Quem opera a organização e com qual papel."
        actions={
          canWrite ? (
            <Button variant="primary" icon={Plus} onClick={openCreate}>
              Novo usuário
            </Button>
          ) : undefined
        }
      />

      {actionError ? <InlineNotice>{actionError}</InlineNotice> : null}

      {usersQuery.loading ? (
        <div className="table-skeleton">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="sk-row" />
          ))}
        </div>
      ) : usersQuery.error ? (
        <ErrorState
          message={usersQuery.error}
          onRetry={() => {
            void usersQuery.reload();
          }}
        />
      ) : visibleUsers.length === 0 ? (
        <EmptyState
          title="Nenhum usuário"
          description="Crie o primeiro usuário da equipe."
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>E-mail</th>
                <th>Papel</th>
                <th>Status</th>
                <th>Último acesso</th>
                {canWrite ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((item) => {
                const canEditThis =
                  canWrite &&
                  (item.role !== "OWNER" || user?.role === "OWNER") &&
                  (item.role !== "ADMIN" || user?.role === "OWNER");
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="user-cell">
                        <span className="user-avatar">
                          {initials(item.firstName, item.lastName)}
                        </span>
                        <span className="is-strong">
                          {item.firstName} {item.lastName}
                        </span>
                      </div>
                    </td>
                    <td>{item.email}</td>
                    <td>
                      <Badge tone={roleTone[item.role]}>
                        {roleLabel(item.role)}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={item.isActive ? "success" : "neutral"}>
                        {item.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="mono">
                      {item.lastLoginAt
                        ? formatDate(item.lastLoginAt)
                        : "Nunca"}
                    </td>
                    {canWrite ? (
                      <td>
                        {canEditThis ? (
                          <div className="table-actions">
                            <IconButton
                              label="Editar usuário"
                              icon={Pencil}
                              size="sm"
                              onClick={() => openEdit(item)}
                            />
                          </div>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TeamUserModal
        key={`${editing?.id ?? "new"}-${modalOpen}`}
        open={modalOpen}
        actorRole={user?.role}
        user={editing}
        onClose={() => setModalOpen(false)}
        onSaved={usersQuery.reload}
      />
    </div>
  );
}
