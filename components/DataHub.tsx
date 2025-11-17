import React, { useState, useMemo, useEffect } from 'react';
import type { AircraftData, SavedToolList, SavedComparison } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { BrainIcon } from './icons/BrainIcon'; // Assuming you create this icon

// Icons
const FolderIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>;
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>;
const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const PencilIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>;


interface DataHubProps {
  aircraftData: AircraftData[];
  onAddAircraft: () => void;
  onUpdateAircraft: (id: string, newName: string) => void;
  onDeleteAircraft: (id: string) => void;
  onLoadToolList: (aircraftId: string, listId: string) => void;
  onDeleteToolList: (aircraftId: string, listId: string) => void;
  onViewComparison: (aircraftId: string, comparisonId: string) => void;
  onDeleteComparison: (aircraftId: string, comparisonId: string) => void;
  onAnalyzeEvent: (aircraftId: string, eventName: string) => void;
}

interface GroupedData {
  toolLists: SavedToolList[];
  comparisons: SavedComparison[];
}

interface MaintenanceEventCardProps {
  eventName: string;
  data: GroupedData;
  aircraftId: string;
  onLoadToolList: (aircraftId: string, listId: string) => void;
  onDeleteToolList: (aircraftId: string, listId: string) => void;
  onViewComparison: (aircraftId: string, comparisonId: string) => void;
  onDeleteComparison: (aircraftId: string, comparisonId: string) => void;
  onAnalyzeEvent: (aircraftId: string, eventName: string) => void;
}

const MaintenanceEventCard: React.FC<MaintenanceEventCardProps> = (props) => {
    const { eventName, data, aircraftId, onLoadToolList, onDeleteToolList, onViewComparison, onDeleteComparison, onAnalyzeEvent } = props;
    const [isExpanded, setIsExpanded] = useState(true);

    const canAnalyze = data.toolLists.length > 0;

    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700">
            <button 
                className="w-full flex justify-between items-center p-4 text-left"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
            >
                <h3 className="text-lg font-semibold text-cyan-300">{eventName}</h3>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                        {data.toolLists.length} list{data.toolLists.length !== 1 ? 's' : ''}, {data.comparisons.length} report{data.comparisons.length !== 1 ? 's' : ''}
                    </span>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isExpanded && (
                 <div className="px-4 pb-4 animate-fade-in space-y-4">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => onAnalyzeEvent(aircraftId, eventName)}
                        disabled={!canAnalyze}
                        title={canAnalyze ? "Analyze maintenance tasks for this event" : "Add a tool list to enable analysis"}
                        className="flex items-center gap-2 text-sm bg-purple-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-purple-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                          <BrainIcon className="w-4 h-4" /> Analyze Tasks
                      </button>
                    </div>

                    {data.toolLists.length > 0 && (
                        <div>
                            <h4 className="text-md font-semibold text-gray-300 mb-2 border-b border-gray-600 pb-2">Tooling Lists</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {data.toolLists.map(list => (
                                    <div key={list.id} className="bg-gray-800 p-3 rounded-lg flex flex-col justify-between">
                                        <div>
                                            <p className="font-medium text-gray-200">{list.name}</p>
                                            <p className="text-sm text-gray-400">{list.tools.length} tools</p>
                                            <p className="text-xs text-gray-500">Created: {new Date(list.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button onClick={() => onLoadToolList(aircraftId, list.id)} className="flex-1 text-sm bg-cyan-700 text-white font-semibold py-1 px-3 rounded-md hover:bg-cyan-600 transition-colors">Load</button>
                                            <button onClick={() => onDeleteToolList(aircraftId, list.id)} className="text-red-500 hover:text-red-400 p-1 rounded-md hover:bg-red-900/50"><DeleteIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                    {data.comparisons.length > 0 && (
                        <div>
                            <h4 className="text-md font-semibold text-gray-300 mb-2 border-b border-gray-600 pb-2">Comparison Reports</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {data.comparisons.map(comp => (
                                    <div key={comp.id} className="bg-gray-800 p-3 rounded-lg flex flex-col justify-between">
                                        <div>
                                            <p className="font-medium text-gray-200">{comp.name}</p>
                                            <p className="text-xs text-gray-500">Created: {new Date(comp.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button onClick={() => onViewComparison(aircraftId, comp.id)} className="flex-1 text-sm bg-indigo-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-indigo-500 transition-colors">View Report</button>
                                            <button onClick={() => onDeleteComparison(aircraftId, comp.id)} className="text-red-500 hover:text-red-400 p-1 rounded-md hover:bg-red-900/50"><DeleteIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


const DataHub: React.FC<DataHubProps> = (props) => {
    const { aircraftData, onAddAircraft, onUpdateAircraft, onDeleteAircraft } = props;
    const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(aircraftData.length > 0 ? aircraftData[0].id : null);
    const [editingAircraftId, setEditingAircraftId] = useState<string | null>(null);
    const [tempAircraftName, setTempAircraftName] = useState("");

    useEffect(() => {
        if (!selectedAircraftId && aircraftData.length > 0) {
            setSelectedAircraftId(aircraftData[0].id);
        }
    }, [aircraftData, selectedAircraftId]);
    
    const selectedAircraft = useMemo(() => {
        return aircraftData.find(p => p.id === selectedAircraftId);
    }, [selectedAircraftId, aircraftData]);
    
    const groupedData = useMemo(() => {
        if (!selectedAircraft) return [];
        const events: Record<string, GroupedData> = {};

        selectedAircraft.toolLists.forEach(list => {
            const eventName = list.maintenanceEvent || 'Uncategorized Lists';
            if (!events[eventName]) events[eventName] = { toolLists: [], comparisons: [] };
            events[eventName].toolLists.push(list);
        });

        selectedAircraft.comparisons.forEach(comp => {
            const eventName = comp.maintenanceEvent || 'Uncategorized Reports';
            if (!events[eventName]) events[eventName] = { toolLists: [], comparisons: [] };
            events[eventName].comparisons.push(comp);
        });

        return Object.entries(events).sort((a, b) => a[0].localeCompare(b[0]));
    }, [selectedAircraft]);

    const handleStartEdit = (aircraft: AircraftData) => {
        setEditingAircraftId(aircraft.id);
        setTempAircraftName(aircraft.name);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAircraftId) {
            onUpdateAircraft(editingAircraftId, tempAircraftName);
        }
        setEditingAircraftId(null);
    };

    const AircraftDetails: React.FC<{ aircraft: AircraftData }> = ({ aircraft }) => (
        <div className="flex-grow p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold text-white">{aircraft.name}</h2>
                <button onClick={() => onDeleteAircraft(aircraft.id)} className="text-gray-500 hover:text-red-400 transition-colors" title="Delete Aircraft"><DeleteIcon className="w-5 h-5"/></button>
            </div>
            <p className="text-gray-400 -mt-4 mb-6">Created on {new Date(aircraft.createdAt).toLocaleDateString()}</p>

            {groupedData.length > 0 ? (
                groupedData.map(([eventName, data]) => (
                    <MaintenanceEventCard 
                        key={eventName}
                        eventName={eventName}
                        data={data}
                        aircraftId={aircraft.id}
                        {...props}
                    />
                ))
            ) : (
                <div className="text-center text-gray-500 p-8 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="font-semibold">Aircraft Profile Empty</p>
                    <p className="text-sm mt-2">Save a tool list or comparison report to this aircraft to begin.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 min-h-[70vh] flex flex-col md:flex-row">
            <aside className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-gray-700 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-white">Aircraft</h2>
                     <button onClick={onAddAircraft} className="flex items-center gap-1 text-sm bg-cyan-600 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-cyan-500 transition-colors">
                      <PlusIcon className="w-4 h-4" /> New
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    {aircraftData.length > 0 ? (
                        <ul className="space-y-2">
                            {aircraftData.map(ac => (
                                <li key={ac.id}>
                                    {editingAircraftId === ac.id ? (
                                        <form onSubmit={handleSaveEdit} className="p-2 bg-gray-700 rounded-lg">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={tempAircraftName}
                                                onChange={(e) => setTempAircraftName(e.target.value)}
                                                onBlur={handleSaveEdit}
                                                className="w-full bg-gray-800 text-white p-1 rounded"
                                            />
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedAircraftId(ac.id)}
                                            className={`w-full text-left p-3 rounded-lg flex items-center justify-between gap-3 transition-colors ${selectedAircraftId === ac.id ? 'bg-cyan-800/60 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <FolderIcon className="w-5 h-5 flex-shrink-0" />
                                                <span className="font-medium truncate">{ac.name}</span>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleStartEdit(ac);}} className="text-gray-400 hover:text-white flex-shrink-0 opacity-25 hover:opacity-100"><PencilIcon className="w-4 h-4"/></button>
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <div className="text-center text-gray-500 h-full flex flex-col justify-center items-center p-4">
                            <p className="font-semibold">No Aircraft Found</p>
                            <p className="text-sm mt-2">Click "New" to create your first aircraft profile.</p>
                        </div>
                    )}
                </div>
            </aside>
            <main className="w-full flex-1">
                {selectedAircraft ? (
                    <AircraftDetails aircraft={selectedAircraft} />
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-500 p-8 text-center">
                        <p>Select an aircraft to view its data, or add a new one.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DataHub;
