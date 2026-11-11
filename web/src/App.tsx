import { Loader2 } from "lucide-react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./app/auth";
import { AppShell } from "./app/components/AppShell";
import { DashboardPage } from "./app/pages/DashboardPage";
import { LoginPage, RegisterPage } from "./app/pages/AuthPages";
import { CustomerDetailPage } from "./app/pages/CustomerDetailPage";
import { CustomersPage } from "./app/pages/CustomersPage";
import { DealsPage } from "./app/pages/DealsPage";
import { PlaceholderPage } from "./app/pages/PlaceholderPage";
import { ProductsPage } from "./app/pages/ProductsPage";
import { TasksPage } from "./app/pages/TasksPage";
import { TeamPage } from "./app/pages/TeamPage";

function FullPageLoader() {
  return (
    <div className="app-loading" role="status">
      <span className="app-loading__mark">n</span>
      <Loader2 className="spin" size={18} />
      <span>Carregando Nuvora…</span>
    </div>
  );
}

function ProtectedRoute() {
  const { status } = useAuth();
  if (status === "loading") return <FullPageLoader />;
  if (status === "anonymous") return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === "loading") return <FullPageLoader />;
  if (status === "authenticated") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clientes" element={<CustomersPage />} />
              <Route path="/clientes/:id" element={<CustomerDetailPage />} />
              <Route path="/negocios" element={<DealsPage />} />
              <Route path="/tarefas" element={<TasksPage />} />
              <Route
                path="/contatos"
                element={
                  <PlaceholderPage
                    title="Contatos"
                    description="Pessoas por cliente e histórico de interações."
                  />
                }
              />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/equipe" element={<TeamPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
