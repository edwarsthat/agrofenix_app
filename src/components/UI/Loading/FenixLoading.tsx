import React from 'react';
import styles from './FenixLoading.module.css';

export type LoadingVariant = 'view' | 'overlay' | 'app';

export interface LoadingProps {
  /**
   * 'view' — fills the whole content area, used when a view/route has no
   * data yet (first load, navigation between menu items).
   * 'overlay' — translucent layer over existing (stale) content, used when
   * refetching data for a view that's already showing something.
   * 'app' — same as 'overlay' but fixed to the viewport; this is the one the
   * global loading store renders.
   */
  variant?: LoadingVariant;
  label?: string;
  className?: string;
}

const VARIANT_CLASS: Record<LoadingVariant, string> = {
  view: styles.view,
  overlay: styles.overlay,
  app: styles.app,
};

export const FenixLoading: React.FC<LoadingProps> = ({
  variant = 'view',
  label = 'Cargando…',
  className,
}) => {
  const isCompact = variant !== 'view';

  return (
    <div
      role="status"
      aria-live="polite"
      className={[VARIANT_CLASS[variant], className || ''].filter(Boolean).join(' ')}
    >
      <span className={isCompact ? styles.ringSmall : styles.ring} />
      {label && (
        <div className={isCompact ? styles.labelSmall : styles.label}>{label}</div>
      )}
    </div>
  );
};

export default FenixLoading;
