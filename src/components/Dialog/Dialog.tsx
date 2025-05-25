import { useEffect, useRef } from 'react';
import type { DialogProps } from './Dialog.types';

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
    <dialog
      ref={dialogRef}
      className="rounded-card bg-background mx-auto w-full max-w-md p-6 shadow-xl"
    >
      {title && <h2 className="text-text mb-4 text-xl font-semibold">{title}</h2>}
      <div className="text-text">{children}</div>
      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="rounded-button bg-secondary hover:bg-secondary/80 px-4 py-2 text-white transition duration-150"
        >
          Close
        </button>
      </div>
    </dialog>
  );
};

export { Dialog };
