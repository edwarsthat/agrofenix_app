import { ReactNode } from "react";
import { create } from "zustand";

let seq = 0;

interface ModalOptions {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
  footer?: ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  hideCloseButton?: boolean;
}

interface ModalState extends ModalOptions {
  open: boolean;
  token: number;
  show: (options: ModalOptions) => number;
  close: () => void;
}

const defaults: ModalOptions = {
  title: undefined,
  description: undefined,
  size: 'md',
  children: undefined,
  footer: undefined,
  closeOnBackdropClick: true,
  closeOnEsc: true,
  hideCloseButton: false,
};


export const useModalStore = create<ModalState>((set) => ({
  open: false,
  token: 0,
  ...defaults,
  show: (options) => {
    const token = ++seq
    set({ open: true, token, ...defaults, ...options })
    return token
  },
  close: () => set({ open: false, token: 0, ...defaults }),
}));

export const modal = {
    show: (options: ModalOptions) => useModalStore.getState().show(options),
    close: () => useModalStore.getState().close()
}