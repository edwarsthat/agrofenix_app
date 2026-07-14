import React, { useEffect, useId, useRef } from 'react';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  hideCloseButton?: boolean;
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function Modal({
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

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

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
    const handleClose = () => onClose();
    el.addEventListener('cancel', handleCancel);
    el.addEventListener('close', handleClose);
    return () => {
      el.removeEventListener('cancel', handleCancel);
      el.removeEventListener('close', handleClose);
    };
  }, [closeOnEsc, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
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

export default Modal;
