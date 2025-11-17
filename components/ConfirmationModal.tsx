import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };
  
  const handleConfirm = () => {
    setShow(false);
    setTimeout(() => onConfirm(), 200);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5">
          <h2 id="modal-title" className="text-xl font-bold text-white">{title}</h2>
        </header>

        <div className="px-5 pb-5">
          <div className="text-gray-300">{message}</div>
        </div>

        <footer className="flex justify-end items-center gap-3 p-5 border-t border-gray-700 bg-gray-800/50 rounded-b-2xl">
          <button 
            onClick={handleClose} 
            className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors"
          >
            Confirm Delete
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmationModal;