import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { api, ApiError, authErrorMessage } from "../api";
import { Button, TextField } from "../components/ui";
import { AuthLayout } from "./AuthPages";
import "./auth.css";

function readResetToken(): string {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return search.get("token") ?? hash.get("token") ?? "";
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-head">
        <span className="auth-head__kicker">Recuperação</span>
        <h2>Recuperar senha</h2>
        <p>Enviaremos um link de redefinição para o e-mail cadastrado.</p>
      </div>

      {sent ? (
        <div className="auth-success">
          <p>
            Se existir uma conta para esse e-mail, o link de redefinição será
            enviado em instantes.
          </p>
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={13} /> Voltar para o login
          </Link>
        </div>
      ) : (
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
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={loading ? undefined : ArrowRight}
          >
            Enviar link
          </Button>
        </form>
      )}

      {!sent ? (
        <p className="auth-switch">
          Lembrou a senha? <Link to="/login">Entrar</Link>
        </p>
      ) : null}
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const token = readResetToken();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("Link inválido. Solicite uma nova recuperação.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível redefinir a senha.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-head">
        <span className="auth-head__kicker">Nova senha</span>
        <h2>Redefinir senha</h2>
        <p>Escolha uma senha nova para acessar a Nuvora.</p>
      </div>

      {done ? (
        <div className="auth-success">
          <p>Senha redefinida. Você já pode entrar com a nova senha.</p>
          <Button
            variant="primary"
            icon={ArrowRight}
            onClick={() => navigate("/login", { replace: true })}
          >
            Ir para o login
          </Button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          {error ? <div className="form-error">{error}</div> : null}
          <TextField
            label="Nova senha"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint="Pelo menos 8 caracteres."
            required
          />
          <TextField
            label="Confirmar senha"
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
          />
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={loading ? undefined : ArrowRight}
          >
            Salvar nova senha
          </Button>
        </form>
      )}

      {!done ? (
        <p className="auth-switch">
          <Link to="/login">Voltar para o login</Link>
        </p>
      ) : null}
    </AuthLayout>
  );
}
