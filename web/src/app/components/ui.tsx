import { AlertTriangle, Loader2, X, type LucideIcon } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`btn btn--${variant} btn--${size} ${className}`.trim()}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="spin" size={14} />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {children}
    </button>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: LucideIcon;
  size?: "sm" | "md";
};

export function IconButton({
  label,
  icon: Icon,
  size = "md",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      className={`icon-btn icon-btn--${size} ${className}`.trim()}
      aria-label={label}
      title={label}
    >
      <Icon size={size === "sm" ? 14 : 16} />
    </button>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <input
        {...props}
        id={inputId}
        className={`field__input${error ? " is-error" : ""} ${className}`.trim()}
        aria-invalid={Boolean(error)}
      />
      {error ? (
        <span className="field__error">{error}</span>
      ) : hint ? (
        <span className="field__hint">{hint}</span>
      ) : null}
    </label>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
};

export function SelectField({
  label,
  error,
  hint,
  id,
  options,
  className = "",
  ...props
}: SelectFieldProps) {
  const selectId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="field" htmlFor={selectId}>
      <span className="field__label">{label}</span>
      <select
        {...props}
        id={selectId}
        className={`field__input field__select${error ? " is-error" : ""} ${className}`.trim()}
        aria-invalid={Boolean(error)}
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="field__error">{error}</span>
      ) : hint ? (
        <span className="field__hint">{hint}</span>
      ) : null}
    </label>
  );
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextareaField({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: TextareaFieldProps) {
  const textareaId =
    id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="field" htmlFor={textareaId}>
      <span className="field__label">{label}</span>
      <textarea
        {...props}
        id={textareaId}
        className={`field__input field__textarea${error ? " is-error" : ""} ${className}`.trim()}
        aria-invalid={Boolean(error)}
      />
      {error ? (
        <span className="field__error">{error}</span>
      ) : hint ? (
        <span className="field__hint">{hint}</span>
      ) : null}
    </label>
  );
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__head">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <IconButton label="Fechar" icon={X} size="sm" onClick={onClose} />
        </header>
        <div className="modal__body">{children}</div>
        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="drawer-overlay" onMouseDown={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__head">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <IconButton label="Fechar" icon={X} size="sm" onClick={onClose} />
        </header>
        <div className="drawer__body">{children}</div>
        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </aside>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="confirm-message">
        <AlertTriangle size={18} />
        <p>{message}</p>
      </div>
    </Modal>
  );
}

export function InlineNotice({
  tone = "danger",
  children,
}: {
  tone?: "danger" | "success";
  children: ReactNode;
}) {
  return (
    <div className={`inline-notice inline-notice--${tone}`}>{children}</div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "danger" | "info";
}) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Não foi possível carregar",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <strong>{title}</strong>
      <p>{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function Spinner({ label = "Carregando" }: { label?: string }) {
  return (
    <div className="spinner" role="status">
      <Loader2 className="spin" size={18} />
      <span>{label}</span>
    </div>
  );
}
