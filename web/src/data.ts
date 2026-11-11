export type Tone = "accent" | "success" | "danger" | "info" | "slate";

export type Stage = {
  key: string;
  label: string;
  count: number;
  value: number;
  tone: Tone;
};

export type Task = {
  id: string;
  title: string;
  customer: string;
  time: string;
  priority: "high" | "medium" | "low";
  done?: boolean;
};

export type Activity = {
  id: string;
  time: string;
  kind: "deal" | "task" | "note" | "call";
  text: string;
  meta: string;
};

export type DealCard = {
  id: string;
  title: string;
  customer: string;
  value: number;
  owner: string;
  days: number;
  probability: number;
};

export const navItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "clientes", label: "Clientes" },
  { key: "deals", label: "Negócios" },
  { key: "tarefas", label: "Tarefas" },
  { key: "contatos", label: "Contatos" },
  { key: "produtos", label: "Produtos" },
  { key: "equipe", label: "Equipe" },
];

export const stages: Stage[] = [
  {
    key: "QUALIFICATION",
    label: "Qualificação",
    count: 24,
    value: 420_000,
    tone: "slate",
  },
  {
    key: "PROPOSAL",
    label: "Proposta",
    count: 18,
    value: 318_000,
    tone: "info",
  },
  {
    key: "NEGOTIATION",
    label: "Negociação",
    count: 11,
    value: 262_000,
    tone: "accent",
  },
  {
    key: "CLOSED_WON",
    label: "Ganho",
    count: 9,
    value: 342_000,
    tone: "success",
  },
  {
    key: "CLOSED_LOST",
    label: "Perdido",
    count: 7,
    value: 164_000,
    tone: "danger",
  },
];

export const kpis = {
  pipeline: 1_000_000,
  won: 342_000,
  lost: 164_000,
  tasks: 18,
  conversion: 27.4,
  customers: 128,
  interactions: 64,
};

export const tasks: Task[] = [
  {
    id: "task-1",
    title: "Ligar para Marina sobre expansão",
    customer: "Atlas Log",
    time: "09:30",
    priority: "high",
  },
  {
    id: "task-2",
    title: "Enviar proposta revisada",
    customer: "Norte Engenharia",
    time: "11:00",
    priority: "high",
  },
  {
    id: "task-3",
    title: "Follow-up do contrato",
    customer: "Cais Digital",
    time: "13:30",
    priority: "medium",
  },
  {
    id: "task-4",
    title: "Preparar demo do módulo fiscal",
    customer: "Aurora Foods",
    time: "15:00",
    priority: "medium",
  },
  {
    id: "task-5",
    title: "Revisar renovação anual",
    customer: "Vértice Saúde",
    time: "16:30",
    priority: "low",
  },
];

export const activity: Activity[] = [
  {
    id: "act-1",
    time: "09:12",
    kind: "deal",
    text: "Expansão Atlas movida para Negociação",
    meta: "R$ 84.000",
  },
  {
    id: "act-2",
    time: "08:54",
    kind: "call",
    text: "Ligação registrada com Cais Digital",
    meta: "12 min",
  },
  {
    id: "act-3",
    time: "08:31",
    kind: "note",
    text: "Nota adicionada em Aurora Foods",
    meta: "Marina Costa",
  },
  {
    id: "act-4",
    time: "Ontem",
    kind: "task",
    text: "Proposta de Norte Engenharia concluída",
    meta: "R$ 120.000",
  },
  {
    id: "act-5",
    time: "Ontem",
    kind: "deal",
    text: "Vértice Saúde marcada como Ganho",
    meta: "R$ 96.000",
  },
];

export const health = [
  { label: "Lead", value: 44, tone: "slate" as Tone },
  { label: "Prospect", value: 23, tone: "info" as Tone },
  { label: "Cliente", value: 54, tone: "success" as Tone },
  { label: "Churn", value: 7, tone: "danger" as Tone },
];

export const trend = [
  { label: "S1", won: 180, lost: 120 },
  { label: "S2", won: 220, lost: 90 },
  { label: "S3", won: 260, lost: 110 },
  { label: "S4", won: 240, lost: 80 },
  { label: "S5", won: 300, lost: 140 },
  { label: "S6", won: 280, lost: 100 },
  { label: "S7", won: 342, lost: 164 },
  { label: "S8", won: 360, lost: 120 },
];

export const riskDeals = [
  {
    id: "risk-1",
    title: "Renovação anual",
    customer: "Vértice Saúde",
    stage: "Negociação",
    value: 96_000,
    days: 14,
  },
  {
    id: "risk-2",
    title: "Expansão de licenças",
    customer: "Atlas Log",
    stage: "Proposta",
    value: 84_000,
    days: 11,
  },
  {
    id: "risk-3",
    title: "Implantação fiscal",
    customer: "Aurora Foods",
    stage: "Qualificação",
    value: 72_000,
    days: 9,
  },
  {
    id: "risk-4",
    title: "Migração de dados",
    customer: "Cais Digital",
    stage: "Negociação",
    value: 58_000,
    days: 7,
  },
];

export const dealsByStage: Record<string, DealCard[]> = {
  QUALIFICATION: [
    {
      id: "deal-1",
      title: "Implantação fiscal",
      customer: "Aurora Foods",
      value: 72_000,
      owner: "MC",
      days: 9,
      probability: 20,
    },
    {
      id: "deal-2",
      title: "Piloto comercial",
      customer: "Brisa Mobilidade",
      value: 48_000,
      owner: "RA",
      days: 5,
      probability: 15,
    },
    {
      id: "deal-2b",
      title: "Renovação de contrato",
      customer: "Cais Digital",
      value: 54_000,
      owner: "LS",
      days: 3,
      probability: 18,
    },
    {
      id: "deal-2c",
      title: "Diagnóstico comercial",
      customer: "Nova Rota",
      value: 36_000,
      owner: "MC",
      days: 1,
      probability: 10,
    },
  ],
  PROPOSAL: [
    {
      id: "deal-3",
      title: "Expansão de licenças",
      customer: "Atlas Log",
      value: 84_000,
      owner: "MC",
      days: 11,
      probability: 45,
    },
    {
      id: "deal-4",
      title: "Integração ERP",
      customer: "Norte Engenharia",
      value: 120_000,
      owner: "LS",
      days: 4,
      probability: 40,
    },
    {
      id: "deal-4b",
      title: "Módulo de relatórios",
      customer: "Vértice Saúde",
      value: 42_000,
      owner: "RA",
      days: 6,
      probability: 35,
    },
    {
      id: "deal-4c",
      title: "Treinamento da equipe",
      customer: "Aurora Foods",
      value: 28_000,
      owner: "MC",
      days: 8,
      probability: 30,
    },
  ],
  NEGOTIATION: [
    {
      id: "deal-5",
      title: "Renovação anual",
      customer: "Vértice Saúde",
      value: 96_000,
      owner: "RA",
      days: 14,
      probability: 70,
    },
    {
      id: "deal-6",
      title: "Migração de dados",
      customer: "Cais Digital",
      value: 58_000,
      owner: "LS",
      days: 7,
      probability: 65,
    },
    {
      id: "deal-6b",
      title: "Contrato anual",
      customer: "Norte Engenharia",
      value: 132_000,
      owner: "LS",
      days: 3,
      probability: 75,
    },
    {
      id: "deal-6c",
      title: "Expansão de seats",
      customer: "Brisa Mobilidade",
      value: 46_000,
      owner: "RA",
      days: 12,
      probability: 60,
    },
  ],
  CLOSED_WON: [
    {
      id: "deal-7",
      title: "Expansão Sul",
      customer: "Vértice Saúde",
      value: 96_000,
      owner: "MC",
      days: 1,
      probability: 100,
    },
    {
      id: "deal-7b",
      title: "Renovação Cais",
      customer: "Cais Digital",
      value: 48_000,
      owner: "LS",
      days: 1,
      probability: 100,
    },
  ],
  CLOSED_LOST: [
    {
      id: "deal-8",
      title: "Novo CRM",
      customer: "Horizonte",
      value: 64_000,
      owner: "RA",
      days: 2,
      probability: 0,
    },
    {
      id: "deal-8b",
      title: "Piloto logística",
      customer: "Nova Rota",
      value: 32_000,
      owner: "MC",
      days: 3,
      probability: 0,
    },
  ],
};

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
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
  return formatBRL(value);
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })}%`;
}
