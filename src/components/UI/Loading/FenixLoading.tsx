import React from 'react';
import styles from './FenixLoading.module.css';

export type LoadingVariant = 'view' | 'overlay';

export interface LoadingProps {
  /**
   * 'view' — fills the whole content area, used when a view/route has no
   * data yet (first load, navigation between menu items).
   * 'overlay' — translucent layer over existing (stale) content, used when
   * refetching data for a view that's already showing something.
   */
  variant?: LoadingVariant;
  /** Text under the spinner. Pass '' to hide it. */
  label?: string;
  className?: string;
}

export const FenixLoading: React.FC<LoadingProps> = ({
  variant = 'view',
  label = 'Cargando…',
  className,
}) => {
  const isOverlay = variant === 'overlay';

  return (
    <div
      role="status"
      aria-live="polite"
      className={[isOverlay ? styles.overlay : styles.view, className || ''].filter(Boolean).join(' ')}
    >
      <span className={isOverlay ? styles.ringSmall : styles.ring} />
      {label && (
        <div className={isOverlay ? styles.labelSmall : styles.label}>{label}</div>
      )}
    </div>
  );
};

export default FenixLoading;
