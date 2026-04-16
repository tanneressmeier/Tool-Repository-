
import React, { useState, useMemo, useRef } from 'react';
import type { Tool, PurchasePlanItem } from '../types';

interface PurchasingManagerProps {
    purchasePlan: PurchasePlanItem[];
    masterInventory: Tool[];
    onAddTool: (tool: Omit<Tool, 'serialNumber'> & { serialNumber?: string }) => void;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
    onImportPlan: (file: File) => void;
    isImportingPlan: boolean;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>;
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const LinkIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>;

const getStatusStyle = (status: string, received: boolean) => {
    if (received) return 'bg-green-900/30 text-green-400 border border-green-700/50';
    
    const s = (status || '').toLowerCase();
    if (s.includes('received') || s.includes('owned') || s.includes('bjc') || s.includes('both') || s.includes('equivilent')) {
        return 'bg-green-900/30 text-green-400 border border-green-700/50';
    }
    if (s.includes('ordered')) {
        return 'bg-blue-900/30 text-blue-400 border border-blue-700/50';
    }
    if (s.includes('approved') && !s.includes('pending')) {
        return 'bg-teal-900/30 text-teal-400 border border-teal-700/50';
    }
    if (s.includes('pending')) {
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50';
    }
    if (s.includes('sourcing') || s.includes('research')) {
        return 'bg-purple-900/30 text-purple-400 border border-purple-700/50';
    }
    return 'bg-gray-800 text-gray-400 border border-gray-700';
};

const PurchasingManager: React.FC<PurchasingManagerProps> = ({ purchasePlan, masterInventory, onAddTool, addToast, onImportPlan, isImportingPlan }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const masterInventoryMap = useMemo(() => {
        const map = new Map<string, Tool>();
        masterInventory.forEach(tool => {
            if (tool.model && tool.model !== 'N/A') {
                map.set(tool.model.toUpperCase(), tool);
            }
        });
        return map;
    }, [masterInventory]);

    const filteredPlan = useMemo(() => {
        return purchasePlan.filter(item => {
            const lowerSearch = searchTerm.toLowerCase();
            return (
                item.name.toLowerCase().includes(lowerSearch) ||
                item.partNumber.toLowerCase().includes(lowerSearch) ||
                item.manufacturer.toLowerCase().includes(lowerSearch) ||
                item.aircraft.toLowerCase().includes(lowerSearch) ||
                item.status.toLowerCase().includes(lowerSearch) ||
                (item.tlNumber && item.tlNumber.toLowerCase().includes(lowerSearch))
            );
        });
    }, [purchasePlan, searchTerm]);

    const handleReceiveTool = (item: PurchasePlanItem) => {
        const newTool: Omit<Tool, 'serialNumber'> & { serialNumber?: string, toolId?: string } = {
            name: item.name,
            manufacturer: item.manufacturer,
            model: item.partNumber, // Using partNumber as model
            description: item.reason,
            category: item.itemType,
            serialNumber: 'N/A'
        };
        
        if (item.tlNumber) {
            newTool.toolId = item.tlNumber;
        }

        onAddTool(newTool);
        addToast(`Received and added "${item.name}" to master inventory.`, 'success');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportPlan(file);
        }
        if (event.target) {
            event.target.value = ''; // Reset file input
        }
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col h-[calc(100vh-140px)]">
            <h2 className="text-2xl font-semibold text-white mb-4 flex-shrink-0">Purchasing Manager ({purchasePlan.length} items)</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4 flex-shrink-0">
                <input
                    type="text"
                    placeholder="Search purchase plan (Name, P/N, Status)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:flex-grow bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500"
                />
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,text/csv" className="hidden" />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImportingPlan}
                    className="bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-wait whitespace-nowrap"
                >
                    {isImportingPlan ? 'Importing...' : 'Import Purchase Plan'}
                </button>
            </div>
            <div className="overflow-auto rounded-lg border border-gray-700 flex-grow">
                <table className="min-w-full divide-y divide-gray-700 relative table-fixed">
                    <thead className="bg-gray-800 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/3">Item Details</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">Aircraft</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-32">Status</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider w-24">Price</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider w-40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900/50 divide-y divide-gray-700">
                        {filteredPlan.map(item => {
                            const isInMaster = masterInventoryMap.has(item.partNumber.toUpperCase());
                            const isTool = item.itemType === 'Tool';
                            const isReceived = item.received || (item.status && item.status.toLowerCase().includes('received'));
                            const statusStyle = getStatusStyle(item.status, !!isReceived);
                            
                            return (
                                <tr key={item.id} className="hover:bg-gray-800/60 transition-colors group">
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white truncate" title={item.name}>{item.name}</span>
                                            <span className="text-xs text-gray-400 font-mono mt-0.5 truncate" title={item.partNumber}>P/N: {item.partNumber}</span>
                                            {item.manufacturer && <span className="text-xs text-gray-500 truncate">{item.manufacturer}</span>}
                                            {item.sourcingLink && (
                                                <a href={item.sourcingLink} target="_blank" rel="noreferrer" className="text-xs text-cyan-500 hover:text-cyan-400 flex items-center gap-1 mt-1 w-fit">
                                                    <LinkIcon className="w-3 h-3" /> View Source
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-xs text-gray-400 truncate max-w-[200px]" title={item.aircraft}>
                                            {item.aircraft || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-none font-bold rounded-full ${statusStyle}`}>
                                            {item.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right whitespace-nowrap">
                                        <span className="text-sm text-gray-300 font-mono">{item.unitPrice || '-'}</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {isTool && isReceived && !isInMaster && (
                                                <button 
                                                    onClick={() => handleReceiveTool(item)} 
                                                    className="flex items-center gap-1 text-xs bg-cyan-600 text-white font-semibold py-1.5 px-3 rounded hover:bg-cyan-500 transition-colors"
                                                    title="Add to Master Inventory"
                                                >
                                                    <PlusIcon className="w-3 h-3" /> Add
                                                </button>
                                            )}
                                            {isTool && isInMaster && (
                                                <span className="flex items-center gap-1 text-xs text-green-400 font-medium bg-green-900/20 px-2 py-1 rounded border border-green-900/30">
                                                    <CheckIcon className="w-3 h-3" /> In Stock
                                                </span>
                                            )}
                                            {(!isTool || !isReceived) && !isInMaster && (
                                                <span className="text-xs text-gray-600">-</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredPlan.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <p className="text-lg font-medium">No purchase items found.</p>
                        <p className="text-sm">Try adjusting your search or importing a plan.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchasingManager;
