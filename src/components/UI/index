import { useApp } from "../../context/AppContext";
import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// ── Toast System ─────────────────────────────────────────────────────────────

const toastStyles: Record<string, string> = {
  success: "bg-[#2D7A4F] text-white",
  error: "bg-[#C0392B] text-white",
  warning: "bg-[#B45309] text-white",
  info: "bg-[#1E40AF] text-white",
};

const toastIcons: Record<string, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export function ToastContainer() {
  const { toasts, removeToast } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-md shadow-lg pointer-events-auto min-w-[280px] max-w-[380px] ${toastStyles[t.type]}`}
        >
          <span className="text-sm font-bold shrink-0">{toastIcons[t.type]}</span>
          <span className="text-sm flex-1">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="opacity-70 hover:opacity-100 text-base leading-none shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-md border border-[#E7E0D8] p-4">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const modalSizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(28,25,23,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`modal-content bg-white rounded-lg shadow-xl w-full ${modalSizes[size]} flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E0D8] shrink-0">
          <h3 className="font-semibold text-[#1C1917] text-sm">{title}</h3>
          <button onClick={onClose} className="text-[#78716C] hover:text-[#1C1917] text-xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function Confirm({ open, onClose, onConfirm, title = "Confirm", message, confirmLabel = "Confirm", danger = false }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-[#44403C] mb-5">{message}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-md border border-[#E7E0D8] text-sm text-[#44403C] hover:bg-[#F0EBE3] transition-colors">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 rounded-md text-sm text-white transition-colors ${danger ? "bg-[#C0392B] hover:bg-[#A93226]" : "bg-[#1C1917] hover:bg-[#292524]"}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ── Form Fields ───────────────────────────────────────────────────────────────

const baseInput =
  "w-full px-3 py-2 text-sm rounded-md border border-[#E7E0D8] bg-white text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#B8952A] focus:border-[#B8952A] transition-colors";

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function Field({ label, required, error, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#44403C] mb-1">
        {label} {required && <span className="text-[#C0392B]">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[#C0392B]">{error}</p>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const { error, className = "", ...rest } = props;
  return (
    <input
      className={`${baseInput} ${error ? "border-[#C0392B] focus:ring-[#C0392B]" : ""} ${className}`}
      {...rest}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean; children: ReactNode }) {
  const { error, className = "", children, ...rest } = props;
  return (
    <select
      className={`${baseInput} ${error ? "border-[#C0392B] focus:ring-[#C0392B]" : ""} ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  const { error, className = "", ...rest } = props;
  return (
    <textarea
      rows={3}
      className={`${baseInput} resize-none ${error ? "border-[#C0392B] focus:ring-[#C0392B]" : ""} ${className}`}
      {...rest}
    />
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────────

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "ghost" | "gold";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

const btnVariants = {
  primary: "bg-[#1C1917] text-white hover:bg-[#292524]",
  secondary: "bg-[#F0EBE3] text-[#1C1917] hover:bg-[#E7E0D8] border border-[#E7E0D8]",
  danger: "bg-[#C0392B] text-white hover:bg-[#A93226]",
  ghost: "bg-transparent text-[#44403C] hover:bg-[#F0EBE3]",
  gold: "bg-[#B8952A] text-white hover:bg-[#A07E22]",
};

const btnSizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export function Btn({ children, onClick, type = "button", variant = "primary", size = "md", disabled, className = "", loading }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
    >
      {loading && <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "error" | "warning" | "info" | "neutral";
}

const badgeVariants = {
  success: "bg-[#D1FAE5] text-[#2D7A4F]",
  error: "bg-[#FEE2E2] text-[#C0392B]",
  warning: "bg-[#FEF3C7] text-[#B45309]",
  info: "bg-[#DBEAFE] text-[#1E40AF]",
  neutral: "bg-[#F0EBE3] text-[#78716C]",
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeVariants[variant]}`}>
      {children}
    </span>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyField?: keyof T;
}

export function Table<T extends Record<string, unknown>>({ columns, data, loading, emptyMessage = "No records found.", keyField = "id" as keyof T }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E7E0D8]">
            {columns.map((col) => (
              <th key={col.key} className={`text-left py-2.5 px-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide ${col.className || ""}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[#F0EBE3]">
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-3"><Skeleton className="h-4 w-full" /></td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center text-sm text-[#78716C]">{emptyMessage}</td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={String(row[keyField])} className="border-b border-[#F0EBE3] hover:bg-[#FAF8F5] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 px-3 ${col.className || ""}`}>
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-[#1C1917]">{title}</h1>
        {subtitle && <p className="text-sm text-[#78716C] mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-md border border-[#E7E0D8] ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E7E0D8]">
      <h3 className="text-sm font-semibold text-[#1C1917]">{title}</h3>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  accent?: boolean;
  loading?: boolean;
  subValue?: string;
}

export function KPICard({ label, value, unit, icon, accent, loading, subValue }: KPICardProps) {
  if (loading) return <SkeletonCard />;
  return (
    <div className={`bg-white rounded-md border p-4 transition-shadow hover:shadow-sm ${accent ? "border-[#B8952A] bg-[#FDFAF4]" : "border-[#E7E0D8]"}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-[#78716C] uppercase tracking-wide">{label}</p>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <p className={`font-mono-data font-semibold text-lg leading-tight ${accent ? "text-[#B8952A]" : "text-[#1C1917]"}`}>
        {typeof value === "number" ? value.toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : value}
        {unit && <span className="text-xs text-[#78716C] font-sans ml-1">{unit}</span>}
      </p>
      {subValue && <p className="text-xs text-[#78716C] mt-1">{subValue}</p>}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

export function EmptyState({ icon, message, action }: { icon?: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <span className="text-4xl mb-3">{icon}</span>}
      <p className="text-sm text-[#78716C] mb-4">{message}</p>
      {action}
    </div>
  );
}

// ── Search Input ──────────────────────────────────────────────────────────────

export function SearchInput({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E] text-sm">⌕</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-3 py-2 text-sm rounded-md border border-[#E7E0D8] bg-white text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#B8952A] focus:border-[#B8952A] w-full transition-colors"
      />
    </div>
  );
}

// ── Stat Value (mono) ─────────────────────────────────────────────────────────

export function StatValue({ value, unit, className = "" }: { value: number; unit?: string; className?: string }) {
  return (
    <span className={`font-mono-data ${className}`}>
      {value.toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
      {unit && <span className="text-xs text-[#78716C] ml-1 font-sans">{unit}</span>}
    </span>
  );
}
