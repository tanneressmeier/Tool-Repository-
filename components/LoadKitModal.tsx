import React, { useState, useEffect } from 'react';
import type { Kit } from '../types';

interface LoadKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  kits: Kit[];
  onLoadKit: (kit: Kit) => void;
}

const LoadKitModal: React.FC<LoadKitModalProps> = ({ isOpen, onClose, kits, onLoadKit }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen]);
  
  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 200);
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
        className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-5 border-b border-gray-700">
          <h2 id="modal-title" className="text-2xl font-bold text-white">Load Tool Kit</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-grow p-5 overflow-y-auto">
          {kits.length > 0 ? (
            <ul className="space-y-2">
              {kits.map((kit) => (
                <li key={kit.id} className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-200">{kit.name}</p>
                    <p className="text-sm text-gray-400">{kit.tools.length} tools</p>
                  </div>
                  <button 
                    onClick={() => onLoadKit(kit)}
                    className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 transition-colors"
                  >
                    Load
                  </button>
                </li>
              ))}
            </ul>
          ) : (
             <div className="text-center text-gray-500 p-8">
                <p className="font-semibold">No Kits Found</p>
                <p className="text-sm mt-2">Go to the "Kits" page from the main menu to create your first tool kit.</p>
            </div>
          )}
        </div>

        <footer className="flex justify-end items-center gap-3 p-5 border-t border-gray-700 bg-gray-800/50 rounded-b-2xl">
          <button onClick={handleClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LoadKitModal;
