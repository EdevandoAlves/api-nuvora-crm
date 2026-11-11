import type {
  CustomerStatus,
  DealStage,
  InteractionType,
  TaskPriority,
  TaskType,
  UserRole,
} from "./types";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function formatBRL(value: number): string {
  return brl.format(value);
}

export function formatCompactBRL(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} mi`;
  }
  if (value >= 1_000) {
    return `R$ ${Math.round(value / 1_000)} mil`;
  }
  return brl.format(value);
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })}%`;
}

export function formatDateLong(value: Date): string {
  const text = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(value);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDayLabel(value: string): string {
  const date = parseDateOnly(value);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (sameDay(date, today)) return "Hoje";
  if (sameDay(date, tomorrow)) return "Amanhã";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function formatWeekLabel(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(parseDateOnly(value));
}

function parseDateOnly(value: string): Date {
  return value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function stageLabel(stage: DealStage): string {
  const labels: Record<DealStage, string> = {
    QUALIFICATION: "Qualificação",
    PROPOSAL: "Proposta",
    NEGOTIATION: "Negociação",
    CLOSED_WON: "Ganho",
    CLOSED_LOST: "Perdido",
  };
  return labels[stage];
}

export function priorityLabel(priority: TaskPriority): string {
  return priority === "HIGH"
    ? "Alta"
    : priority === "MEDIUM"
      ? "Média"
      : "Baixa";
}

export function taskTypeLabel(type: TaskType): string {
  const labels: Record<TaskType, string> = {
    CALL: "Ligação",
    EMAIL: "E-mail",
    FOLLOW_UP: "Follow-up",
    DEMO: "Demo",
    PROPOSAL: "Proposta",
    MEETING: "Reunião",
  };
  return labels[type];
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseDateOnly(value));
}

export function formatCnpj(value: string | null): string {
  if (!value || value.length !== 14) return value ?? "—";
  return value.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

export function customerStatusLabel(status: CustomerStatus): string {
  const labels: Record<CustomerStatus, string> = {
    LEAD: "Lead",
    PROSPECT: "Prospect",
    CUSTOMER: "Cliente",
    CHURNED: "Churn",
  };
  return labels[status];
}

export function customerStatusTone(
  status: CustomerStatus,
): "neutral" | "info" | "success" | "danger" {
  return status === "CUSTOMER"
    ? "success"
    : status === "CHURNED"
      ? "danger"
      : status === "PROSPECT"
        ? "info"
        : "neutral";
}

export function interactionTypeLabel(type: InteractionType): string {
  const labels: Record<InteractionType, string> = {
    EMAIL: "E-mail",
    CALL: "Ligação",
    MEETING: "Reunião",
    NOTE: "Nota",
    TASK: "Tarefa",
    WHATSAPP: "WhatsApp",
  };
  return labels[type];
}

export function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    OWNER: "Owner",
    ADMIN: "Admin",
    MANAGER: "Manager",
    SALES: "Sales",
    SUPPORT: "Support",
  };
  return labels[role];
}

export function isManagementRole(role: UserRole): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "MANAGER";
}

export function isOpenStage(stage: DealStage): boolean {
  return (
    stage === "QUALIFICATION" || stage === "PROPOSAL" || stage === "NEGOTIATION"
  );
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
