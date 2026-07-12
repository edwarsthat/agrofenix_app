import { useEffect, useRef, useState } from 'react';
import styles from './FenixToast.module.css';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  variant?: ToastVariant;
  title?: string;
  description?: string;
  onClose?: () => void;
  duration?: number;
  showProgress?: boolean;
  closable?: boolean;
}

const DEFAULT_TITLES: Record<ToastVariant, string> = {
  success: 'Listo',
  warning: 'Atención',
  error: 'Error',
  info: 'Información',
};

function Icon({ variant }: { variant: ToastVariant }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (variant) {
    case 'success':
      return (
        <svg {...common}>
          <path d="M4 12.5l5 5L20 7" />
        </svg>
      );
    case 'warning':
      return (
        <svg {...common}>
          <path d="M12 3.5l9.3 16.2a1 1 0 01-.87 1.5H3.57a1 1 0 01-.87-1.5L12 3.5z" />
          <path d="M12 10v4" />
          <circle cx={12} cy={17.3} r={0.15} fill="currentColor" stroke="none" />
        </svg>
      );
    case 'error':
      return (
        <svg {...common}>
          <circle cx={12} cy={12} r={9} />
          <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg {...common}>
          <circle cx={12} cy={12} r={9} />
          <path d="M12 11v5.2" />
          <circle cx={12} cy={7.6} r={0.15} fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

function CloseIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

/**
 * Toast — tarjeta de notificación (éxito / atención / error / info).
 * Pensada para apilarse en una pila flotante (ver ToastStack más abajo o
 * tu propio contenedor `position: fixed`). Se autodescarta tras `duration`
 * ms, con la cuenta pausada mientras el mouse está encima.
 */
export function FenixToast({
  variant = 'success',
  title,
  description,
  onClose,
  duration = 5000,
  showProgress = true,
  closable = true,
}: ToastProps) {
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(0);
  const startRef = useRef(0);
  const remainingRef = useRef(duration);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const requestClose = () => {
    setLeaving(true);
    setTimeout(() => onClose?.(), 220);
  };

  useEffect(() => {
    if (!duration || paused || leaving) return;
    startRef.current = Date.now();
    timerRef.current = setTimeout(requestClose, remainingRef.current);
    return () => {
      clearTimeout(timerRef.current);
      remainingRef.current -= Date.now() - startRef.current;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, leaving]);

  const stateClass = leaving ? styles.leaving : entered ? styles.entered : styles.entering;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`${styles.toast} ${styles[variant]} ${stateClass}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className={styles.iconChip}>
        <Icon variant={variant} />
      </span>

      <div className={styles.body}>
        <div className={styles.title}>{title || DEFAULT_TITLES[variant]}</div>
        {description && <div className={styles.description}>{description}</div>}
      </div>

      {closable && (
        <button type="button" className={styles.closeBtn} onClick={requestClose} aria-label="Cerrar notificación">
          <CloseIcon />
        </button>
      )}

      {showProgress && duration > 0 && (
        <span
          className={styles.progress}
          style={{
            animationDuration: `${duration}ms`,
            animationPlayState: paused || leaving ? 'paused' : 'running',
          }}
        />
      )}
    </div>
  );
}

export interface ToastItem {
  id: number | string;
  variant?: ToastVariant;
  title?: string;
  description?: string;
  duration?: number;
}

export interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: number | string) => void;
}

/** ToastStack — contenedor fijo abajo a la derecha. Renderiza tu lista de toasts activos. */
export function FenixToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className={styles.stack}>
      {toasts.map((t) => (
        <FenixToast
          key={t.id}
          variant={t.variant}
          title={t.title}
          description={t.description}
          duration={t.duration}
          onClose={() => onDismiss(t.id)}
        />
      ))}
    </div>
  );
}
