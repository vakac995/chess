import React, { useEffect, useRef } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Dialog = ({ isOpen, onClose, title, children }: Readonly<DialogProps>) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (isOpen && !dialogNode?.open) {
      dialogNode?.showModal();
    }
    if (!isOpen && dialogNode?.open) {
      dialogNode?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    dialogNode?.addEventListener('cancel', handleCancel);
    return () => {
      dialogNode?.removeEventListener('cancel', handleCancel);
    };
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className="p-6 bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div>{children}</div>
      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-150"
        >
          Close
        </button>
      </div>
    </dialog>
  );
};

export { Dialog };
