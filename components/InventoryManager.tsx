
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Tool } from '../types';
import { queryInventory, normalizeManufacturers } from '../services/geminiService';
import { BrainIcon } from './icons/BrainIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import CompanyToolsReportModal from './CompanyToolsReportModal';

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

const DocumentChartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
);

const ListBulletIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);

const ArrowPathIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
);

const MapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);

const BuildingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);


// Bulk Edit Modal
interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  field: 'owner' | 'location';
  count: number;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({ isOpen, onClose, onSave, field, count }) => {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(value);
    handleClose();
  };

  if (!isOpen) return null;

  const title = field === 'owner' ? 'Transfer Ownership' : 'Move Location';
  const placeholder = field === 'owner' ? 'Enter new owner name...' : 'Enter new location...';

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
      <div className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <header className="p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-sm text-gray-400 mt-1">Applying changes to {count} selected items.</p>
          </header>
          <div className="p-5">
            <label htmlFor="bulkValue" className="block text-sm font-medium text-gray-300 mb-1">
                New {field === 'owner' ? 'Owner' : 'Location'}
            </label>
            <input 
                autoFocus
                type="text" 
                id="bulkValue" 
                value={value} 
                onChange={e => setValue(e.target.value)} 
                required 
                placeholder={placeholder}
                className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" 
            />
          </div>
          <footer className="flex justify-end gap-3 p-5 border-t border-gray-700 bg-gray-800/50">
            <button type="button" onClick={handleClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={!value.trim()} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">Apply Update</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

// Data Normalization Modal
interface DataNormalizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    proposedChanges: { original: string; normalized: string; count: number }[];
}

const DataNormalizationModal: React.FC<DataNormalizationModalProps> = ({ isOpen, onClose, onConfirm, proposedChanges }) => {
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

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
            <div className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh] transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-yellow-400" />
                        Clean Manufacturer Names
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">AI detected {proposedChanges.length} inconsistent manufacturer names.</p>
                </header>
                
                <div className="flex-grow overflow-y-auto p-5">
                    {proposedChanges.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Original Value</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Normalized To</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Items</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {proposedChanges.map((change, idx) => (
                                    <tr key={idx} className="hover:bg-gray-700/30">
                                        <td className="px-4 py-3 text-sm text-red-300">{change.original}</td>
                                        <td className="px-4 py-3 text-center text-gray-500">→</td>
                                        <td className="px-4 py-3 text-sm text-green-300 font-medium">{change.normalized}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400 text-right">{change.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            No inconsistencies found. Your data is clean!
                        </div>
                    )}
                </div>

                <footer className="flex justify-end gap-3 p-5 border-t border-gray-700 bg-gray-800/50">
                    <button onClick={handleClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                    <button 
                        onClick={() => { onConfirm(); handleClose(); }} 
                        disabled={proposedChanges.length === 0}
                        className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        Apply Changes
                    </button>
                </footer>
            </div>
        </div>
    );
};


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
      // Merge defaults with passed tool (which might be partial for new item defaults)
      const defaults = { serialNumber: '', owner: 'Company', toolCost: '0' };
      setTool({ ...defaults, ...(toolToEdit || {}) });
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
    if (tool.name && tool.model) {
        const finalTool = {
            ...tool,
            name: tool.name,
            model: tool.model,
            manufacturer: tool.manufacturer || 'N/A',
            serialNumber: tool.serialNumber || 'N/A',
            owner: tool.owner || 'Company',
            toolCost: tool.toolCost || '0',
        };
      onSave(finalTool as Tool);
      handleClose();
    }
  };
  
  // Use toolId check to determine if this is an Edit operation
  const isEditing = !!toolToEdit?.toolId;
  const isFormValid = tool.name && tool.model;

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
                    <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-1">Model / Part Number <span className="text-red-400">*</span></label>
                    <input type="text" name="model" id="model" value={tool.model || ''} onChange={handleChange} required className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-300 mb-1">Manufacturer</label>
                    <input type="text" name="manufacturer" id="manufacturer" value={tool.manufacturer || ''} onChange={handleChange} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-300 mb-1">Serial Number</label>
                    <input type="text" name="serialNumber" id="serialNumber" value={tool.serialNumber || ''} onChange={handleChange} disabled={isEditing} placeholder={isEditing ? '' : 'Leave blank for N/A'} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-700 disabled:text-gray-400" />
                </div>
                <div>
                    <label htmlFor="owner" className="block text-sm font-medium text-gray-300 mb-1">Owner</label>
                    <input type="text" name="owner" id="owner" value={tool.owner || ''} onChange={handleChange} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., Company, John Doe" />
                </div>
                <div>
                    <label htmlFor="toolCost" className="block text-sm font-medium text-gray-300 mb-1">Cost ($)</label>
                    <input type="text" name="toolCost" id="toolCost" value={tool.toolCost || ''} onChange={handleChange} className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., 500" />
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
  onBatchUpdateTools?: (tools: Tool[]) => void;
}

type SortKey = keyof Tool;
type SortDirection = 'asc' | 'desc';

const getCalibrationStatus = (tool: Tool) => {
    if (tool.calibrationStatus === 'Needs Calibration') {
        return { text: 'Needs Cal', className: 'bg-red-900/30 text-red-400 border border-red-700/50' };
    }
    if (tool.calibrationStatus === 'Good') {
        return { text: 'Good', className: 'bg-green-900/30 text-green-400 border border-green-700/50' };
    }
    return { text: 'N/A', className: 'bg-gray-800 text-gray-400 border border-gray-700' };
};

const formatCurrency = (value: number | string | undefined) => {
    if (!value) return '-';
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
    if (isNaN(num) || num === 0) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
};


const InventoryManager: React.FC<InventoryManagerProps> = ({ tools, onAddTool, onUpdateTool, onDeleteTool, addToast, onImportMaster, isImportingMaster, onBatchUpdateTools }) => {
  const [viewMode, setViewMode] = useState<'master' | 'bjc' | 'slc' | 'calibration'>('master');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('toolId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [showWithSerial, setShowWithSerial] = useState(false);
  const [selectedSerials, setSelectedSerials] = useState<Set<string>>(new Set());
  
  const [isCompanyReportOpen, setIsCompanyReportOpen] = useState(false);

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Tool>>({});

  // Bulk Actions State
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [bulkActionField, setBulkActionField] = useState<'owner' | 'location' | null>(null);

  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkMenuRef = useRef<HTMLDivElement>(null);

  const [aiQuery, setAiQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<Tool[] | null>(null);
  
  // Normalization State
  const [isNormalizationModalOpen, setIsNormalizationModalOpen] = useState(false);
  const [normalizationChanges, setNormalizationChanges] = useState<{ original: string; normalized: string; count: number }[]>([]);
  const [isCleaningData, setIsCleaningData] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (bulkMenuRef.current && !bulkMenuRef.current.contains(event.target as Node)) {
            setIsBulkMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleCleanData = async () => {
      setIsCleaningData(true);
      try {
          const uniqueManufacturers = Array.from(new Set(tools.map(t => t.manufacturer).filter(m => m && m !== 'N/A'))) as string[];
          if (uniqueManufacturers.length === 0) {
              addToast("No manufacturer data to clean.", "info");
              return;
          }

          const mappings = await normalizeManufacturers(uniqueManufacturers);
          
          const proposedChanges: { original: string; normalized: string; count: number }[] = [];
          
          mappings.forEach(mapping => {
              const count = tools.filter(t => t.manufacturer === mapping.original).length;
              if (count > 0) {
                  proposedChanges.push({ ...mapping, count });
              }
          });

          if (proposedChanges.length > 0) {
              setNormalizationChanges(proposedChanges);
              setIsNormalizationModalOpen(true);
          } else {
              addToast("Data is already clean! No inconsistencies found.", "success");
          }

      } catch (error) {
          console.error(error);
          addToast("Failed to analyze data.", "error");
      } finally {
          setIsCleaningData(false);
      }
  };

  const handleApplyNormalization = () => {
      if (!onBatchUpdateTools) return;
      
      const normalizationMap = new Map(normalizationChanges.map(c => [c.original, c.normalized]));
      const toolsToUpdate: Tool[] = [];

      tools.forEach(tool => {
          if (normalizationMap.has(tool.manufacturer)) {
              toolsToUpdate.push({
                  ...tool,
                  manufacturer: normalizationMap.get(tool.manufacturer)!
              });
          }
      });

      onBatchUpdateTools(toolsToUpdate);
      addToast(`Normalized ${toolsToUpdate.length} manufacturer names.`, "success");
      setNormalizationChanges([]);
  };

  const manufacturers = useMemo(() => ['all', ...Array.from(new Set(tools.map(t => t.manufacturer))).sort()], [tools]);

  const displayedTools = useMemo(() => aiSearchResults ?? tools, [aiSearchResults, tools]);
  
  const filteredAndSortedTools = useMemo(() => {
    let filtered = displayedTools.filter(tool => {
      const matchesSearch = searchTerm ?
        (tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         tool.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         tool.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         tool.owner?.toLowerCase().includes(searchTerm.toLowerCase())) : true;

      const matchesManufacturer = manufacturerFilter !== 'all' ? tool.manufacturer === manufacturerFilter : true;
      const matchesSerial = showWithSerial ? (tool.serialNumber && tool.serialNumber !== 'N/A') : true;
      
      if (viewMode === 'bjc') {
          const isBjc = tool.toolId?.toUpperCase().startsWith('BJC');
          return matchesSearch && matchesManufacturer && matchesSerial && isBjc;
      }

      if (viewMode === 'slc') {
          const uid = tool.toolId?.toUpperCase();
          const isSlc = uid?.startsWith('TL') || uid?.startsWith('SLC');
          return matchesSearch && matchesManufacturer && matchesSerial && isSlc;
      }

      if (viewMode === 'calibration') {
          const needsCalTracking = tool.calibrationStatus !== 'N/A';
          return matchesSearch && matchesManufacturer && matchesSerial && needsCalTracking;
      }

      // Master list
      return matchesSearch && matchesManufacturer && matchesSerial;
    });

    return filtered.sort((a, b) => {
      if (viewMode === 'calibration') {
          // Strict ascending sort by days remaining for calibration dashboard
          const daysA = a.calibrationDueDays ?? 9999;
          const daysB = b.calibrationDueDays ?? 9999;
          return daysA - daysB;
      }
      
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
  }, [displayedTools, searchTerm, sortKey, sortDirection, manufacturerFilter, showWithSerial, viewMode]);

  // Calculate total value of filtered tools (reflects the current view)
  const totalValue = useMemo(() => {
      return filteredAndSortedTools.reduce((sum, tool) => {
          const cost = parseFloat(tool.toolCost?.replace(/[^0-9.-]+/g, "") || "0");
          return sum + (isNaN(cost) ? 0 : cost);
      }, 0);
  }, [filteredAndSortedTools]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
        const numSelected = selectedSerials.size;
        const numVisible = filteredAndSortedTools.length;
        headerCheckboxRef.current.checked = numSelected > 0 && numSelected === numVisible;
        headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numVisible;
    }
  }, [selectedSerials, filteredAndSortedTools]);


  const handleSort = (key: SortKey) => {
    if (viewMode === 'calibration') return; // Disable custom sort in calibration view
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
    if (tool) {
        setEditingTool(tool);
    } else {
        // Set defaults for new tool
        const defaults: Partial<Tool> = { serialNumber: '', owner: 'Company', toolCost: '0' };
        if (viewMode === 'slc') {
            defaults.location = 'SLC';
        }
        setEditingTool(defaults as Tool);
    }
    setIsModalOpen(true);
  };
  
  const handleSaveTool = (toolData: Tool | (Omit<Tool, 'serialNumber'> & { serialNumber?: string })) => {
    if (editingTool && editingTool.toolId) {
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

  const handleQuickCalibrate = (tool: Tool) => {
    if (confirm(`Mark ${tool.name} as calibrated today?\nThis will reset the due date to 365 days from now.`)) {
        onUpdateTool({
            ...tool,
            calibrationStatus: 'Good',
            calibrationDueDays: 365
        });
        addToast(`${tool.name} calibration updated.`, 'success');
    }
  };

  // Inline Editing Handlers
  const handleStartInlineEdit = (tool: Tool) => {
      if (!tool.toolId) return;
      setEditingId(tool.toolId);
      setEditForm({
          location: tool.location,
          owner: tool.owner,
          calibrationStatus: tool.calibrationStatus
      });
  };

  const handleCancelInlineEdit = () => {
      setEditingId(null);
      setEditForm({});
  };

  const handleInlineChange = (field: keyof Tool, value: string) => {
      setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveInlineEdit = (originalTool: Tool) => {
      const updatedTool = { ...originalTool, ...editForm };
      onUpdateTool(updatedTool);
      setEditingId(null);
      setEditForm({});
      addToast(`Updated ${originalTool.name}`, 'success');
  };

  // Bulk Action Handlers
  const handleBulkUpdate = (newValue: string) => {
      if (!bulkActionField) return;

      const toolsToUpdate = tools.filter(t => selectedSerials.has(t.serialNumber));
      let updatedCount = 0;

      toolsToUpdate.forEach(tool => {
          onUpdateTool({
              ...tool,
              [bulkActionField]: newValue
          });
          updatedCount++;
      });

      addToast(`Updated ${bulkActionField} for ${updatedCount} items.`, 'success');
      setBulkActionField(null);
      setSelectedSerials(new Set()); // Clear selection
      setIsBulkMenuOpen(false);
  };
  
    const SortableHeader: React.FC<{ headerKey: SortKey, title: string, align?: 'left' | 'right' | 'center' }> = ({ headerKey, title, align = 'left' }) => (
    <th scope="col" className={`px-4 py-3 text-${align} text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 hover:text-white transition-colors select-none`} onClick={() => handleSort(headerKey)}>
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
        {title}
        {viewMode !== 'calibration' && sortKey === headerKey && (
          sortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3 text-cyan-400" /> : <ArrowDownIcon className="w-3 h-3 text-cyan-400" />
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

        <CompanyToolsReportModal
            isOpen={isCompanyReportOpen}
            onClose={() => setIsCompanyReportOpen(false)}
            tools={tools}
        />
        
        <BulkEditModal 
            isOpen={!!bulkActionField}
            onClose={() => setBulkActionField(null)}
            onSave={handleBulkUpdate}
            field={bulkActionField || 'owner'}
            count={selectedSerials.size}
        />

        <DataNormalizationModal
            isOpen={isNormalizationModalOpen}
            onClose={() => setIsNormalizationModalOpen(false)}
            onConfirm={handleApplyNormalization}
            proposedChanges={normalizationChanges}
        />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Master Inventory Manager</h2>
            <p className="text-gray-400 text-sm mt-1">Manage tracking, costs, and assignment for {tools.length} assets</p>
          </div>
          <div className="bg-gray-900/80 border border-gray-700 px-5 py-3 rounded-xl flex items-center gap-4">
              <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                      {viewMode === 'master' ? 'Total' : viewMode === 'bjc' ? 'BJC' : viewMode === 'slc' ? 'SLC' : 'Filtered'} Value
                  </p>
                  <p className="text-2xl font-mono font-bold text-green-400">{formatCurrency(totalValue)}</p>
              </div>
              <div className="h-8 w-px bg-gray-700"></div>
              <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Items</p>
                  <p className="text-2xl font-mono font-bold text-white">{filteredAndSortedTools.length}</p>
              </div>
          </div>
      </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
            <div className="bg-gray-900 p-1 rounded-lg border border-gray-700 inline-flex flex-wrap justify-center gap-1">
                <button
                    onClick={() => setViewMode('master')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'master' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    <ListBulletIcon className="w-4 h-4" />
                    Master List
                </button>
                <button
                    onClick={() => setViewMode('bjc')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'bjc' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    <BuildingIcon className="w-4 h-4" />
                    BJC Inventory
                </button>
                <button
                    onClick={() => setViewMode('slc')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'slc' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    <MapIcon className="w-4 h-4" />
                    SLC Inventory
                </button>
                <button
                    onClick={() => setViewMode('calibration')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'calibration' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    <ClockIcon className="w-4 h-4" />
                    Calibration
                </button>
            </div>
        </div>
      
      <form onSubmit={handleAiSearch} className="mb-6 p-1 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-900/30">
        <div className="flex gap-2 p-3">
             <div className="relative flex-grow">
                <BrainIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <input 
                    id="ai-search"
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder='Ask AI: "Show me all personnel owned crimpers"'
                    className="w-full pl-10 bg-gray-900/80 border border-gray-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500"
                />
            </div>
            <button type="submit" disabled={isAiSearching} className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-wait transition-all shadow-lg shadow-cyan-900/20">
                {isAiSearching ? 'Searching...' : 'Ask AI'}
            </button>
            {aiSearchResults && (
                <button type="button" onClick={() => { setAiSearchResults(null); setAiQuery(''); }} className="bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-lg hover:bg-gray-600 hover:text-white transition-colors">
                    Clear
                </button>
            )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input 
            type="text"
            placeholder="Filter by name, model, owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg shadow-sm py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
        />
        <select value={manufacturerFilter} onChange={(e) => setManufacturerFilter(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg shadow-sm py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500">
            {manufacturers.map(m => <option key={m} value={m}>{m === 'all' ? 'All Manufacturers' : m}</option>)}
        </select>
        <div className="flex items-center bg-gray-900 border border-gray-600 rounded-lg px-3 py-2">
            <input type="checkbox" id="with-serial" checked={showWithSerial} onChange={(e) => setShowWithSerial(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
            <label htmlFor="with-serial" className="ml-2 text-sm text-gray-300 select-none cursor-pointer">Has Serial Number</label>
        </div>
      </div>

       <div className="flex flex-wrap gap-2 mb-4 items-center">
            <button onClick={() => handleOpenModal(null)} className="bg-cyan-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20">Add New Tool</button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,text/csv" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={isImportingMaster} className="bg-gray-700 text-gray-300 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 hover:text-white disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-wait transition-colors">
                {isImportingMaster ? 'Importing...' : 'Import CSV'}
            </button>
            
            <div className="h-6 w-px bg-gray-700 mx-2 hidden md:block"></div>
            
             <button onClick={() => setIsCompanyReportOpen(true)} className="bg-purple-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-purple-500 flex items-center gap-2 transition-colors shadow-lg shadow-purple-900/20">
                <DocumentChartIcon className="w-4 h-4" /> Valuation Report
            </button>

             <button onClick={handleCleanData} disabled={isCleaningData} className="bg-yellow-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 flex items-center gap-2 transition-colors shadow-lg shadow-yellow-900/20 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-wait">
                <SparklesIcon className="w-4 h-4" /> {isCleaningData ? 'Cleaning...' : 'Clean Data'}
            </button>

            {selectedSerials.size > 0 && (
                <div className="ml-auto relative" ref={bulkMenuRef}>
                  <button 
                    onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
                    className="bg-indigo-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 flex items-center gap-2 transition-colors shadow-lg shadow-indigo-900/20"
                  >
                      Bulk Actions ({selectedSerials.size})
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${isBulkMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isBulkMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
                          <button 
                            onClick={() => {
                                setBulkActionField('owner');
                                setIsBulkMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                          >
                              Transfer Ownership
                          </button>
                          <button 
                            onClick={() => {
                                setBulkActionField('location');
                                setIsBulkMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                          >
                              Move Location
                          </button>
                          <div className="h-px bg-gray-700 my-1"></div>
                          <button 
                            onClick={() => {
                                onDeleteTool(tools.filter(t => selectedSerials.has(t.serialNumber)));
                                setSelectedSerials(new Set());
                                setIsBulkMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                          >
                              Delete Selected
                          </button>
                      </div>
                  )}
                </div>
            )}
       </div>

      <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-inner bg-gray-900">
        <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
                 <tr>
                    <th scope="col" className="px-4 py-3 w-12">
                        <input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
                    </th>
                    <SortableHeader headerKey="toolId" title="ID" />
                    <SortableHeader headerKey="name" title="Tool Name" />
                    <SortableHeader headerKey="model" title="Model / P/N" />
                    <SortableHeader headerKey="serialNumber" title="Serial #" />
                    <SortableHeader headerKey="location" title="Loc" />
                    <SortableHeader headerKey="owner" title="Owner" />
                    <SortableHeader headerKey="toolCost" title="Value" align="right" />
                    <SortableHeader headerKey="calibrationStatus" title={viewMode === 'calibration' ? 'Days Remaining' : 'Status'} align="center" />
                    <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider w-24">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
                {filteredAndSortedTools.map(tool => {
                    const calStatus = getCalibrationStatus(tool);
                    const isCompany = tool.owner && tool.owner.toLowerCase().includes('company');
                    const isEditing = editingId === tool.toolId;
                    
                    let rowClassName = `group hover:bg-gray-800/50 transition-colors ${selectedSerials.has(tool.serialNumber) ? 'bg-cyan-900/20' : ''} ${isEditing ? 'bg-gray-800' : ''}`;
                    
                    // Visual Highlighting for Calibration Dashboard
                    if (viewMode === 'calibration') {
                         const days = tool.calibrationDueDays ?? 999;
                         if (days <= 0) {
                             rowClassName += ' bg-red-900/20 border-l-4 border-l-red-500';
                         } else if (days <= 30) {
                             rowClassName += ' bg-yellow-900/20 border-l-4 border-l-yellow-500';
                         }
                    }

                    return (
                        <tr key={tool.toolId || tool.serialNumber} className={rowClassName}>
                            <td className="px-4 py-3">
                                <input type="checkbox" checked={selectedSerials.has(tool.serialNumber)} onChange={(e) => handleSelectRow(tool.serialNumber, e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-300">{tool.toolId}</td>
                            <td className="px-4 py-3 text-sm text-white font-medium">{tool.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-cyan-400 font-mono">{tool.model}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 font-mono text-xs">{tool.serialNumber}</td>
                            
                            {/* Editable Location */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 cursor-pointer hover:bg-gray-700/50 transition-colors" onClick={() => !isEditing && handleStartInlineEdit(tool)}>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={editForm.location || ''} 
                                        onChange={(e) => handleInlineChange('location', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded py-1 px-2 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                        autoFocus
                                    />
                                ) : (
                                    tool.location
                                )}
                            </td>

                            {/* Editable Owner */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm cursor-pointer hover:bg-gray-700/50 transition-colors" onClick={() => !isEditing && handleStartInlineEdit(tool)}>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={editForm.owner || ''} 
                                        onChange={(e) => handleInlineChange('owner', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded py-1 px-2 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                    />
                                ) : (
                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-md border ${isCompany ? 'bg-indigo-900/30 text-indigo-300 border-indigo-700/50' : 'bg-gray-700/50 text-gray-300 border-gray-600'}`}>
                                        {tool.owner || '-'}
                                    </span>
                                )}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-right text-green-400 font-bold">
                                {formatCurrency(tool.toolCost)}
                            </td>

                            {/* Editable Status / Calibration Days */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center cursor-pointer hover:bg-gray-700/50 transition-colors" onClick={() => !isEditing && handleStartInlineEdit(tool)}>
                                {isEditing ? (
                                     <select 
                                        value={editForm.calibrationStatus || 'N/A'} 
                                        onChange={(e) => handleInlineChange('calibrationStatus', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded py-1 px-2 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                    >
                                        <option value="N/A">N/A</option>
                                        <option value="Good">Good</option>
                                        <option value="Needs Calibration">Needs Calibration</option>
                                    </select>
                                ) : (
                                    viewMode === 'calibration' ? (
                                         <div className="flex flex-col items-center">
                                             <span className={`font-bold ${tool.calibrationDueDays && tool.calibrationDueDays <= 0 ? 'text-red-400' : (tool.calibrationDueDays && tool.calibrationDueDays <= 30 ? 'text-yellow-400' : 'text-gray-300')}`}>
                                                 {tool.calibrationDueDays !== undefined ? `${tool.calibrationDueDays} Days` : 'N/A'}
                                             </span>
                                             <span className="text-[10px] text-gray-500 uppercase tracking-wider">{calStatus.text}</span>
                                         </div>
                                    ) : (
                                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${calStatus.className}`}>
                                            {calStatus.text}
                                        </span>
                                    )
                                )}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                {isEditing ? (
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => handleSaveInlineEdit(tool)} className="text-green-500 hover:text-green-400 transition-colors" title="Save"><CheckIcon className="w-5 h-5"/></button>
                                        <button onClick={handleCancelInlineEdit} className="text-red-500 hover:text-red-400 transition-colors" title="Cancel"><XMarkIcon className="w-5 h-5"/></button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                        {viewMode === 'calibration' && (
                                            <button onClick={() => handleQuickCalibrate(tool)} className="text-cyan-400 hover:text-cyan-300 transition-colors" title="Quick Calibrate (Reset to 365 days)">
                                                <ArrowPathIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button onClick={() => handleOpenModal(tool)} className="text-cyan-400 hover:text-cyan-300 transition-colors" title="Edit"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => onDeleteTool([tool])} className="text-red-500 hover:text-red-400 transition-colors" title="Delete"><DeleteIcon className="w-5 h-5"/></button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
        {filteredAndSortedTools.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-lg font-medium">No tools match your search.</p>
                <p className="text-sm mt-1">Try adjusting your filters or adding a new tool.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;
