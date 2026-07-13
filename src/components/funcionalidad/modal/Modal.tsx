import React, { useEffect, useId, useRef } from 'react';
import styles from './Modal.module.css';

export interface ModalProps {
  /** Controls visibility */
  open: boolean;
  /** Called when the modal requests to close (backdrop click, ESC, close button) */
  onClose: () => void;
  /** Dialog title, shown in the header */
  title?: string;
  /** Optional description under the title */
  description?: string;
  /** Dialog width */
  size?: 'sm' | 'md' | 'lg';
  /** Main content */
  children?: React.ReactNode;
  /** Footer content — typically action buttons, right-aligned */
  footer?: React.ReactNode;
  /** Clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean;
  /** Pressing Escape closes the modal — native <dialog> behavior; set false to prevent it */
  closeOnEsc?: boolean;
  /** Hide the built-in close (×) button */
  hideCloseButton?: boolean;
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function ModalPreview({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  hideCloseButton = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reactId = useId();
  const titleId = `fx-modal-title-${reactId}`;
  const descId = `fx-modal-desc-${reactId}`;

  // Open/close the native <dialog> to match the `open` prop
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // "cancel" fires on ESC before close — block it if closeOnEsc is false,
  // otherwise let it close and notify the parent via onClose
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleCancel = (e: Event) => {
      if (!closeOnEsc) {
        e.preventDefault();
        return;
      }
      onClose();
    };
    // native close (any cause, incl. cancel) — keep parent state in sync
    const handleClose = () => onClose();
    el.addEventListener('cancel', handleCancel);
    el.addEventListener('close', handleClose);
    return () => {
      el.removeEventListener('cancel', handleCancel);
      el.removeEventListener('close', handleClose);
    };
  }, [closeOnEsc, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    // A click that lands on the <dialog> element itself (not its content box)
    // is a click on the ::backdrop — <dialog> has no padding here, so this
    // is reliable.
    if (closeOnBackdropClick && e.target === dialogRef.current) {
      onClose();
    }
  };

  const hasHeader = Boolean(title || description || !hideCloseButton);

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${styles[size]}`}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      onClick={handleBackdropClick}
    >
      {hasHeader && (
        <div className={styles.header}>
          <div>
            {title && (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className={styles.description}>
                {description}
              </p>
            )}
          </div>
          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className={styles.closeButton}
            >
              <CloseIcon />
            </button>
          )}
        </div>
      )}

      <div className={hasHeader ? styles.body : `${styles.body} ${styles.bodyNoHeader}`}>
        {children}
      </div>

      {footer && <div className={styles.footer}>{footer}</div>}
    </dialog>
  );
}

export default ModalPreview;
