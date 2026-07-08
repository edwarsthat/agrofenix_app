import React, { ButtonHTMLAttributes } from 'react';
import styles from './FenixButton.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Visual style */
  variant?: ButtonVariant;
  /** Stretch to fill container width — typical for login/forms */
  fullWidth?: boolean;
  /** Shows spinner + disables interaction */
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const FenixButton: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  className,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const classNames = [
    styles.btn,
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.isLoading : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} disabled={isDisabled} className={classNames} {...rest}>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
};

export default FenixButton;
