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
import ReportGenerationModal from './components/ReportGenerationModal';
import AddAircraftModal from './components/AddAircraftModal';
import MaintenanceEventAnalysisModal from './components/MaintenanceEventAnalysisModal';
import { CubeIcon } from './components/icons/CubeIcon';
import { DataIcon } from './components/icons/DataIcon';
import { ShoppingCartIcon } from './components/icons/ShoppingCartIcon';
import { CheckBadgeIcon } from './components/icons/CheckBadgeIcon';
import PDFReport from './components/PDFReport';

const App: React.FC = () => {
  const user = 'default_user';
  const [neededTools, setNeededTools] = useState<Tool[]>([]);
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
                partNumber: item.partNumber,
                serialNumber: 'N/A',
                description: item.reason,
                category: item.itemType,
            };
            
            aircrafts.forEach(acName => {
                if (!aircraftFromPlan.has(acName)) {
                    aircraftFromPlan.set(acName, []);
                }
                const existingTools = aircraftFromPlan.get(acName)!;
                if (!existingTools.some(t => t.partNumber === tool.partNumber && t.name === tool.name)) {
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
    }, [data, saveFunction, toastMessage, isAppLoading]);
  };
  
  useDebouncedSave(aircraftData, dataService.saveAircraftData, 'Failed to save aircraft data.');
  useDebouncedSave(kits, dataService.saveKits, 'Failed to save kit data.');
  useDebouncedSave(purchasePlan, dataService.savePurchasePlan, 'Failed to save purchasing plan.');

  // --- Master Inventory CRUD Handlers ---
  const handleAddTool = (newTool: Omit<Tool, 'serialNumber'> & { serialNumber?: string }) => {
    const toolToAdd: Tool = {
        toolId: `BJC-${(masterInventory.length + 1).toString().padStart(3, '0')}`,
        description: newTool.description || 'N/A',
        model: newTool.model || 'N/A',
        calibrationStatus: newTool.calibrationStatus || 'N/A',
        ...newTool,
        serialNumber: newTool.serialNumber || 'N/A',
    };

    if (toolToAdd.serialNumber !== 'N/A' && masterInventory.some(t => t.serialNumber === toolToAdd.serialNumber)) {
        addToast(`Error: A tool with serial number "${toolToAdd.serialNumber}" already exists.`, 'error');
        return;
    }

    const updatedInventory = [...masterInventory, toolToAdd];
    setMasterInventory(updatedInventory);
    dataService.saveMasterInventory(updatedInventory, user)
        .then(() => addToast(`Added new tool: ${newTool.name}`, 'success'))
        .catch(err => {
            addToast('Failed to save new tool.', 'error');
            setMasterInventory(masterInventory); // Revert state on error
            console.error(err);
        });
  };

  const handleUpdateTool = (updatedTool: Tool) => {
    const updatedInventory = masterInventory.map(t => (t.toolId === updatedTool.toolId && t.serialNumber === updatedTool.serialNumber) ? updatedTool : t);
    setMasterInventory(updatedInventory);
    dataService.saveMasterInventory(updatedInventory, user)
        .then(() => addToast(`Updated tool: ${updatedTool.name}`, 'success'))
        .catch(err => {
            addToast('Failed to update tool.', 'error');
            setMasterInventory(masterInventory);
            console.error(err);
        });
  };

  const handleDeleteTools = (tools: Tool[]) => {
    setToolsToDelete(tools);
  };
  
  const handleConfirmDelete = () => {
    if (toolsToDelete.length === 0) return;

    const idsToDelete = new Set(toolsToDelete.map(t => t.serialNumber));
    const updatedInventory = masterInventory.filter(t => !idsToDelete.has(t.serialNumber));
    
    setMasterInventory(updatedInventory);
    dataService.saveMasterInventory(updatedInventory, user)
        .then(() => addToast(`Deleted ${toolsToDelete.length} tool(s).`, 'info'))
        .catch(err => {
            addToast('Failed to delete tools.', 'error');
            setMasterInventory(masterInventory); // Revert
            console.error(err);
        });
    setToolsToDelete([]);
  };

  const handleAddManualTool = (tool: { name: string; manufacturer: string; partNumber: string; }) => {
    const newTool: Tool = {
        ...tool,
        serialNumber: 'N/A'
    };
    setNeededTools(prev => [...prev, newTool]);
  };

  const handlePredictTools = (predictedTools: Tool[]) => {
    const toolsWithSerial = predictedTools.map(t => ({...t, serialNumber: 'N/A'}));
    setNeededTools(toolsWithSerial);
    setActiveAircraft(null);
  };

  const handleCompare = async () => {
    if (neededTools.length === 0) {
      addToast('Please add some "Needed Tools" before comparing.', 'info');
      return;
    }
    setIsComparing(true);
    setError(null);
    try {
      const comparisonResult = await compareInventories(masterInventory, neededTools, purchasePlan);
      setResult(comparisonResult);
      addToast('Comparison complete!', 'success');
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred during comparison.');
      addToast(e.message || 'An unknown error occurred during comparison.', 'error');
    } finally {
      setIsComparing(false);
    }
  };

  const handleFileImport = (processor: (content: string) => Promise<Tool[]>, setter: React.Dispatch<React.SetStateAction<Tool[]>>, importingSetter: React.Dispatch<React.SetStateAction<boolean>>, successMessage: string, clearActiveAircraft?: boolean) => async (file: File) => {
    importingSetter(true);
    setError(null);
    try {
      const content = await file.text();
      const processedTools = await processor(content);
      setter(processedTools);
      addToast(successMessage, 'success');
      if (clearActiveAircraft) {
        setActiveAircraft(null);
      }
    } catch (e: any) {
      setError(e.message);
      addToast(e.message, 'error');
    } finally {
      importingSetter(false);
    }
  };
  
  const handleMasterImport = handleFileImport(processCsvInventory, setMasterInventory, setIsMasterImporting, 'Master inventory updated successfully!');
  const handleNeededImport = handleFileImport(processNeededToolsCsv, setNeededTools, setIsNeededImporting, 'Needed tools list loaded successfully!', true);

  const handlePlanImport = async (file: File) => {
    setIsPlanImporting(true);
    setError(null);
    try {
      const content = await file.text();
      const newPlan = await processPurchasePlanCsv(content);
      setPurchasePlan(newPlan);
      addToast(`Purchase plan successfully updated with ${newPlan.length} items.`, 'success');
    } catch (e: any) {
      const errorMessage = e.message || 'An unknown error occurred during import.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setIsPlanImporting(false);
    }
  };

  const handleFindSourcing = async (tool: Tool) => {
    setIsSourcingModalOpen(true);
    setSourcingTool(tool);
    setCurrentSourcingInfo({ status: 'loading' });
    try {
        const info = await getToolSourcingInfo(tool);
        setCurrentSourcingInfo(info);
    } catch (e: any) {
        setCurrentSourcingInfo({ status: 'error', message: e.message });
    }
  };

  const handleSaveList = (details: { listName: string; maintenanceEvent: string; aircraftId: string | 'new'; newAircraftName?: string; }) => {
    let targetAircraftId = details.aircraftId;

    if (details.aircraftId === 'new' && details.newAircraftName) {
        const newAircraft: AircraftData = {
            id: `ac-${Date.now()}`,
            name: details.newAircraftName,
            createdAt: new Date().toISOString(),
            toolLists: [],
            comparisons: []
        };
        targetAircraftId = newAircraft.id;
        setAircraftData(prev => [...prev, newAircraft]);
    }

    const newList: SavedToolList = {
        id: `list-${Date.now()}`,
        name: details.listName,
        maintenanceEvent: details.maintenanceEvent,
        tools: neededTools,
        createdAt: new Date().toISOString()
    };
    
    setAircraftData(prev => prev.map(ac => 
        ac.id === targetAircraftId ? { ...ac, toolLists: [...ac.toolLists, newList] } : ac
    ));

    addToast(`Saved list "${details.listName}"`, 'success');
    setIsSaveListModalOpen(false);
  };
  
  const handleSaveComparison = (details: { name: string; aircraftId: string; maintenanceEvent: string }) => {
    if (!result) return;
    
    const newComparison: SavedComparison = {
      id: `comp-${Date.now()}`,
      name: details.name,
      createdAt: new Date().toISOString(),
      result: result,
      toolListName: 'N/A', // Could be enhanced to track
      maintenanceEvent: details.maintenanceEvent,
    };

    setAircraftData(prev => prev.map(ac => 
      ac.id === details.aircraftId ? { ...ac, comparisons: [...ac.comparisons, newComparison] } : ac
    ));

    addToast(`Saved comparison "${details.name}"`, 'success');
    setIsSaveComparisonModalOpen(false);
  };

  const handleLoadKit = (kit: Kit) => {
    setNeededTools(kit.tools);
    addToast(`Loaded kit "${kit.name}"`, 'success');
    setIsLoadKitModalOpen(false);
    setActiveAircraft(null);
  };

  // --- Data Hub Handlers ---
  const handleAddAircraft = (name: string) => {
    const newAircraft: AircraftData = {
      id: `ac-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      toolLists: [],
      comparisons: [],
    };
    setAircraftData(prev => [...prev, newAircraft]);
    addToast(`Added new aircraft: ${name}`, 'success');
    setIsAddAircraftModalOpen(false);
  };

  const handleUpdateAircraft = (id: string, newName: string) => {
    setAircraftData(prev => prev.map(ac => ac.id === id ? { ...ac, name: newName } : ac));
    addToast(`Updated aircraft name.`, 'success');
  };

  const handleDeleteAircraft = (id: string) => {
    if (window.confirm("Are you sure you want to delete this aircraft and all its associated lists and reports? This cannot be undone.")) {
        setAircraftData(prev => prev.filter(ac => ac.id !== id));
        addToast('Aircraft deleted.', 'info');
    }
  };

  const handleLoadToolList = (aircraftId: string, listId: string) => {
    const aircraft = aircraftData.find(ac => ac.id === aircraftId);
    const list = aircraft?.toolLists.find(l => l.id === listId);
    if (list && aircraft) {
      setNeededTools(list.tools);
      setActiveAircraft(aircraft);
      navigate('checker');
      addToast(`Loaded list "${list.name}" from "${aircraft.name}"`, 'success');
    }
  };
  
  const handleDeleteToolList = (aircraftId: string, listId: string) => {
     if (window.confirm("Are you sure you want to delete this tool list?")) {
        setAircraftData(prev => prev.map(ac => 
            ac.id === aircraftId ? { ...ac, toolLists: ac.toolLists.filter(l => l.id !== listId) } : ac
        ));
        addToast('Tool list deleted.', 'info');
    }
  };

  const handleViewComparison = (aircraftId: string, comparisonId: string) => {
    const aircraft = aircraftData.find(ac => ac.id === aircraftId);
    const comparison = aircraft?.comparisons.find(c => c.id === comparisonId);
    if (comparison && aircraft) {
      setResult(comparison.result);
      setNeededTools(Object.values(comparison.result).flat().filter(t => typeof t !== 'string') as Tool[]);
      setActiveAircraft(aircraft);
      navigate('checker');
      addToast(`Viewing report "${comparison.name}"`, 'success');
    }
  };

  const handleDeleteComparison = (aircraftId: string, comparisonId: string) => {
    if (window.confirm("Are you sure you want to delete this comparison report?")) {
        setAircraftData(prev => prev.map(ac => 
            ac.id === aircraftId ? { ...ac, comparisons: ac.comparisons.filter(c => c.id !== comparisonId) } : ac
        ));
        addToast('Comparison report deleted.', 'info');
    }
  };
  
  const handleAnalyzeEvent = async (aircraftId: string, eventName: string) => {
    const aircraft = aircraftData.find(ac => ac.id === aircraftId);
    const toolList = aircraft?.toolLists.find(l => l.maintenanceEvent === eventName);
    if (!toolList) {
      addToast(`Could not find a tool list for event: ${eventName}`, 'error');
      return;
    }

    setIsAnalysisModalOpen(true);
    setIsAnalyzing(true);
    setAnalyzingEvent({ aircraftId, eventName, toolList: toolList.tools });

    try {
      const result = await analyzeMaintenanceTasks(eventName, toolList.tools);
      setAnalysisResult(result);
    } catch (e: any) {
      addToast(e.message, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPdf = () => {
    if (!result) return;
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
        reportWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <title>Tooling Report</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @media print {
                        @page { margin: 0.5in; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body class="bg-white">
                <div id="report-root"></div>
            </body>
            </html>
        `);
        reportWindow.document.close();

        const reportRootEl = reportWindow.document.getElementById('report-root');
        if (reportRootEl) {
            const root = ReactDOM.createRoot(reportRootEl);
            root.render(<PDFReport result={result} sourcingData={new Map()} isQuickReport={true} aircraftName={activeAircraft?.name} />);
            
            setTimeout(() => {
                reportWindow.focus();
                reportWindow.print();
            }, 1000);
        }
    }
  };
  
  const navItems = [
    { id: 'checker', label: 'Checker', icon: CheckBadgeIcon },
    { id: 'manager', label: 'Manager', icon: ToolIcon },
    { id: 'datahub', label: 'Data Hub', icon: DataIcon },
    { id: 'kits', label: 'Kits', icon: CubeIcon },
    { id: 'purchasing', label: 'Purchasing', icon: ShoppingCartIcon },
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      {/* Modals */}
      <ShortageReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} tools={result?.shortage || []} />
      <ConfirmationModal isOpen={toolsToDelete.length > 0} onClose={() => setToolsToDelete([])} onConfirm={handleConfirmDelete} title="Confirm Deletion" message={<>Are you sure you want to delete {toolsToDelete.length} tool(s)? This action cannot be undone.</>} />
      <SourcingInfoModal isOpen={isSourcingModalOpen} onClose={() => setIsSourcingModalOpen(false)} tool={sourcingTool} sourcingInfo={currentSourcingInfo} />
      <SaveListModal isOpen={isSaveListModalOpen} onClose={() => setIsSaveListModalOpen(false)} onSave={handleSaveList} aircrafts={aircraftData} />
      <SaveComparisonModal isOpen={isSaveComparisonModalOpen} onClose={() => setIsSaveComparisonModalOpen(false)} onSave={handleSaveComparison} aircrafts={aircraftData} defaultMaintenanceEvent={neededTools.length > 0 ? "New Event" : ""} />
      <LoadKitModal isOpen={isLoadKitModalOpen} onClose={() => setIsLoadKitModalOpen(false)} kits={kits} onLoadKit={handleLoadKit} />
      <AddAircraftModal isOpen={isAddAircraftModalOpen} onClose={() => setIsAddAircraftModalOpen(false)} onAdd={handleAddAircraft} />
      <MaintenanceEventAnalysisModal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} eventName={analyzingEvent?.eventName} isLoading={isAnalyzing} tasks={analysisResult} />
      <ReportGenerationModal isOpen={isReportGenerationModalOpen} onClose={() => setIsReportGenerationModalOpen(false)} result={result} sourcingData={reportSourcingCache.current} progress={reportGenerationProgress} aircraftName={activeAircraft?.name} />

      <div className="container mx-auto px-4 py-6">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <ToolIcon className="w-10 h-10 text-cyan-400" />
            <h1 className="text-3xl font-extrabold text-white">Tool Inventory System</h1>
          </div>
        </header>

        <nav className="mb-6 bg-gray-800/50 p-2 rounded-lg flex flex-wrap items-center justify-center gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id as any)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${route === item.id ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        
        <main>
          {route === 'checker' && (
            <div className='space-y-6'>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PredictiveTooling onToolsPredicted={handlePredictTools} addToast={addToast} />
                  <ManualToolEntry ref={manualToolEntryRef} onAddTool={handleAddManualTool} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InventoryCard
                  title="Needed Tools"
                  tools={neededTools}
                  status="master"
                  isNeededToolsList
                  onImport={handleNeededImport}
                  isImporting={isNeededImporting}
                  onSave={() => setIsSaveListModalOpen(true)}
                  onLoadKit={() => setIsLoadKitModalOpen(true)}
                  onFocusManualEntry={() => manualToolEntryRef.current?.scrollIntoView()}
                />
                
                <div className="flex flex-col justify-center items-center gap-4">
                  <button
                    onClick={handleCompare}
                    disabled={isComparing || neededTools.length === 0}
                    className="w-full max-w-xs bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all text-lg"
                  >
                    {isComparing ? 'Analyzing...' : 'Compare Inventories'}
                  </button>
                </div>
              </div>
              
              {result && (
                  <div className="animate-fade-in space-y-6">
                      <ComparisonSummary 
                        totalNeeded={neededTools.length}
                        availableCount={result.available.length}
                        onOrderCount={result.onOrder.length}
                        shortageCount={result.shortage.length}
                        onExportPdf={handleExportPdf}
                      />
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                          <InventoryCard title="Available" tools={result.available} status="available" />
                          <InventoryCard title="On Order" tools={result.onOrder} status="onOrder" onFindSourcing={handleFindSourcing}/>
                          <InventoryCard title="Shortage" tools={result.shortage} status="shortage" onFindSourcing={handleFindSourcing} onExport={() => setIsReportModalOpen(true)} />
                      </div>
                       {result.suggestedSubstitutions && result.suggestedSubstitutions.length > 0 && (
                          <div className="bg-yellow-900/30 border border-yellow-700/50 p-5 rounded-xl">
                              <h3 className="text-xl font-bold text-yellow-300 mb-4">Suggested Substitutions</h3>
                              <div className="space-y-3">
                                  {result.suggestedSubstitutions.map((sub, i) => (
                                      <div key={i} className="bg-gray-900/40 p-3 rounded-lg">
                                          <p><span className='font-semibold text-red-400'>Needed:</span> {sub.neededTool.name} (P/N: {sub.neededTool.partNumber})</p>
                                          <p><span className='font-semibold text-green-400'>Suggest:</span> {sub.suggestedTool.name} (P/N: {sub.suggestedTool.partNumber})</p>
                                          <p className="text-sm text-gray-400 mt-1">
                                              <span className="font-semibold">Confidence:</span> {sub.confidence} - <em className="text-gray-500">{sub.reason}</em>
                                          </p>
                                      </div>
                                  ))}
                              </div>
                          </div>
                       )}
                  </div>
              )}
            </div>
          )}
          {route === 'manager' && (
            <InventoryManager
              tools={masterInventory}
              onAddTool={handleAddTool}
              onUpdateTool={handleUpdateTool}
              onDeleteTool={handleDeleteTools}
              addToast={addToast}
              onImportMaster={handleMasterImport}
              isImportingMaster={isMasterImporting}
            />
          )}
          {route === 'datahub' && (
            <DataHub 
              aircraftData={aircraftData}
              onAddAircraft={() => setIsAddAircraftModalOpen(true)}
              onUpdateAircraft={handleUpdateAircraft}
              onDeleteAircraft={handleDeleteAircraft}
              onLoadToolList={handleLoadToolList}
              onDeleteToolList={handleDeleteToolList}
              onViewComparison={handleViewComparison}
              onDeleteComparison={handleDeleteComparison}
              onAnalyzeEvent={handleAnalyzeEvent}
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
              onImportPlan={handlePlanImport}
              isImportingPlan={isPlanImporting}
            />
           )}
        </main>
      </div>
    </div>
  );
};

export default App;
