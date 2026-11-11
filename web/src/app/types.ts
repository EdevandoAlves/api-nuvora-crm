export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "SALES" | "SUPPORT";

export type Me = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    cnpj: string;
    plan: string;
    isActive: boolean;
  };
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DealStage =
  "QUALIFICATION" | "PROPOSAL" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST";

export type DashboardSummary = {
  customers: {
    total: number;
    byStatus: Record<string, number>;
  };
  deals: {
    total: number;
    byStage: Record<string, number>;
    valueByStage: Record<string, number>;
    pipelineValue: number;
    wonValue: number;
    lostValue: number;
  };
  tasks: {
    pending: number;
    completed: number;
    cancelled: number;
    overdue: number;
  };
  interactions: {
    total: number;
    last30Days: number;
  };
};

export type DashboardActivity = {
  id: string;
  type: "EMAIL" | "CALL" | "MEETING" | "NOTE" | "TASK" | "WHATSAPP";
  subject: string | null;
  description: string;
  createdAt: string;
  customer: { id: string; companyName: string };
  user: { id: string; firstName: string; lastName: string } | null;
};

export type DashboardTrendPoint = {
  weekStart: string;
  won: number;
  lost: number;
};

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "COMPLETED" | "CANCELLED";
export type TaskType =
  "CALL" | "EMAIL" | "FOLLOW_UP" | "DEMO" | "PROPOSAL" | "MEETING";

export type Task = {
  id: string;
  organizationId: string;
  userId: string;
  customerId: string;
  customerName: string | null;
  dealId: string | null;
  title: string;
  description: string | null;
  type: TaskType;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Deal = {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string | null;
  ownerId: string;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string | null;
  lostReason: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CustomerStatus = "LEAD" | "PROSPECT" | "CUSTOMER" | "CHURNED";

export type Customer = {
  id: string;
  organizationId: string;
  ownerId: string;
  companyName: string;
  cnpj: string | null;
  industry: string | null;
  website: string | null;
  employeeCount: number | null;
  annualRevenue: number | null;
  address: Record<string, string> | null;
  status: CustomerStatus;
  source: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  isPrimary: boolean;
  linkedin: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InteractionType =
  "EMAIL" | "CALL" | "MEETING" | "NOTE" | "TASK" | "WHATSAPP";

export type Interaction = {
  id: string;
  organizationId: string;
  customerId: string;
  contactId: string | null;
  userId: string;
  type: InteractionType;
  subject: string | null;
  description: string;
  duration: number | null;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DealProduct = {
  id: string;
  dealId: string;
  productId: string;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
};

export type TeamUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};
