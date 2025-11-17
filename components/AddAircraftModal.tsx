import React, { useState, useEffect } from 'react';

interface AddAircraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

const AddAircraftModal: React.FC<AddAircraftModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-aircraft-title"
    >
      <div 
        className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <header className="p-5 border-b border-gray-700">
            <h2 id="add-aircraft-title" className="text-xl font-bold text-white">Add New Aircraft</h2>
          </header>
          <div className="p-5 space-y-4">
            <div>
              <label htmlFor="aircraft-name" className="block text-sm font-medium text-gray-300 mb-1">Aircraft Name / Tail Number</label>
              <input 
                autoFocus
                type="text" 
                id="aircraft-name"
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="e.g., Cessna 700 (N700CL)" 
                className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" 
              />
            </div>
          </div>
          <footer className="flex justify-end gap-3 p-5 border-t border-gray-700 bg-gray-800/50">
            <button type="button" onClick={handleClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={!name.trim()} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">Add Aircraft</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddAircraftModal;
