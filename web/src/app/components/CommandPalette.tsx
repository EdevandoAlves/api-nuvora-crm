import {
  BriefcaseBusiness,
  CheckSquare2,
  Contact,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

type CommandItem = {
  label: string;
  hint?: string;
  to?: string;
  action?: "logout";
  icon: typeof LayoutDashboard;
};

const items: CommandItem[] = [
  { label: "Dashboard", hint: "Visão geral", to: "/dashboard", icon: LayoutDashboard },
  { label: "Clientes", hint: "Carteira", to: "/clientes", icon: Users },
  { label: "Negócios", hint: "Pipeline", to: "/negocios", icon: BriefcaseBusiness },
  { label: "Tarefas", hint: "Agenda", to: "/tarefas", icon: CheckSquare2 },
  { label: "Contatos", hint: "Pessoas", to: "/contatos", icon: Contact },
  { label: "Produtos", hint: "Catálogo", to: "/produtos", icon: Package },
  { label: "Equipe", hint: "Usuários", to: "/equipe", icon: UserCog },
  { label: "Sair", hint: "Encerrar sessão", action: "logout", icon: LogOut },
];

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      `${item.label} ${item.hint ?? ""}`.toLowerCase().includes(term),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const run = (item: CommandItem) => {
    onClose();
    if (item.action === "logout") {
      logout();
      navigate("/login", { replace: true });
      return;
    }
    if (item.to) navigate(item.to);
  };

  return (
    <div className="command-overlay" onMouseDown={onClose}>
      <div
        className="command"
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="command__search">
          <Search size={16} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((current) =>
                  filtered.length ? (current + 1) % filtered.length : 0,
                );
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((current) =>
                  filtered.length
                    ? (current - 1 + filtered.length) % filtered.length
                    : 0,
                );
              }
              if (event.key === "Enter" && filtered[active]) {
                event.preventDefault();
                run(filtered[active]);
              }
            }}
            placeholder="Ir para, buscar ou executar…"
            aria-label="Buscar comandos"
          />
          <kbd>Esc</kbd>
        </div>

        <div className="command__list" role="listbox">
          {filtered.length === 0 ? (
            <p className="command__empty">Nenhum comando encontrado.</p>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  className={`command__item${index === active ? " is-active" : ""}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => run(item)}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                  {item.hint ? <small>{item.hint}</small> : null}
                </button>
              );
            })
          )}
        </div>

        <footer className="command__footer">
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc fechar</span>
        </footer>
      </div>
    </div>
  );
}
