
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import type { ComparisonResult, Tool, SuggestedSubstitution, SourcingInfo, AircraftData, SavedToolList, SavedComparison, ToastMessage, Kit, PurchasePlanItem, MaintenanceTask } from './types';
import { compareInventories, processCsvInventory, processNeededToolsCsv, getToolSourcingInfo, predictToolsForJob, analyzeMaintenanceTasks, processPurchasePlanCsv } from './services/geminiService';
import * as dataService from './services/dataService';
import InventoryCard from './components/InventoryCard';
import ShortageReportModal from './components/ShortageReportModal';
import { ToolIcon } from './components/icons/ToolIcon';
import { useSimpleRouter } from './hooks/useSimpleRouter';
import InventoryManager from './components/InventoryManager';
import ManualToolEntry, { type ManualToolEntryRef } from './components/ManualToolEntry';
import ConfirmationModal from './components/ConfirmationModal';
import DataHub from './components/DataHub';
import KitsManager from './components/KitsManager';
import SaveListModal from './components/SaveListModal';
import SaveComparisonModal from './components/SaveComparisonModal';
import LoadKitModal from './components/LoadKitModal';
import { ToastContainer } from './components/Toast';
import ComparisonSummary from './components/ComparisonSummary';
import PredictiveTooling from './components/PredictiveTooling';
import SourcingInfoModal from './components/SourcingInfoModal';
import PurchasingManager from './components/PurchasingManager';
import SaleFinder from './components/SaleFinder';
import ReportGenerationModal from './components/ReportGenerationModal';
import AddAircraftModal from './components/AddAircraftModal';
import MaintenanceEventAnalysisModal from './components/MaintenanceEventAnalysisModal';
import { CubeIcon } from './components/icons/CubeIcon';
import { DataIcon } from './components/icons/DataIcon';
import { ShoppingCartIcon } from './components/icons/ShoppingCartIcon';
import { CheckBadgeIcon } from './components/icons/CheckBadgeIcon';
import { CurrencyDollarIcon } from './components/icons/CurrencyDollarIcon';
import PDFReport from './components/PDFReport';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

const App: React.FC = () => {
  const user = 'default_user';
  const [neededTools, setNeededTools] = useState<Tool[]>([]);
  const [currentListName, setCurrentListName] = useState<string>('Custom Tool List');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [masterInventory, setMasterInventory] = useState<Tool[]>([]);
  const [aircraftData, setAircraftData] = useState<AircraftData[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [purchasePlan, setPurchasePlan] = useState<PurchasePlanItem[]>([]);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  const [activeAircraft, setActiveAircraft] = useState<AircraftData | null>(null);

  const [isMasterImporting, setIsMasterImporting] = useState<boolean>(false);
  const [isNeededImporting, setIsNeededImporting] = useState<boolean>(false);
  const [isPlanImporting, setIsPlanImporting] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const { route, navigate } = useSimpleRouter();
  const [toolsToDelete, setToolsToDelete] = useState<Tool[]>([]);
  
  // Modal States
  const [isSourcingModalOpen, setIsSourcingModalOpen] = useState(false);
  const [isSaveListModalOpen, setIsSaveListModalOpen] = useState(false);
  const [isSaveComparisonModalOpen, setIsSaveComparisonModalOpen] = useState(false);
  const [isLoadKitModalOpen, setIsLoadKitModalOpen] = useState(false);
  const [isAddAircraftModalOpen, setIsAddAircraftModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const [sourcingTool, setSourcingTool] = useState<Tool | null>(null);
  const [currentSourcingInfo, setCurrentSourcingInfo] = useState<SourcingInfo | { status: 'loading' | 'error', message?: string } | null>(null);
  
  // Data Hub State
  const [viewingComparison, setViewingComparison] = useState<SavedComparison | null>(null);
  const [analyzingEvent, setAnalyzingEvent] = useState<{ aircraftId: string, eventName: string, toolList: Tool[] } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MaintenanceTask[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // PDF Report State
  const [isReportGenerationModalOpen, setIsReportGenerationModalOpen] = useState(false);
  const reportSourcingCache = useRef<Map<string, SourcingInfo | { error: string }>>(new Map());
  const lastSourcingApiCall = useRef(0); // For rate limiting sourcing calls
  const [reportGenerationProgress, setReportGenerationProgress] = useState({ current: 0, total: 0, status: 'idle' as 'idle' | 'running' | 'complete' | 'error' });

  const manualToolEntryRef = useRef<ManualToolEntryRef>(null);
  
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    setToasts(prev => [...prev, { id: Date.now() + Math.random(), message, type }]);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // --- Initial Data Load on Mount ---
  useEffect(() => {
    const loadInitialData = async () => {
      setIsAppLoading(true);
      try {
        const [inventory, aircraftList, loadedKits, plan] = await Promise.all([
          dataService.getMasterInventory(user),
          dataService.getAircraftData(user),
          dataService.getKits(user),
          dataService.getPurchasePlan(user),
        ]);
        
        // Dynamically create aircraft profiles from the purchasing plan
        const aircraftFromPlan = new Map<string, Tool[]>();
        plan.forEach(item => {
            const aircrafts = item.aircraft.split(',').map(a => a.trim()).filter(Boolean);
            if (item.itemType !== 'Tool' && item.itemType !== 'Consumable') return;

            const tool: Tool = {
                name: item.name,
                manufacturer: item.manufacturer || 'N/A',
                model: item.partNumber,
                serialNumber: 'N/A',
                description: item.reason,
                category: item.itemType,
            };
            
            aircrafts.forEach(acName => {
                if (!aircraftFromPlan.has(acName)) {
                    aircraftFromPlan.set(acName, []);
                }
                const existingTools = aircraftFromPlan.get(acName)!;
                if (!existingTools.some(t => t.model === tool.model && t.name === tool.name)) {
                   existingTools.push(tool);
                }
            });
        });

        const newAircraftDataList: AircraftData[] = [];
        const existingAircraftNames = new Set(aircraftList.map(ac => ac.name));

        for (const [aircraftName, tools] of aircraftFromPlan.entries()) {
            const newName = `${aircraftName} (Purchasing)`;
            if (existingAircraftNames.has(newName)) continue; // Idempotency check

            newAircraftDataList.push({
                id: `ac-purchasing-${aircraftName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}`,
                name: newName,
                createdAt: new Date().toISOString(),
                toolLists: [{
                    id: `list-purchasing-${aircraftName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}`,
                    name: `Purchasing Plan Items`,
                    maintenanceEvent: 'Purchasing Plan',
                    tools: tools,
                    createdAt: new Date().toISOString()
                }],
                comparisons: []
            });
        }
        
        const combinedAircraftList = [...aircraftList, ...newAircraftDataList];

        setMasterInventory(inventory);
        setAircraftData(combinedAircraftList);
        setKits(loadedKits);
        setPurchasePlan(plan);
      } catch (error) {
        console.error("Failed to load initial data", error);
        addToast("Could not load saved data.", "error");
      } finally {
        setIsAppLoading(false);
      }
    };
    loadInitialData();
  }, [addToast]);


  // --- Data Persistence ---
  const useDebouncedSave = <T,>(data: T, saveFunction: (data: T, user: string) => Promise<void>, toastMessage: string) => {
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current || isAppLoading) {
            isInitialMount.current = false;
            return;
        }
        const handler = setTimeout(() => {
            saveFunction(data, user).catch(err => {
                addToast(toastMessage, 'error');
                console.error(err);
            });
        }, 1000); // Debounce save operations

        return () => {
            clearTimeout(handler);
        };
    }, [data, saveFunction, toastMessage]);
  };

  useDebouncedSave(masterInventory, dataService.saveMasterInventory, "Error saving master inventory.");
  useDebouncedSave(aircraftData, dataService.saveAircraftData, "Error saving aircraft data.");
  useDebouncedSave(kits, dataService.saveKits, "Error saving kits.");
  useDebouncedSave(purchasePlan, dataService.savePurchasePlan, "Error saving purchase plan.");

  // --- Handlers ---
  const handleAddTool = (toolData: any) => {
    // Use provided toolId or generate one if missing.
    const newId = toolData.toolId || `TOOL-${Date.now()}`;
    const newTool: Tool = { ...toolData, toolId: newId };
    setMasterInventory(prev => [...prev, newTool]);
  };

  const handleUpdateTool = (updatedTool: Tool) => {
    setMasterInventory(prev => prev.map(t => t.toolId === updatedTool.toolId ? updatedTool : t));
  };
  
  const handleBatchUpdateTools = (updatedTools: Tool[]) => {
      setMasterInventory(prev => {
          const updateMap = new Map(updatedTools.map(t => [t.toolId, t]));
          return prev.map(t => updateMap.get(t.toolId!) || t);
      });
      addToast(`Updated ${updatedTools.length} tools`, 'success');
  };

  const handleDeleteTool = (toolsToDelete: Tool[]) => {
    const ids = new Set(toolsToDelete.map(t => t.toolId));
    setMasterInventory(prev => prev.filter(t => !ids.has(t.toolId)));
    addToast(`Deleted ${toolsToDelete.length} tools`, 'info');
    setToolsToDelete([]);
  };

  const handleImportMaster = async (file: File) => {
    setIsMasterImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        try {
            const tools = await processCsvInventory(text);
            setMasterInventory(prev => [...prev, ...tools]);
            addToast(`Imported ${tools.length} tools`, 'success');
        } catch (err) {
            addToast("Failed to import master inventory", "error");
        } finally {
            setIsMasterImporting(false);
        }
    };
    reader.readAsText(file);
  };

  const handleNeededImport = async (file: File) => {
    setIsNeededImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        try {
            const tools = await processNeededToolsCsv(text);
            setNeededTools(tools);
            setResult(null); // Clear previous comparison
            setCurrentListName(file.name.replace(/\.[^/.]+$/, ""));
            setActiveAircraft(null);
            addToast(`Loaded ${tools.length} required tools`, 'success');
        } catch (err) {
            addToast("Failed to import required tools list", "error");
        } finally {
            setIsNeededImporting(false);
        }
    };
    reader.readAsText(file);
  };

  const handleCompare = async () => {
      if (neededTools.length === 0) {
          addToast("Please add required tools first.", 'info');
          return;
      }
      setIsComparing(true);
      try {
          const comparison = await compareInventories(masterInventory, neededTools, purchasePlan);
          setResult(comparison);
          addToast("Comparison complete", "success");
      } catch (err) {
          setError("Comparison failed");
          addToast("Comparison failed", "error");
      } finally {
          setIsComparing(false);
      }
  };

  const handleManualAddNeededTool = (tool: { name: string; manufacturer: string; model: string; }) => {
      const newTool: Tool = { ...tool, serialNumber: 'N/A' };
      setNeededTools(prev => [...prev, newTool]);
      setResult(null); // Reset comparison
  };

  const handleFindSourcing = (tool: Tool) => {
      setSourcingTool(tool);
      setCurrentSourcingInfo({ status: 'loading' });
      setIsSourcingModalOpen(true);
      
      getToolSourcingInfo(tool)
        .then(info => setCurrentSourcingInfo(info))
        .catch(err => setCurrentSourcingInfo({ status: 'error', message: err.message }));
  };

  const handleSaveList = (details: { listName: string; maintenanceEvent: string; aircraftId: string | 'new'; newAircraftName?: string }) => {
      const newList: SavedToolList = {
          id: `list-${Date.now()}`,
          name: details.listName,
          maintenanceEvent: details.maintenanceEvent,
          tools: neededTools,
          createdAt: new Date().toISOString()
      };

      if (details.aircraftId === 'new' && details.newAircraftName) {
          const newAircraft: AircraftData = {
              id: `ac-${Date.now()}`,
              name: details.newAircraftName,
              createdAt: new Date().toISOString(),
              toolLists: [newList],
              comparisons: []
          };
          setAircraftData(prev => [...prev, newAircraft]);
          setActiveAircraft(newAircraft);
          addToast(`Created aircraft "${details.newAircraftName}" and saved list.`, 'success');
      } else if (details.aircraftId !== 'new') {
          setAircraftData(prev => prev.map(ac => {
              if (ac.id === details.aircraftId) {
                  return { ...ac, toolLists: [...ac.toolLists, newList] };
              }
              return ac;
          }));
          const aircraft = aircraftData.find(ac => ac.id === details.aircraftId);
          if (aircraft) setActiveAircraft(aircraft);
          addToast("Tool list saved to aircraft.", 'success');
      }
      setCurrentListName(details.listName);
  };

  const handleSaveComparison = (details: { name: string; aircraftId: string; maintenanceEvent: string }) => {
      if (!result) return;
      
      const newComparison: SavedComparison = {
          id: `comp-${Date.now()}`,
          name: details.name,
          createdAt: new Date().toISOString(),
          result: result,
          toolListName: currentListName,
          maintenanceEvent: details.maintenanceEvent
      };
      
      setAircraftData(prev => prev.map(ac => {
          if (ac.id === details.aircraftId) {
              return { ...ac, comparisons: [...ac.comparisons, newComparison] };
          }
          return ac;
      }));
      addToast("Comparison report saved.", 'success');
  };

  const handleLoadKit = (kit: Kit) => {
      setNeededTools(kit.tools);
      setResult(null);
      setCurrentListName(kit.name);
      setActiveAircraft(null);
      addToast(`Loaded kit: ${kit.name}`, 'success');
      setIsLoadKitModalOpen(false);
  };

  const handleGenerateFullReport = async () => {
      if (!result) return;
      setIsReportGenerationModalOpen(true);
      
      const shortageTools = result.shortage;
      setReportGenerationProgress({ current: 0, total: shortageTools.length, status: 'running' });
      
      // If there are no shortages, we can skip sourcing but still generate the report
      if (shortageTools.length === 0) {
          setTimeout(() => {
              setReportGenerationProgress(prev => ({ ...prev, status: 'complete' }));
          }, 500);
          return;
      }

      // Process in batches to avoid rate limits
      for (let i = 0; i < shortageTools.length; i++) {
          const tool = shortageTools[i];
          const toolKey = tool.model; // Assuming model is unique enough for cache key
          
          if (!reportSourcingCache.current.has(toolKey)) {
              try {
                  // Rate limiting logic
                  const now = Date.now();
                  const timeSinceLastCall = now - lastSourcingApiCall.current;
                  if (timeSinceLastCall < 2000) { // 2 seconds between calls
                      await delay(2000 - timeSinceLastCall);
                  }
                  
                  lastSourcingApiCall.current = Date.now();
                  const info = await getToolSourcingInfo(tool);
                  reportSourcingCache.current.set(toolKey, info);
              } catch (error) {
                  console.error(`Failed to source ${tool.name}`, error);
                  reportSourcingCache.current.set(toolKey, { error: 'Failed to fetch sourcing info.' });
              }
          }
          
          setReportGenerationProgress(prev => ({ ...prev, current: i + 1 }));
      }
      
      setReportGenerationProgress(prev => ({ ...prev, status: 'complete' }));
  };

  const handleImportPlan = async (file: File) => {
      setIsPlanImporting(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
          const text = e.target?.result as string;
          try {
              const plan = await processPurchasePlanCsv(text);
              setPurchasePlan(plan);
              addToast(`Imported purchase plan with ${plan.length} items`, 'success');
          } catch (err) {
              addToast("Failed to import purchase plan", "error");
          } finally {
              setIsPlanImporting(false);
          }
      };
      reader.readAsText(file);
  };

  // Handle moving tools between comparison lists (Available, On Order, Shortage)
  const handleMoveTool = (tool: Tool, sourceStatus: string, targetStatus: string) => {
      if (!result) return;

      setResult(prevResult => {
          if (!prevResult) return null;

          // Map status strings to result keys
          const statusKeyMap: Record<string, keyof ComparisonResult> = {
              'available': 'available',
              'onOrder': 'onOrder',
              'shortage': 'shortage'
          };

          const sourceKey = statusKeyMap[sourceStatus];
          const targetKey = statusKeyMap[targetStatus];

          if (!sourceKey || !targetKey) return prevResult;

          // Remove from source
          // Using model and name as a unique identifier for filter since serial numbers can be N/A or duplicated in needed lists
          const sourceList = (prevResult[sourceKey] as Tool[]).filter(t => !(t.model === tool.model && t.name === tool.name));
          
          // Add to target
          const targetList = [...(prevResult[targetKey] as Tool[]), tool];

          return {
              ...prevResult,
              [sourceKey]: sourceList,
              [targetKey]: targetList
          };
      });
      
      addToast(`Moved ${tool.name} to ${targetStatus}`, 'success');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 p-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
           <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg">
             <ToolIcon className="w-6 h-6 text-white" />
           </div>
           <div>
               <h1 className="text-xl font-bold text-white tracking-tight">Tool Inventory System</h1>
               <p className="text-xs text-gray-400 font-medium">Enterprise Edition</p>
           </div>
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button onClick={() => navigate('checker')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${route === 'checker' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
              <CheckBadgeIcon className="w-5 h-5" /> Checker
            </button>
            <button onClick={() => navigate('manager')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${route === 'manager' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
               <ToolIcon className="w-5 h-5" /> Manager
            </button>
             <button onClick={() => navigate('datahub')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${route === 'datahub' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
               <DataIcon className="w-5 h-5" /> Data Hub
            </button>
             <button onClick={() => navigate('kits')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${route === 'kits' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
               <CubeIcon className="w-5 h-5" /> Kits
            </button>
            <button onClick={() => navigate('purchasing')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${route === 'purchasing' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
               <ShoppingCartIcon className="w-5 h-5" /> Purchasing
            </button>
            <button onClick={() => navigate('sale-finder')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${route === 'sale-finder' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
               <CurrencyDollarIcon className="w-5 h-5" /> Sale Finder
            </button>
        </div>
      </nav>

      <main className="p-6 max-w-8xl mx-auto">
        {route === 'checker' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
             <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                <InventoryCard 
                    title={currentListName || "Needed Tools"} 
                    tools={neededTools} 
                    status="master" 
                    onImport={handleNeededImport}
                    isImporting={isNeededImporting}
                    onSave={() => setIsSaveListModalOpen(true)}
                    onLoadKit={() => setIsLoadKitModalOpen(true)}
                    isNeededToolsList={true}
                    onFocusManualEntry={() => manualToolEntryRef.current?.scrollIntoView()}
                />
                 <div className="flex-shrink-0">
                     <ManualToolEntry ref={manualToolEntryRef} onAddTool={handleManualAddNeededTool} />
                 </div>
                 <div className="flex-shrink-0">
                    <PredictiveTooling 
                        onToolsPredicted={(tools) => {
                            setNeededTools(prev => [...prev, ...tools]);
                            setResult(null);
                        }}
                        addToast={addToast}
                    />
                 </div>
             </div>
             
             <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
                <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Comparison Dashboard</h2>
                        <p className="text-gray-400 text-sm">Analyze availability against master inventory</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleCompare} 
                            disabled={isComparing || neededTools.length === 0}
                            className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-500 shadow-lg shadow-cyan-900/50 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                        >
                            {isComparing ? 'Analyzing...' : 'Run Comparison'}
                        </button>
                        {result && (
                            <button 
                                onClick={() => setIsSaveComparisonModalOpen(true)} 
                                className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-900/50 transition-all"
                            >
                                Save Report
                            </button>
                        )}
                    </div>
                </div>

                {result && (
                    <div className="flex-shrink-0">
                        <ComparisonSummary 
                            totalNeeded={neededTools.length}
                            availableCount={result.available.length}
                            onOrderCount={result.onOrder.length}
                            shortageCount={result.shortage.length}
                            onGenerateFullReport={handleGenerateFullReport}
                        />
                    </div>
                )}

                <div className="flex-grow overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
                    <div className="h-full overflow-hidden">
                        <InventoryCard 
                            title="Available" 
                            tools={result?.available || []} 
                            status="available" 
                            onToolDrop={handleMoveTool}
                        />
                    </div>
                     <div className="h-full overflow-hidden">
                        <InventoryCard 
                            title="On Order / In Plan" 
                            tools={result?.onOrder || []} 
                            status="onOrder" 
                            onFindSourcing={handleFindSourcing}
                            onToolDrop={handleMoveTool}
                        />
                    </div>
                     <div className="h-full overflow-hidden">
                        <InventoryCard 
                            title="Shortages" 
                            tools={result?.shortage || []} 
                            status="shortage" 
                            onExport={() => setIsReportModalOpen(true)} 
                            onFindSourcing={handleFindSourcing}
                            onToolDrop={handleMoveTool}
                        />
                    </div>
                </div>
             </div>
           </div>
        )}

        {route === 'manager' && (
            <InventoryManager 
                tools={masterInventory} 
                onAddTool={handleAddTool}
                onUpdateTool={handleUpdateTool}
                onBatchUpdateTools={handleBatchUpdateTools}
                onDeleteTool={(tools) => {
                    setToolsToDelete(tools);
                }}
                addToast={addToast}
                onImportMaster={handleImportMaster}
                isImportingMaster={isMasterImporting}
            />
        )}

        {route === 'datahub' && (
            <DataHub 
                aircraftData={aircraftData}
                onAddAircraft={() => setIsAddAircraftModalOpen(true)}
                onUpdateAircraft={(id, name) => setAircraftData(prev => prev.map(ac => ac.id === id ? {...ac, name} : ac))}
                onDeleteAircraft={(id) => {
                    if(window.confirm('Delete this aircraft profile and all data?')) {
                        setAircraftData(prev => prev.filter(ac => ac.id !== id));
                    }
                }}
                onLoadToolList={(acId, listId) => {
                    const aircraft = aircraftData.find(ac => ac.id === acId);
                    const list = aircraft?.toolLists.find(l => l.id === listId);
                    if (list && aircraft) {
                        setNeededTools(list.tools);
                        setCurrentListName(list.name);
                        setActiveAircraft(aircraft);
                        setResult(null);
                        navigate('checker');
                        addToast(`Loaded list: ${list.name} for ${aircraft.name}`, 'success');
                    }
                }}
                onDeleteToolList={(acId, listId) => {
                    if(window.confirm('Delete this tool list?')) {
                        setAircraftData(prev => prev.map(ac => ac.id === acId ? {...ac, toolLists: ac.toolLists.filter(l => l.id !== listId)} : ac));
                    }
                }}
                onViewComparison={(acId, compId) => {
                    const aircraft = aircraftData.find(ac => ac.id === acId);
                    const comp = aircraft?.comparisons.find(c => c.id === compId);
                    if(comp && aircraft) {
                        setNeededTools([]); // Or maybe load the original list if stored
                        setResult(comp.result);
                        setCurrentListName(comp.toolListName || comp.name);
                        setActiveAircraft(aircraft);
                        navigate('checker');
                        addToast(`Viewing report: ${comp.name}`, 'success');
                    }
                }}
                onDeleteComparison={(acId, compId) => {
                     if(window.confirm('Delete this report?')) {
                        setAircraftData(prev => prev.map(ac => ac.id === acId ? {...ac, comparisons: ac.comparisons.filter(c => c.id !== compId)} : ac));
                    }
                }}
                onAnalyzeEvent={(aircraftId, eventName) => {
                    const aircraft = aircraftData.find(ac => ac.id === aircraftId);
                    if (aircraft) {
                        const lists = aircraft.toolLists.filter(l => l.maintenanceEvent === eventName);
                        const allTools = lists.flatMap(l => l.tools);
                        setAnalyzingEvent({ aircraftId, eventName, toolList: allTools });
                        setIsAnalysisModalOpen(true);
                        
                        // Trigger analysis
                        analyzeMaintenanceTasks(eventName, allTools)
                            .then(tasks => setAnalysisResult(tasks))
                            .catch(err => {
                                console.error(err);
                                addToast("Failed to analyze maintenance event", "error");
                                setAnalysisResult([]);
                            });
                    }
                }}
            />
        )}

        {route === 'kits' && (
            <KitsManager 
                kits={kits} 
                masterInventory={masterInventory} 
                onKitsUpdate={setKits} 
                addToast={addToast}
            />
        )}

        {route === 'purchasing' && (
             <PurchasingManager 
                purchasePlan={purchasePlan}
                masterInventory={masterInventory}
                onAddTool={handleAddTool}
                addToast={addToast}
                onImportPlan={handleImportPlan}
                isImportingPlan={isPlanImporting}
             />
        )}

        {route === 'sale-finder' && (
            <SaleFinder
                purchasePlan={purchasePlan}
                aircraftData={aircraftData}
                addToast={addToast}
            />
        )}
      </main>

      {/* Modals */}
      <ShortageReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        tools={result?.shortage || []} 
      />
      <SourcingInfoModal 
        isOpen={isSourcingModalOpen}
        onClose={() => setIsSourcingModalOpen(false)}
        tool={sourcingTool}
        sourcingInfo={currentSourcingInfo}
      />
      <SaveListModal
        isOpen={isSaveListModalOpen}
        onClose={() => setIsSaveListModalOpen(false)}
        onSave={handleSaveList}
        aircrafts={aircraftData}
      />
      <SaveComparisonModal
        isOpen={isSaveComparisonModalOpen}
        onClose={() => setIsSaveComparisonModalOpen(false)}
        onSave={handleSaveComparison}
        aircrafts={aircraftData}
      />
      <LoadKitModal
        isOpen={isLoadKitModalOpen}
        onClose={() => setIsLoadKitModalOpen(false)}
        kits={kits}
        onLoadKit={handleLoadKit}
      />
      <AddAircraftModal
        isOpen={isAddAircraftModalOpen}
        onClose={() => setIsAddAircraftModalOpen(false)}
        onAdd={(name) => {
            const newAircraft: AircraftData = {
                id: `ac-${Date.now()}`,
                name,
                createdAt: new Date().toISOString(),
                toolLists: [],
                comparisons: []
            };
            setAircraftData(prev => [...prev, newAircraft]);
            addToast(`Added aircraft "${name}"`, 'success');
        }}
      />
      <ReportGenerationModal
        isOpen={isReportGenerationModalOpen}
        onClose={() => setIsReportGenerationModalOpen(false)}
        result={result}
        sourcingData={reportSourcingCache.current}
        progress={reportGenerationProgress}
        aircraftName={activeAircraft?.name || 'General Inventory'}
        toolingListName={currentListName}
      />
      <MaintenanceEventAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => { setIsAnalysisModalOpen(false); setAnalysisResult(null); }}
        eventName={analyzingEvent?.eventName}
        isLoading={!analysisResult}
        tasks={analysisResult}
      />
       <ConfirmationModal
          isOpen={toolsToDelete.length > 0}
          onClose={() => setToolsToDelete([])}
          onConfirm={() => handleDeleteTool(toolsToDelete)}
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${toolsToDelete.length} tools from the Master Inventory? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
      />
    </div>
  );
};

export default App;
