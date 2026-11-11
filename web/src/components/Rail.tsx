import {
  BriefcaseBusiness,
  CheckSquare2,
  Command,
  Contact,
  LayoutDashboard,
  Package,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { navItems } from "../data";
import "./Rail.css";

const icons = {
  dashboard: LayoutDashboard,
  clientes: Users,
  deals: BriefcaseBusiness,
  tarefas: CheckSquare2,
  contatos: Contact,
  produtos: Package,
  equipe: UserCog,
} as const;

export function Rail({
  active = "dashboard",
  dark = false,
}: {
  active?: string;
  dark?: boolean;
}) {
  return (
    <aside className={`rail${dark ? " rail--dark" : ""}`}>
      <div className="rail__brand" aria-label="Nuvora">
        <span className="rail__mark">n</span>
      </div>
      <nav className="rail__nav" aria-label="Navegação principal">
        {navItems.map((item) => {
          const Icon = icons[item.key as keyof typeof icons];
          return (
            <button
              key={item.key}
              type="button"
              className="rail__item"
              aria-current={active === item.key ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
            >
              <Icon size={18} />
              <span className="rail__tooltip">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="rail__bottom">
        <button
          type="button"
          className="rail__item"
          aria-label="Paleta de comandos"
          title="Paleta de comandos"
        >
          <Command size={18} />
        </button>
        <button
          type="button"
          className="rail__item"
          aria-label="Configurações"
          title="Configurações"
        >
          <Settings size={18} />
        </button>
        <div className="rail__avatar" title="Marina Costa">
          MC
        </div>
      </div>
    </aside>
  );
}
