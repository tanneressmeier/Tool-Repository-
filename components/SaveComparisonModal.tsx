import React, { useState, useEffect } from 'react';
import type { AircraftData } from '../types';

interface SaveComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: { name: string; aircraftId: string; maintenanceEvent: string }) => void;
  aircrafts: AircraftData[];
  defaultMaintenanceEvent?: string;
}

const SaveComparisonModal: React.FC<SaveComparisonModalProps> = ({ isOpen, onClose, onSave, aircrafts, defaultMaintenanceEvent }) => {
  const [name, setName] = useState('');
  const [aircraftId, setAircraftId] = useState<string>('');
  const [maintenanceEvent, setMaintenanceEvent] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (aircrafts.length > 0) {
        setAircraftId(aircrafts[0].id);
      } else {
        setAircraftId('');
      }
      setName('');
      setMaintenanceEvent(defaultMaintenanceEvent || '');
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen, aircrafts, defaultMaintenanceEvent]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && aircraftId && maintenanceEvent.trim()) {
        onSave({ name, aircraftId, maintenanceEvent });
    }
    handleClose();
  };
  
  const isSaveDisabled = !name.trim() || !aircraftId || !maintenanceEvent.trim();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="save-comparison-title">
      <div className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-lg transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="p-5 border-b border-gray-700">
            <h2 id="save-comparison-title" className="text-xl font-bold text-white">Save Comparison Report</h2>
          </header>
          <div className="p-5 space-y-4">
            <div>
              <label htmlFor="comparisonName" className="block text-sm font-medium text-gray-300 mb-1">Report Name</label>
              <input type="text" id="comparisonName" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Pre-Phase 1 Check" className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
            </div>

             <div>
              <label htmlFor="comparisonMaintenanceEvent" className="block text-sm font-medium text-gray-300 mb-1">Maintenance Event</label>
              <input type="text" id="comparisonMaintenanceEvent" value={maintenanceEvent} onChange={e => setMaintenanceEvent(e.target.value)} required placeholder="e.g., Phase 1 Inspection, Engine Change" className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            
            <div>
              <label htmlFor="aircraftId" className="block text-sm font-medium text-gray-300 mb-1">Aircraft</label>
               {aircrafts.length > 0 ? (
                    <select id="aircraftId" value={aircraftId} onChange={e => setAircraftId(e.target.value)} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500">
                        {aircrafts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
               ) : (
                   <div className="text-sm text-gray-500 p-3 bg-gray-900/50 rounded-md border border-gray-700">
                        You must create an aircraft profile before you can save a comparison. You can create one in the Data Hub or when saving a "Needed Tools" list.
                   </div>
               )}
            </div>
          </div>
          <footer className="flex justify-end gap-3 p-5 border-t border-gray-700 bg-gray-800/50">
            <button type="button" onClick={handleClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaveDisabled} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">Save Report</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default SaveComparisonModal;
