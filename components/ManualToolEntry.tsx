import React, { useState, forwardRef, useRef, useImperativeHandle } from 'react';

interface ManualToolEntryProps {
  onAddTool: (tool: { name: string; manufacturer: string; model: string; }) => void;
}

export interface ManualToolEntryRef {
  focusInput: () => void;
  scrollIntoView: () => void;
}

const ManualToolEntry = forwardRef<ManualToolEntryRef, ManualToolEntryProps>(({ onAddTool }, ref) => {
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      nameInputRef.current?.focus();
    },
    scrollIntoView: () => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !model.trim()) {
      return;
    }
    onAddTool({
      name: name.trim(),
      manufacturer: manufacturer.trim() || 'N/A',
      model: model.trim(),
    });
    // Clear form and refocus for quick entry
    setName('');
    setManufacturer('');
    setModel('');
    nameInputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="bg-gray-800/50 p-5 rounded-xl shadow-md border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Add Needed Tool Manually</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tool-name" className="block text-sm font-medium text-gray-300 mb-1">
            Tool Name <span className="text-red-400">*</span>
          </label>
          <input
            ref={nameInputRef}
            id="tool-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            placeholder="e.g., Jack"
          />
        </div>
        <div>
          <label htmlFor="tool-model" className="block text-sm font-medium text-gray-300 mb-1">
            Model / Part Number <span className="text-red-400">*</span>
          </label>
          <input
            id="tool-model"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
            className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            placeholder="e.g., 02-0526-0110"
          />
        </div>
        <div>
          <label htmlFor="tool-manufacturer" className="block text-sm font-medium text-gray-300 mb-1">
            Manufacturer (Optional)
          </label>
          <input
            id="tool-manufacturer"
            type="text"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            placeholder="e.g., Tronair"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!name.trim() || !model.trim()}
            className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            Add Tool
          </button>
        </div>
      </form>
    </div>
  );
});

export default ManualToolEntry;