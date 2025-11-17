import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Tool } from '../types';
import { queryInventory } from '../services/geminiService';
import { BrainIcon } from './icons/BrainIcon';

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
);

const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
);

const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
);

const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
);


// Modal Component defined within the same file to adhere to project structure
interface ToolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: Tool | (Omit<Tool, 'serialNumber'> & { serialNumber?: string })) => void;
  toolToEdit?: Tool | null;
}

const ToolFormModal: React.FC<ToolFormModalProps> = ({ isOpen, onClose, onSave, toolToEdit }) => {
  const [tool, setTool] = useState<Partial<Tool>>({});
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTool(toolToEdit || { serialNumber: '' });
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen, toolToEdit]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTool(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tool.name && tool.partNumber) {
        const finalTool = {
            ...tool,
            name: tool.name,
            partNumber: tool.partNumber,
            manufacturer: tool.manufacturer || 'N/A',
            serialNumber: tool.serialNumber || 'N/A',
        };
      onSave(finalTool as Tool);
      handleClose();
    }
  };
  
  const isEditing = !!toolToEdit;
  const isFormValid = tool.name && tool.partNumber;

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
      <div className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Tool' : 'Add New Tool'}</h2>
          </header>
          <div className="p-5 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Tool Name <span className="text-red-400">*</span></label>
                    <input type="text" name="name" id="name" value={tool.name || ''} onChange={handleChange} required className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-300 mb-1">Manufacturer</label>
                    <input type="text" name="manufacturer" id="manufacturer" value={tool.manufacturer || ''} onChange={handleChange} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="partNumber" className="block text-sm font-medium text-gray-300 mb-1">Part Number <span className="text-red-400">*</span></label>
                    <input type="text" name="partNumber" id="partNumber" value={tool.partNumber || ''} onChange={handleChange} required className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-300 mb-1">Serial Number</label>
                    <input type="text" name="serialNumber" id="serialNumber" value={tool.serialNumber || ''} onChange={handleChange} disabled={isEditing} placeholder={isEditing ? '' : 'Leave blank for N/A'} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700 disabled:text-gray-400" />
                </div>
                 <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                    <input type="text" name="model" id="model" value={tool.model || ''} onChange={handleChange} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                    <input type="text" name="location" id="location" value={tool.location || ''} onChange={handleChange} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                 <div>
                    <label htmlFor="calibrationStatus" className="block text-sm font-medium text-gray-300 mb-1">Calibration Status</label>
                    <select name="calibrationStatus" id="calibrationStatus" value={tool.calibrationStatus || 'N/A'} onChange={handleChange} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500">
                        <option>N/A</option>
                        <option>Good</option>
                        <option>Needs Calibration</option>
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <input type="text" name="description" id="description" value={tool.description || ''} onChange={handleChange} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
          </div>
          <footer className="flex justify-end gap-3 p-5 border-t border-gray-700 bg-gray-800/50">
            <button type="button" onClick={handleClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={!isFormValid} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">Save Tool</button>
          </footer>
        </form>
      </div>
    </div>
  );
};


interface InventoryManagerProps {
  tools: Tool[];
  onAddTool: (tool: Omit<Tool, 'serialNumber'> & { serialNumber?: string }) => void;
  onUpdateTool: (tool: Tool) => void;
  onDeleteTool: (tools: Tool[]) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onImportMaster: (file: File) => void;
  isImportingMaster: boolean;
}

type SortKey = keyof Tool;
type SortDirection = 'asc' | 'desc';

const getCalibrationStatus = (tool: Tool) => {
    if (tool.calibrationDueDays === undefined || tool.calibrationDueDays === null) {
        return { text: 'For Reference Only', className: 'bg-gray-100 text-gray-800' };
    }
    if (tool.calibrationDueDays < 0) {
        return { text: 'Overdue', className: 'bg-red-100 text-red-800' };
    }
    return { text: 'Calibrated', className: 'bg-green-100 text-green-800' };
};


const InventoryManager: React.FC<InventoryManagerProps> = ({ tools, onAddTool, onUpdateTool, onDeleteTool, addToast, onImportMaster, isImportingMaster }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('toolId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [showWithSerial, setShowWithSerial] = useState(false);
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set());
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiQuery, setAiQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<Tool[] | null>(null);

  const handleAiSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!aiQuery.trim()) return;

      setIsAiSearching(true);
      try {
          const results = await queryInventory(aiQuery, tools);
          setAiSearchResults(results);
          if (results.length === 0) {
              addToast(`AI search for "${aiQuery}" found no results.`, 'info');
          } else {
              addToast(`AI search returned ${results.length} tools.`, 'success');
          }
      } catch (error) {
          const message = error instanceof Error ? error.message : "AI search failed.";
          addToast(message, 'error');
          console.error(error);
      } finally {
          setIsAiSearching(false);
      }
  };

  const manufacturers = useMemo(() => ['all', ...Array.from(new Set(tools.map(t => t.manufacturer))).sort()], [tools]);

  const displayedTools = useMemo(() => aiSearchResults ?? tools, [aiSearchResults, tools]);

  const filteredAndSortedTools = useMemo(() => {
    let filtered = displayedTools.filter(tool => {
      const matchesSearch = searchTerm ?
        (tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         tool.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         tool.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         tool.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())) : true;

      const matchesManufacturer = manufacturerFilter !== 'all' ? tool.manufacturer === manufacturerFilter : true;
      const matchesSerial = showWithSerial ? (tool.serialNumber && tool.serialNumber !== 'N/A') : true;

      return matchesSearch && matchesManufacturer && matchesSerial;
    });

    return filtered.sort((a, b) => {
      if (sortKey === 'toolId') {
          const getSortableParts = (toolId: string | undefined) => {
              if (!toolId) return { prefix: 2, num: 0 }; // Put undefined/null last
              const prefix = toolId.startsWith('BJC') ? 0 : 1;
              const num = parseInt(toolId.split('-')[1] || '0', 10);
              return { prefix, num };
          };

          const aParts = getSortableParts(a.toolId);
          const bParts = getSortableParts(b.toolId);

          if (aParts.prefix !== bParts.prefix) {
              return sortDirection === 'asc' ? aParts.prefix - bParts.prefix : bParts.prefix - aParts.prefix;
          }
          
          return sortDirection === 'asc' ? aParts.num - bParts.num : bParts.num - aParts.num;
      }

      // Fallback logic for other columns
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [displayedTools, searchTerm, sortKey, sortDirection, manufacturerFilter, showWithSerial]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
        const numSelected = selectedSerials.size;
        const numVisible = filteredAndSortedTools.length;
        headerCheckboxRef.current.checked = numSelected > 0 && numSelected === numVisible;
        headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numVisible;
    }
  }, [selectedSerials, filteredAndSortedTools]);


  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedSerials(new Set(filteredAndSortedTools.map(t => t.serialNumber)));
    } else {
        setSelectedSerials(new Set());
    }
  };

  const handleSelectRow = (serialNumber: string, isChecked: boolean) => {
    const newSelection = new Set(selectedSerials);
    if (isChecked) {
        newSelection.add(serialNumber);
    } else {
        newSelection.delete(serialNumber);
    }
    setSelectedSerials(newSelection);
  };
  
  const handleOpenModal = (tool: Tool | null) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };
  
  const handleSaveTool = (toolData: Tool | (Omit<Tool, 'serialNumber'> & { serialNumber?: string })) => {
    if (editingTool) {
      onUpdateTool(toolData as Tool);
      addToast(`Updated tool: ${toolData.name}`, 'success');
    } else {
      onAddTool(toolData);
      addToast(`Added new tool: ${toolData.name}`, 'success');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportMaster(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };
  
    const SortableHeader: React.FC<{ headerKey: SortKey, title: string }> = ({ headerKey, title }) => (
    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50" onClick={() => handleSort(headerKey)}>
      <div className="flex items-center gap-2">
        {title}
        {sortKey === headerKey && (
          sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
        <ToolFormModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveTool}
            toolToEdit={editingTool}
        />

      <h2 className="text-2xl font-semibold text-white mb-4">Master Inventory Manager ({tools.length} tools)</h2>
      
      <form onSubmit={handleAiSearch} className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <label htmlFor="ai-search" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"><BrainIcon className="w-5 h-5 text-cyan-400" /> Natural Language Search</label>
        <div className="flex gap-2">
            <input 
                id="ai-search"
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder='e.g., "Show me all jacks under 10 tons"'
                className="flex-grow bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
            />
            <button type="submit" disabled={isAiSearching} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-wait">
                {isAiSearching ? 'Searching...' : 'Search'}
            </button>
            {aiSearchResults && (
                <button type="button" onClick={() => { setAiSearchResults(null); setAiQuery(''); }} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500">
                    Clear
                </button>
            )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input 
            type="text"
            placeholder="Filter by name, P/N, S/N..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
        />
        <select value={manufacturerFilter} onChange={(e) => setManufacturerFilter(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500">
            {manufacturers.map(m => <option key={m} value={m}>{m === 'all' ? 'All Manufacturers' : m}</option>)}
        </select>
        <div className="flex items-center">
            <input type="checkbox" id="with-serial" checked={showWithSerial} onChange={(e) => setShowWithSerial(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
            <label htmlFor="with-serial" className="ml-2 text-sm text-gray-300">Has Serial Number</label>
        </div>
      </div>

       <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => handleOpenModal(null)} className="bg-cyan-600 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-cyan-500">Add New Tool</button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,text/csv" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={isImportingMaster} className="bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-wait">
                {isImportingMaster ? 'Importing...' : 'Import from CSV'}
            </button>
            {selectedSerials.size > 0 && (
                <button onClick={() => {
                    onDeleteTool(tools.filter(t => selectedSerials.has(t.serialNumber)));
                    setSelectedSerials(new Set());
                 }} className="bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-red-500">
                    Delete Selected ({selectedSerials.size})
                </button>
            )}
       </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800 sticky top-0">
                 <tr>
                    <th scope="col" className="px-4 py-3">
                        <input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
                    </th>
                    <SortableHeader headerKey="toolId" title="Tool ID" />
                    <SortableHeader headerKey="name" title="Tool Name" />
                    <SortableHeader headerKey="partNumber" title="Part Number" />
                    <SortableHeader headerKey="model" title="Model" />
                    <SortableHeader headerKey="serialNumber" title="Serial Number" />
                    <SortableHeader headerKey="location" title="Location" />
                    <SortableHeader headerKey="calibrationDueDays" title="Calibration Status" />
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className="bg-gray-900/50 divide-y divide-gray-700">
                {filteredAndSortedTools.map(tool => {
                    const calStatus = getCalibrationStatus(tool);
                    return (
                        <tr key={tool.serialNumber} className={`hover:bg-gray-800/60 transition-colors ${selectedSerials.has(tool.serialNumber) ? 'bg-cyan-900/40' : ''}`}>
                            <td className="px-4 py-4">
                                <input type="checkbox" checked={selectedSerials.has(tool.serialNumber)} onChange={(e) => handleSelectRow(tool.serialNumber, e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{tool.toolId}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{tool.name}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{tool.partNumber}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{tool.model}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{tool.serialNumber}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{tool.location}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${calStatus.className}`}>
                                    {calStatus.text}
                                </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleOpenModal(tool)} className="text-cyan-400 hover:text-cyan-300 mr-4"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDeleteTool([tool])} className="text-red-500 hover:text-red-400"><DeleteIcon className="w-5 h-5"/></button>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
        {filteredAndSortedTools.length === 0 && <p className="text-center text-gray-500 py-8">No tools match your criteria.</p>}
      </div>
    </div>
  );
};

export default InventoryManager;