import { useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { authErrorMessage } from "../api";
import { useAuth } from "../auth";
import { Button, TextField } from "../components/ui";
import "./auth.css";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-brand">
        <div className="auth-brand__top">
          <span className="auth-brand__mark">n</span>
          <span>Nuvora</span>
        </div>
        <div className="auth-brand__copy">
          <span className="auth-brand__kicker">CRM operacional</span>
          <h1>
            Menos planilha.
            <br />
            Mais decisão.
          </h1>
          <p>
            Clientes, contatos, tarefas e pipeline no mesmo lugar — com a
            densidade de quem trabalha com vendas todos os dias.
          </p>
        </div>
        <div className="auth-brand__footer">
          <span>Precision UI</span>
          <span>pt-BR · BRL</span>
        </div>
      </aside>
      <main className="auth-panel">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-head">
        <span className="auth-head__kicker">Bem-vindo de volta</span>
        <h2>Entrar na Nuvora</h2>
        <p>Acesse a operação da sua organização.</p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {error ? <div className="form-error">{error}</div> : null}
        <TextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextField
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <div className="auth-form__aside">
          <Link to="/forgot-password">Esqueci minha senha</Link>
        </div>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={loading ? undefined : ArrowRight}
        >
          Entrar
        </Button>
      </form>

      <p className="auth-switch">
        Ainda não tem conta? <Link to="/register">Criar organização</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { status, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    cnpj: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-head">
        <span className="auth-head__kicker">Primeiro acesso</span>
        <h2>Criar organização</h2>
        <p>Você será o OWNER da conta e poderá convidar a equipe depois.</p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="auth-form__row">
          <TextField
            label="Nome"
            name="firstName"
            value={form.firstName}
            onChange={(event) => update("firstName")(event.target.value)}
            autoComplete="given-name"
            required
          />
          <TextField
            label="Sobrenome"
            name="lastName"
            value={form.lastName}
            onChange={(event) => update("lastName")(event.target.value)}
            autoComplete="family-name"
            required
          />
        </div>
        <TextField
          label="Empresa"
          name="companyName"
          value={form.companyName}
          onChange={(event) => update("companyName")(event.target.value)}
          autoComplete="organization"
          required
        />
        <TextField
          label="CNPJ"
          name="cnpj"
          value={form.cnpj}
          onChange={(event) =>
            update("cnpj")(event.target.value.replace(/\D/g, "").slice(0, 14))
          }
          inputMode="numeric"
          hint="Somente os 14 dígitos."
          required
        />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          value={form.email}
          onChange={(event) => update("email")(event.target.value)}
          autoComplete="email"
          required
        />
        <TextField
          label="Senha"
          name="password"
          type="password"
          value={form.password}
          onChange={(event) => update("password")(event.target.value)}
          autoComplete="new-password"
          hint="Pelo menos 8 caracteres."
          minLength={8}
          required
        />
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={loading ? undefined : ArrowRight}
        >
          Criar organização
        </Button>
      </form>

      <p className="auth-switch">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  );
}
