import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`rounded-xl border w-full ${maxWidth} p-6 shadow-2xl`}
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            style={{ color: 'var(--secondary-color)' }}
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger"
}) => {
  if (!isOpen) return null;

  const buttonColor = type === "danger" ? "bg-red-600 hover:bg-red-700" :
                      type === "warning" ? "bg-yellow-600 hover:bg-yellow-700" :
                      type === "success" ? "bg-green-600 hover:bg-green-700" :
                      "bg-blue-600 hover:bg-blue-700";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="mb-6" style={{ color: 'var(--text-color)' }}>
        {message}
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg"
          style={{ color: 'var(--secondary-color)' }}
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 rounded-lg text-white ${buttonColor}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
