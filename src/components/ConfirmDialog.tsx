"use client";

import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'success';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (type === 'danger') return <AlertTriangle className="text-brand-danger mb-4 mx-auto" size={48} />;
    if (type === 'success') return <CheckCircle className="text-brand-success mb-4 mx-auto" size={48} />;
    return <CheckCircle className="text-brand-primary mb-4 mx-auto" size={48} />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 flex flex-col items-center text-center">
        {getIcon()}
        <h3 className="font-headline text-xl text-brand-text mb-2">{title}</h3>
        <p className="text-brand-text-muted text-sm mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-xl font-semibold text-sm hover:bg-brand-surface-hover transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm ${
              type === 'danger'
                ? 'bg-brand-danger hover:bg-red-600'
                : 'bg-brand-primary hover:bg-brand-primary-hover'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
