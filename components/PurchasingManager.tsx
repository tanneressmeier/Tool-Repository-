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
const ArchiveBoxIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>

const statusColors: { [key: string]: string } = {
  'Approved': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Pending Approval': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Sourcing': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Owned': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'Received': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'In Research': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Not Needed': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  'Ordered': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

const PurchasingManager: React.FC<PurchasingManagerProps> = ({ purchasePlan, masterInventory, onAddTool, addToast, onImportPlan, isImportingPlan }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const masterInventoryPartNumbers = useMemo(() => new Set(masterInventory.map(t => t.partNumber.toUpperCase().trim())), [masterInventory]);

    const uniqueStatuses = useMemo(() => Array.from(new Set(purchasePlan.map(item => item.status).filter(Boolean))), [purchasePlan]);

    const filteredPlan = useMemo(() => {
        return purchasePlan.filter(item => {
            const matchesSearch = (
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.aircraft.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [purchasePlan, searchTerm, statusFilter]);

    const handleAdd = (item: PurchasePlanItem) => {
        const primaryPartNumber = item.partNumber.split('(')[0].trim();
        const newTool: Tool = {
            name: item.name,
            manufacturer: item.manufacturer,
            partNumber: primaryPartNumber,
            serialNumber: 'N/A' // Default serial number
        };
        onAddTool(newTool);
        addToast(`"${item.name}" added to master inventory.`, 'success');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportPlan(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4">Tooling Purchasing Plan ({purchasePlan.length} items)</h2>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 pb-4 border-b border-gray-700">
                <input
                    type="text"
                    placeholder="Search plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-auto flex-grow bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-56 bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                >
                    <option value="all">All Statuses</option>
                    {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,text/csv" className="hidden" />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImportingPlan}
                    className="w-full sm:w-auto bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-wait transition-colors"
                >
                    {isImportingPlan ? 'Importing...' : 'Import CSV'}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tool Details</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Aircraft</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900/50 divide-y divide-gray-700">
                        {filteredPlan.map((item, index) => {
                            const primaryPartNumber = item.partNumber.split('(')[0].trim().toUpperCase();
                            const isInInventory = masterInventoryPartNumbers.has(primaryPartNumber);
                            const finalStatus = item.received || isInInventory ? 'Received' : item.status;
                            
                            return (
                                <tr key={item.id} className="hover:bg-gray-800/60 transition-colors animate-fade-in" style={{ animationDelay: `${Math.min(index * 30, 400)}ms`, opacity: 0 }}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[finalStatus] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                                            {finalStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium text-gray-200">{item.name}</div>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                item.itemType === 'Tool' ? 'bg-blue-500/30 text-blue-300' :
                                                item.itemType === 'Part' ? 'bg-green-500/30 text-green-300' :
                                                'bg-gray-500/30 text-gray-300'
                                            }`}>{item.itemType}</span>
                                        </div>
                                        <div className="text-xs text-gray-400" title={item.partNumber}>P/N: {primaryPartNumber}</div>
                                        <div className="text-xs text-gray-500">Mfg: {item.manufacturer}</div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-400 max-w-xs truncate" title={item.aircraft}>{item.aircraft}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{item.totalPrice}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => handleAdd(item)}
                                            disabled={isInInventory || item.received}
                                            className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-md transition-colors ${isInInventory || item.received ? 'bg-gray-600 text-gray-400 cursor-default' : 'bg-cyan-600 text-white hover:bg-cyan-500'}`}
                                        >
                                            {isInInventory || item.received ? <><ArchiveBoxIcon className="w-4 h-4" /> In Inventory</> : <><PlusIcon className="w-4 h-4" /> Add to Master</>}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredPlan.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>No purchasing items found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchasingManager;