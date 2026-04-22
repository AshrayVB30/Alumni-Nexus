import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'indigo' | 'success' | 'warning' | 'danger' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    outline: 'bg-transparent text-zinc-600 border-zinc-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-tight',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface SkillTagProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export function SkillTag({ label, onRemove, className }: SkillTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-zinc-700 text-[11px] font-semibold rounded-md',
        className
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-zinc-400 hover:text-zinc-900 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}
