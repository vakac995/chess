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
    <dialog ref={dialogRef} className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
      {title && <h2 className="mb-4 text-xl font-semibold">{title}</h2>}
      <div>{children}</div>
      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="rounded bg-gray-200 px-4 py-2 text-gray-800 transition duration-150 hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </dialog>
  );
};

export { Dialog };
