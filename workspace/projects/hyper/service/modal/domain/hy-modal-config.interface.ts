import { TiModalRef } from '@cloud/tiny3';

export interface HyModalConfig {

  type: 'success' | 'warn' | 'error' | 'info';
  content: {
    title: string;
    body: string;
  };
  id?: string;
  modalClass?: string;
  beforeClose?: (modalRef: TiModalRef, reason: boolean) => void;
  close?: (modalRef: TiModalRef) => void;
  dismiss?: (modalRef: TiModalRef) => void;
}
