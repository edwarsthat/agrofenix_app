import { ReactNode } from "react";
import { create } from "zustand";


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
  show: (options: ModalOptions) => void;
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
  ...defaults,
  show: (options) => set({ open: true, ...defaults, ...options }),
  close: () => set({ open: false }),
}));

export const modal = {
    show: (options: ModalOptions) => useModalStore.getState().show(options),
    close: () => useModalStore.getState().close()
}