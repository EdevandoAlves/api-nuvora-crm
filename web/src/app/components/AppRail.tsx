import {
  BriefcaseBusiness,
  CheckSquare2,
  ChevronDown,
  Command,
  Contact,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Sun,
  UserCog,
  Users,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { initials } from "../format";
import "../../components/Rail.css";
import "./app-shell.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/negocios", label: "Negócios", icon: BriefcaseBusiness },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare2 },
  { to: "/contatos", label: "Contatos", icon: Contact },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/equipe", label: "Equipe", icon: UserCog },
];

export function AppRail({
  onCommand,
  theme,
  onTheme,
}: {
  onCommand: () => void;
  theme: "light" | "dark";
  onTheme: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="rail">
      <NavLink to="/dashboard" className="rail__brand" aria-label="Nuvora">
        <span className="rail__mark">n</span>
      </NavLink>

      <nav className="rail__nav" aria-label="Navegação principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="rail__item"
              aria-label={item.label}
              title={item.label}
            >
              <Icon size={18} />
              <span className="rail__tooltip">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="rail__bottom">
        <button
          type="button"
          className="rail__item"
          onClick={onCommand}
          aria-label="Paleta de comandos"
          title="Paleta de comandos (Ctrl/Cmd+K)"
        >
          <Command size={18} />
          <span className="rail__tooltip">Comandos</span>
        </button>
        <button
          type="button"
          className="rail__item"
          onClick={onTheme}
          aria-label={theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
          title={theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span className="rail__tooltip">
            {theme === "dark" ? "Tema claro" : "Tema escuro"}
          </span>
        </button>

        <div className="rail__user">
          <button
            type="button"
            className="rail__avatar"
            aria-label="Menu do usuário"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {initials(user.firstName, user.lastName)}
            <ChevronDown size={10} className="rail__user-chevron" />
          </button>
          {menuOpen ? (
            <div className="rail__menu" role="menu">
              <div className="rail__menu-user">
                <strong>
                  {user.firstName} {user.lastName}
                </strong>
                <span>{user.email}</span>
              </div>
              <button
                type="button"
                role="menuitem"
                className="rail__menu-item"
                onClick={handleLogout}
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
