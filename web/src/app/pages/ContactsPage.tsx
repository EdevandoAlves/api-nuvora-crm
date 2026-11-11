import { ChevronRight, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from "../components/ui";
import type { Contact, Paginated } from "../types";
import { useApiQuery } from "../useApiQuery";

export function ContactsPage() {
  const contactsQuery = useApiQuery<Paginated<Contact>>("/contacts?limit=100");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const contacts = contactsQuery.data?.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter((contact) => {
      const haystack = [
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.phone,
        contact.position,
        contact.customerName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [contacts, search]);

  return (
    <div className="page">
      <PageHeader
        title="Contatos"
        description="Pessoas da carteira, por cliente e papel na relação."
        actions={
          <span className="toolbar__meta">
            Para editar, abra a ficha do cliente.
          </span>
        }
      />

      <div className="toolbar">
        <label className="toolbar__search">
          <Search size={14} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, cliente, cargo ou e-mail"
            aria-label="Buscar contatos"
          />
        </label>
        <span className="toolbar__meta mono">
          {filtered.length} de {contacts.length}
        </span>
      </div>

      {contactsQuery.loading ? (
        <div className="table-skeleton">
          {[0, 1, 2, 3, 4].map((item) => (
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
      ) : filtered.length === 0 ? (
        <EmptyState
          title={contacts.length ? "Nenhum contato encontrado" : "Sem contatos"}
          description={
            contacts.length
              ? "Ajuste a busca."
              : "Cadastre contatos na ficha de cada cliente."
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cliente</th>
                <th>Cargo</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Relação</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr
                  key={contact.id}
                  onClick={() => navigate(`/clientes/${contact.customerId}`)}
                >
                  <td className="is-strong">
                    {contact.firstName} {contact.lastName}
                  </td>
                  <td>{contact.customerName ?? "—"}</td>
                  <td>{contact.position ?? "—"}</td>
                  <td>{contact.email ?? "—"}</td>
                  <td className="mono">{contact.phone ?? "—"}</td>
                  <td>
                    {contact.isPrimary ? (
                      <Badge tone="accent">Principal</Badge>
                    ) : (
                      <span className="contact-meta">—</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Users size={14} />
                      <ChevronRight size={14} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
