import React, { useState, useMemo, useEffect } from 'react';
import type { Tool, Kit } from '../types';

interface KitsManagerProps {
  kits: Kit[];
  masterInventory: Tool[];
  onKitsUpdate: (kits: Kit[]) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const CubeIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>;
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;


const KitsManager: React.FC<KitsManagerProps> = ({ kits, masterInventory, onKitsUpdate, addToast }) => {
    const [selectedKitId, setSelectedKitId] = useState<string | null>(kits.length > 0 ? kits[0].id : null);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        if (!selectedKitId && kits.length > 0) {
            setSelectedKitId(kits[0].id);
        }
        if (selectedKitId && !kits.find(k => k.id === selectedKitId)) {
            setSelectedKitId(kits.length > 0 ? kits[0].id : null);
        }
    }, [kits, selectedKitId]);

    const selectedKit = useMemo(() => {
        return kits.find(k => k.id === selectedKitId);
    }, [selectedKitId, kits]);

    const toolIdsInKit = useMemo(() => {
        return new Set(selectedKit?.tools.map(t => t.serialNumber));
    }, [selectedKit]);

    const filteredMasterInventory = useMemo(() => {
        if (!searchTerm) return masterInventory;
        return masterInventory.filter(tool =>
            tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [masterInventory, searchTerm]);

    const handleCreateKit = () => {
        const newKitName = `New Kit ${kits.length + 1}`;
        const newKit: Kit = {
            id: `kit-${Date.now()}`,
            name: newKitName,
            tools: [],
            createdAt: new Date().toISOString()
        };
        const updatedKits = [...kits, newKit];
        onKitsUpdate(updatedKits);
        setSelectedKitId(newKit.id);
        addToast(`Created "${newKitName}"`, 'success');
    };

    const handleDeleteKit = (kitId: string) => {
        if (window.confirm("Are you sure you want to delete this kit? This action cannot be undone.")) {
            const kitToDelete = kits.find(k => k.id === kitId);
            const updatedKits = kits.filter(k => k.id !== kitId);
            onKitsUpdate(updatedKits);
            addToast(`Deleted kit "${kitToDelete?.name}"`, 'info');
        }
    };
    
    const handleRenameKit = (kitId: string, newName: string) => {
        const updatedKits = kits.map(k => k.id === kitId ? { ...k, name: newName } : k);
        onKitsUpdate(updatedKits);
    };

    const handleAddToolToKit = (tool: Tool) => {
        if (!selectedKit) return;
        const updatedKits = kits.map(k => {
            if (k.id === selectedKit.id) {
                return { ...k, tools: [...k.tools, tool] };
            }
            return k;
        });
        onKitsUpdate(updatedKits);
    };
    
    const handleRemoveToolFromKit = (toolSerialNumber: string) => {
        if (!selectedKit) return;
        const updatedKits = kits.map(k => {
            if (k.id === selectedKit.id) {
                return { ...k, tools: k.tools.filter(t => t.serialNumber !== toolSerialNumber) };
            }
            return k;
        });
        onKitsUpdate(updatedKits);
    };
    
    const KitDetails = ({ kit }: { kit: Kit }) => {
        return (
            <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                <div className="flex justify-between items-center">
                    <input 
                        type="text"
                        value={kit.name}
                        onChange={(e) => handleRenameKit(kit.id, e.target.value)}
                        className="text-2xl font-bold text-white bg-transparent border-0 border-b-2 border-transparent focus:border-cyan-500 focus:ring-0 p-0"
                    />
                    <button onClick={() => handleDeleteKit(kit.id)} className="flex items-center gap-2 text-sm bg-red-600 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-red-500 transition-colors">
                      <DeleteIcon className="w-4 h-4" /> Delete Kit
                    </button>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-white mb-3">Tools in Kit ({kit.tools.length})</h3>
                    <div className="bg-gray-900/50 p-3 rounded-lg max-h-60 overflow-y-auto">
                        {kit.tools.length > 0 ? (
                            <ul className="space-y-2">
                                {kit.tools.map(tool => (
                                    <li key={tool.serialNumber} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                                        <div>
                                            <p className="font-medium text-gray-200 text-sm">{tool.name}</p>
                                            <p className="text-xs text-gray-400">{tool.partNumber}</p>
                                        </div>
                                        <button onClick={() => handleRemoveToolFromKit(tool.serialNumber)} className="text-red-400 hover:text-red-300 text-xs font-semibold">Remove</button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500 italic text-center p-4">This kit is empty. Add tools below.</p>}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-white mb-3">Add Tools from Master Inventory</h3>
                    <input
                        type="text"
                        placeholder="Search master inventory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 mb-3"
                    />
                    <div className="bg-gray-900/50 p-3 rounded-lg max-h-80 overflow-y-auto">
                         {filteredMasterInventory.length > 0 ? (
                            <ul className="space-y-2">
                                {filteredMasterInventory.map(tool => (
                                    <li key={tool.serialNumber} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                                        <div>
                                            <p className="font-medium text-gray-200 text-sm">{tool.name}</p>
                                            <p className="text-xs text-gray-400">{tool.partNumber}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleAddToolToKit(tool)} 
                                            disabled={toolIdsInKit.has(tool.serialNumber)}
                                            className="text-sm bg-cyan-700 text-white font-semibold py-1 px-3 rounded-md hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                        >
                                           {toolIdsInKit.has(tool.serialNumber) ? 'Added' : 'Add'}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                         ) : <p className="text-gray-500 italic text-center p-4">No tools found.</p>}
                    </div>
                </div>
            </div>
        )
    };
    
    return (
        <div className="bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 min-h-[70vh] flex flex-col md:flex-row">
            <aside className="w-full md:w-1/3 lg:w-1/4 border-b md:border-b-0 md:border-r border-gray-700 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-white">Kits</h2>
                    <button onClick={handleCreateKit} className="flex items-center gap-2 text-sm bg-cyan-600 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-cyan-500 transition-colors">
                      <PlusIcon className="w-4 h-4" /> New Kit
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {kits.length > 0 ? (
                        <ul className="space-y-2">
                            {kits.map(k => (
                                <li key={k.id}>
                                    <button
                                        onClick={() => setSelectedKitId(k.id)}
                                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedKitId === k.id ? 'bg-cyan-800/60 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                    >
                                        <CubeIcon className="w-5 h-5 flex-shrink-0" />
                                        <span className="font-medium">{k.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <div className="text-center text-gray-500 h-full flex flex-col justify-center items-center p-4">
                            <p className="font-semibold">No Kits Found</p>
                            <p className="text-sm mt-2">Click "New Kit" to create your first predefined tool kit.</p>
                        </div>
                    )}
                </div>
            </aside>
            <main className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                {selectedKit ? (
                    <KitDetails kit={selectedKit} />
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-500">
                        <p>Select a kit to view or create a new one.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default KitsManager;
