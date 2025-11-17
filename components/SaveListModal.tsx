import React, { useState, useEffect } from 'react';
import type { AircraftData } from '../types';

interface SaveListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: {
    listName: string;
    maintenanceEvent: string;
    aircraftId: string | 'new';
    newAircraftName?: string;
  }) => void;
  aircrafts: AircraftData[];
}

const SaveListModal: React.FC<SaveListModalProps> = ({ isOpen, onClose, onSave, aircrafts }) => {
  const [listName, setListName] = useState('');
  const [maintenanceEvent, setMaintenanceEvent] = useState('');
  const [saveTarget, setSaveTarget] = useState<'existing' | 'new'>('existing');
  const [selectedAircraftId, setSelectedAircraftId] = useState<string>('');
  const [newAircraftName, setNewAircraftName] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form on open
      setListName('');
      setMaintenanceEvent('');
      setNewAircraftName('');
      // Default to the first project if available, or switch to 'new' if not
      if (aircrafts.length > 0) {
        setSaveTarget('existing');
        setSelectedAircraftId(aircrafts[0].id);
      } else {
        setSaveTarget('new');
        setSelectedAircraftId('');
      }
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen, aircrafts]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const aircraftId = saveTarget === 'existing' ? selectedAircraftId : 'new';
    onSave({ listName, maintenanceEvent, aircraftId, newAircraftName });
    handleClose();
  };
  
  const isSaveDisabled = !listName.trim() || !maintenanceEvent.trim() || (saveTarget === 'new' && !newAircraftName.trim()) || (saveTarget === 'existing' && !selectedAircraftId);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
      <div className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-lg transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Save Tooling List</h2>
          </header>
          <div className="p-5 space-y-4">
            <div>
              <label htmlFor="listName" className="block text-sm font-medium text-gray-300 mb-1">List Name</label>
              <input type="text" id="listName" value={listName} onChange={e => setListName(e.target.value)} required placeholder="e.g., Annual Inspection Tools" className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
              <label htmlFor="maintenanceEvent" className="block text-sm font-medium text-gray-300 mb-1">Maintenance Event</label>
              <input type="text" id="maintenanceEvent" value={maintenanceEvent} onChange={e => setMaintenanceEvent(e.target.value)} required placeholder="e.g., Phase 1 Inspection, Engine Change" className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-gray-300 mb-1">Aircraft</legend>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input id="existing-aircraft" name="aircraft-type" type="radio" value="existing" checked={saveTarget === 'existing'} onChange={() => setSaveTarget('existing')} disabled={aircrafts.length === 0} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500 disabled:opacity-50" />
                  <label htmlFor="existing-aircraft" className="ml-2 block text-sm text-gray-300">Save to Existing Aircraft</label>
                </div>
                <div className="flex items-center">
                  <input id="new-aircraft" name="aircraft-type" type="radio" value="new" checked={saveTarget === 'new'} onChange={() => setSaveTarget('new')} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                  <label htmlFor="new-aircraft" className="ml-2 block text-sm text-gray-300">Create New Aircraft</label>
                </div>
              </div>
            </fieldset>
            {saveTarget === 'existing' && (
              <div>
                <label htmlFor="aircraftId" className="sr-only">Select Aircraft</label>
                <select id="aircraftId" value={selectedAircraftId} onChange={e => setSelectedAircraftId(e.target.value)} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500">
                  {aircrafts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            {saveTarget === 'new' && (
              <div>
                <label htmlFor="newAircraftName" className="sr-only">New Aircraft Name</label>
                <input type="text" id="newAircraftName" value={newAircraftName} onChange={e => setNewAircraftName(e.target.value)} placeholder="e.g., Cessna 525 (N123AB)" className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
              </div>
            )}
          </div>
          <footer className="flex justify-end gap-3 p-5 border-t border-gray-700 bg-gray-800/50">
            <button type="button" onClick={handleClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaveDisabled} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">Save List</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default SaveListModal;
