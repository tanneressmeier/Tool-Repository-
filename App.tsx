import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import type { ComparisonResult, Tool, SuggestedSubstitution, SourcingInfo, AircraftData, SavedToolList, SavedComparison, ToastMessage, Kit, PurchasePlanItem, MaintenanceTask } from './types';
import { compareInventories, processCsvInventory, processNeededToolsCsv, getToolSourcingInfo, predictToolsForJob, analyzeMaintenanceTasks } from './services/geminiService';
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
import { DocumentArrowDownIcon } from './components/icons/DocumentArrowDownIcon';
import AddAircraftModal from './components/AddAircraftModal';
import MaintenanceEventAnalysisModal from './components/MaintenanceEventAnalysisModal';
import PDFReport from './components/PDFReport';

const App: React.FC = () => {
  const [neededTools, setNeededTools] = useState<Tool[]>([]);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [masterInventory, setMasterInventory] = useState<Tool[]>([]);
  const [aircraftData, setAircraftData] = useState<AircraftData[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [purchasePlan, setPurchasePlan] = useState<PurchasePlanItem[]>([]);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  const [isMasterImporting, setIsMasterImporting] = useState<boolean>(false);
  const [isNeededImporting, setIsNeededImporting] = useState<boolean>(false);
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
          dataService.getMasterInventory(),
          dataService.getAircraftData(),
          dataService.getKits(),
          dataService.getPurchasePlan(),
        ]);
        setMasterInventory(inventory);
        setAircraftData(aircraftList);
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
  const useDebouncedSave = <T,>(data: T, saveFunction: (data: T) => Promise<void>, toastMessage: string) => {
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current || isAppLoading) {
            isInitialMount.current = false;
            return;
        }
        const handler = setTimeout(() => {
            saveFunction(data).catch(err => {
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
      ...newTool, 
      serialNumber: newTool.serialNumber || 'N/A',
      toolId: `USR-${Date.now()}`
    };
    setMasterInventory(prev => {
      const updatedInventory = [...prev, toolToAdd];
      dataService.saveMasterInventory(updatedInventory).catch(err => {
        addToast('Failed to save inventory to storage.', 'error');
        console.error(err);
      });
      return updatedInventory;
    });
    // If tool came from purchasing plan, mark it as received
    setPurchasePlan(prev => prev.map(item => item.partNumber === newTool.partNumber ? {...item, received: true} : item));
  };

  const handleUpdateTool = (updatedTool: Tool) => {
    setMasterInventory(prev => {
      const updatedInventory = prev.map(tool => 
        (tool.toolId && tool.toolId === updatedTool.toolId) ? updatedTool : tool
      );
      dataService.saveMasterInventory(updatedInventory).catch(err => {
        addToast('Failed to save inventory update.', 'error');
        console.error(err);
      });
      return updatedInventory;
    });
  };
  
  const performDeleteTools = (tools: Tool[]) => {
    const serialsToDelete = new Set(tools.map(t => t.serialNumber));
    setMasterInventory(prev => {
      const updatedInventory = prev.filter(tool => !serialsToDelete.has(tool.serialNumber));
      dataService.saveMasterInventory(updatedInventory).catch(err => {
        addToast('Failed to delete tools from storage.', 'error');
        console.error(err);
      });
      return updatedInventory;
    });
  };
  
  const requestDeleteTools = (tools: Tool[]) => setToolsToDelete(tools);
  const confirmDeleteTools = () => {
    if (toolsToDelete.length > 0) {
      performDeleteTools(toolsToDelete);
      setToolsToDelete([]);
    }
  };

  const handleManualAddNeededTool = (newTool: { name: string; manufacturer: string; partNumber: string; }) => {
    setNeededTools(prev => [...prev, { ...newTool, serialNumber: 'N/A' }]);
  };
  
  const handleFocusManualEntry = () => {
    manualToolEntryRef.current?.scrollIntoView();
    setTimeout(() => {
      manualToolEntryRef.current?.focusInput();
    }, 300);
  };
  
  const handleToolsPredicted = (predictedTools: Tool[]) => {
    setNeededTools(predictedTools);
    setResult(null);
    setError(null);
    setViewingComparison(null);
    addToast('AI-predicted tool list has been loaded into "Needed Tools".', 'success');
  };

  // --- Data Hub & Kits Handlers ---

  const handleKitsUpdate = (updatedKits: Kit[]) => {
    setKits(updatedKits);
  };

  const handleLoadKit = (kitToLoad: Kit) => {
    setNeededTools(kitToLoad.tools);
    setIsLoadKitModalOpen(false);
    navigate('checker');
    setResult(null);
    setError(null);
    setViewingComparison(null);
    addToast(`Loaded kit: "${kitToLoad.name}"`, 'info');
  };

  const handleAddAircraft = (name: string) => {
    if (!name.trim()) {
        addToast("Aircraft name cannot be empty.", "error");
        return;
    }
    const newAircraft: AircraftData = {
        id: `ac-${Date.now()}`,
        name: name.trim(),
        createdAt: new Date().toISOString(),
        toolLists: [],
        comparisons: [],
    };
    setAircraftData(prev => [...prev, newAircraft].sort((a, b) => a.name.localeCompare(b.name)));
    addToast(`Aircraft "${name}" created successfully.`, 'success');
    setIsAddAircraftModalOpen(false);
  };

  const handleUpdateAircraft = (id: string, newName: string) => {
    if (!newName.trim()) {
        addToast("Aircraft name cannot be empty.", "error");
        return;
    }
    setAircraftData(prev => prev.map(ac => ac.id === id ? { ...ac, name: newName.trim() } : ac));
    addToast(`Aircraft renamed to "${newName.trim()}".`, 'success');
  };

  const handleDeleteAircraft = (id: string) => {
    if (window.confirm("Are you sure you want to delete this aircraft and all its associated lists and reports? This action cannot be undone.")) {
      setAircraftData(prev => prev.filter(ac => ac.id !== id));
      addToast(`Aircraft deleted.`, 'info');
    }
  };


  const handleSaveToolList = (details: { listName: string; maintenanceEvent: string; aircraftId: string | 'new'; newAircraftName?: string }) => {
    if (neededTools.length === 0) return;

    let targetAircraftId = details.aircraftId;
    let newAircraftName = '';

    if (details.aircraftId === 'new') {
        if (!details.newAircraftName?.trim()) {
            addToast("New aircraft name cannot be empty.", "error");
            return;
        }
        newAircraftName = details.newAircraftName.trim();
        const newAircraft: AircraftData = {
            id: `ac-${Date.now()}`,
            name: newAircraftName,
            createdAt: new Date().toISOString(),
            toolLists: [],
            comparisons: [],
        };
        setAircraftData(prev => [...prev, newAircraft].sort((a,b) => a.name.localeCompare(b.name)));
        targetAircraftId = newAircraft.id;
    }
    
    const newList: SavedToolList = {
        id: `list-${Date.now()}`,
        name: details.listName,
        maintenanceEvent: details.maintenanceEvent,
        tools: neededTools,
        createdAt: new Date().toISOString(),
    };

    let savedToAircraftName = '';
    setAircraftData(prev => prev.map(p => {
        if (p.id === targetAircraftId) {
            savedToAircraftName = p.name;
            const updatedLists = [...p.toolLists.filter(l => l.name.toLowerCase() !== newList.name.toLowerCase()), newList]
                .sort((a, b) => a.name.localeCompare(b.name));
            return { ...p, toolLists: updatedLists };
        }
        return p;
    }));
    setIsSaveListModalOpen(false);
    addToast(`Tool list "${details.listName}" saved to aircraft "${newAircraftName || savedToAircraftName}".`, 'success');
  };

  const handleLoadToolList = (aircraftId: string, listId: string) => {
      const aircraft = aircraftData.find(p => p.id === aircraftId);
      const listToLoad = aircraft?.toolLists.find(l => l.id === listId);
      if (listToLoad) {
          setNeededTools(listToLoad.tools);
          setResult(null);
          setError(null);
          setViewingComparison(null);
          navigate('checker');
          addToast(`Loaded tooling list: "${listToLoad.name}"`, 'info');
      }
  };

  const handleDeleteToolList = (aircraftId: string, listId: string) => {
    if (window.confirm("Are you sure you want to delete this tool list?")) {
        setAircraftData(prev => prev.map(p => {
            if (p.id === aircraftId) {
                return { ...p, toolLists: p.toolLists.filter(l => l.id !== listId) };
            }
            return p;
        }));
    }
  };

  const handleSaveComparison = (details: { name: string; aircraftId: string; maintenanceEvent: string; }) => {
    if (!result) return;
    
    const { name, aircraftId, maintenanceEvent } = details;

    const aircraft = aircraftData.find(p => p.id === aircraftId);
    if (!aircraft) {
        addToast(`Aircraft not found. Could not save comparison.`, 'error');
        return;
    }
    
    const currentListName = "Ad-hoc List";
    
    const newComparison: SavedComparison = {
        id: `comp-${Date.now()}`,
        name: name.trim(),
        createdAt: new Date().toISOString(),
        result: result,
        toolListName: currentListName,
        maintenanceEvent: maintenanceEvent,
    };
    
    setAircraftData(prev => prev.map(p => {
        if (p.id === aircraftId) {
            const updatedComparisons = [...p.comparisons, newComparison]
                .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { ...p, comparisons: updatedComparisons };
        }
        return p;
    }));
    setIsSaveComparisonModalOpen(false);
    addToast(`Comparison "${name}" saved to aircraft "${aircraft.name}".`, 'success');
  };

  const handleViewComparison = (aircraftId: string, comparisonId: string) => {
    const aircraft = aircraftData.find(p => p.id === aircraftId);
    const comparison = aircraft?.comparisons.find(c => c.id === comparisonId);
    if (comparison) {
        setResult(comparison.result);
        setNeededTools([...comparison.result.available, ...comparison.result.onOrder, ...comparison.result.shortage]);
        setViewingComparison(comparison);
        navigate('checker');
        setError(null);
        addToast(`Viewing comparison: "${comparison.name}"`, 'info');
    }
  };

  const handleDeleteComparison = (aircraftId: string, comparisonId: string) => {
    if (window.confirm("Are you sure you want to delete this comparison report?")) {
        setAircraftData(prev => prev.map(p => {
            if (p.id === aircraftId) {
                return { ...p, comparisons: p.comparisons.filter(c => c.id !== comparisonId) };
            }
            return p;
        }));
    }
  };


  // --- Comparison Logic ---
  const handleCompare = useCallback(async () => {
    if (neededTools.length === 0) {
      addToast("The 'Needed Tools' list is empty.", 'error');
      setResult(null);
      return;
    }
    setIsComparing(true);
    setError(null);
    setResult(null);
    setViewingComparison(null);

    try {
      const comparisonResult = await compareInventories(masterInventory, neededTools, purchasePlan);
      setResult(comparisonResult);
      addToast('Comparison complete.', 'success');
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during comparison.";
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setIsComparing(false);
    }
  }, [masterInventory, neededTools, purchasePlan, addToast]);

  const handleClear = () => {
    setNeededTools([]);
    setResult(null);
    setError(null);
    setViewingComparison(null);
    addToast('Cleared "Needed Tools" list.', 'info');
  };
  
  // --- File Import Handlers ---
  const handleMasterInventoryImport = async (file: File) => {
    setIsMasterImporting(true);
    try {
      const content = await file.text();
      const processedTools = await processCsvInventory(content);
      
      let newCount = 0;
      setMasterInventory(prev => {
        const existingSerials = new Set(prev.map(t => t.serialNumber));
        const newUniqueTools = processedTools.filter(t => !existingSerials.has(t.serialNumber));
        newCount = newUniqueTools.length;
        const updatedInventory = [...prev, ...newUniqueTools].sort((a,b) => a.name.localeCompare(b.name));
        dataService.saveMasterInventory(updatedInventory); // Fire-and-forget save
        return updatedInventory;
      });
      addToast(`Imported ${newCount} new tools to the master inventory.`, 'success');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to import file.";
      addToast(errorMessage, 'error');
      console.error(err);
    } finally {
      setIsMasterImporting(false);
    }
  };

  const handleNeededToolsImport = async (file: File) => {
    setIsNeededImporting(true);
    try {
      const content = await file.text();
      const processedTools = await processNeededToolsCsv(content);
      setNeededTools(processedTools);
      setResult(null);
      setError(null);
      setViewingComparison(null);
      addToast(`Imported ${processedTools.length} tools into the 'Needed Tools' list.`, 'success');
    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : "Failed to import file.";
       addToast(errorMessage, 'error');
       console.error(err);
    } finally {
      setIsNeededImporting(false);
    }
  };
  
  const handleFindSourcing = useCallback(async (tool: Tool) => {
    setSourcingTool(tool);
    setIsSourcingModalOpen(true);
    setCurrentSourcingInfo({ status: 'loading' });

    try {
      const info = await getToolSourcingInfo(tool);
      setCurrentSourcingInfo(info);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to get sourcing info.";
      setCurrentSourcingInfo({ status: 'error', message });
    }
  }, []);
  
    const handleAnalyzeEvent = useCallback(async (aircraftId: string, eventName: string) => {
        const aircraft = aircraftData.find(ac => ac.id === aircraftId);
        const list = aircraft?.toolLists.find(l => l.maintenanceEvent === eventName);
        if (!list) {
            addToast(`Tool list for event "${eventName}" not found.`, 'error');
            return;
        }

        setAnalyzingEvent({ aircraftId, eventName, toolList: list.tools });
        setIsAnalysisModalOpen(true);
        setAnalysisResult(null);
        setIsAnalyzing(true);
        try {
            const tasks = await analyzeMaintenanceTasks(eventName, list.tools);
            setAnalysisResult(tasks);
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Failed to analyze event.";
            addToast(message, 'error');
            setAnalysisResult(null);
        } finally {
            setIsAnalyzing(false);
        }
    }, [aircraftData, addToast]);

  // --- PDF Report Generation ---
  const handleGenerateReport = async () => {
    if (!result) return;
    
    const toolsToFetch = [...result.onOrder, ...result.shortage];
    if (toolsToFetch.length === 0) {
        setReportGenerationProgress({ current: 0, total: 0, status: 'complete' });
        setIsReportGenerationModalOpen(true);
        return;
    }

    setIsReportGenerationModalOpen(true);
    setReportGenerationProgress({ current: 0, total: toolsToFetch.length, status: 'running' });
    
    const throttle = async () => {
        const now = Date.now();
        const timeSinceLastCall = now - lastSourcingApiCall.current;
        // Using a conservative 60-second delay (1 QPM) to avoid hitting strict rate limits on grounded models.
        const requiredDelay = 60000; 

        if (timeSinceLastCall < requiredDelay) {
            const waitTime = requiredDelay - timeSinceLastCall;
            console.log(`Throttling Gemini API call for ${waitTime / 1000}s to respect rate limits.`);
            await delay(waitTime);
        }
        lastSourcingApiCall.current = Date.now();
    };

    for (let i = 0; i < toolsToFetch.length; i++) {
        const tool = toolsToFetch[i];
        
        if (reportSourcingCache.current.has(tool.partNumber)) {
          setReportGenerationProgress(prev => ({ ...prev, current: prev.current + 1 }));
          continue;
        }

        let success = false;
        let attempts = 0;
        
        while (!success && attempts < 3) { // Max 3 attempts
            try {
                await throttle(); // Wait and update timestamp before the API call.
                const info = await getToolSourcingInfo(tool);
                reportSourcingCache.current.set(tool.partNumber, info);
                success = true;
            } catch (error) {
                attempts++;
                const message = error instanceof Error ? error.message : "Failed to fetch.";
                const isRateLimitError = message.includes('rate limit') || message.includes('429') || message.includes('RESOURCE_EXHAUSTED');

                if (isRateLimitError && attempts < 3) {
                    console.warn(`Attempt ${attempts} for ${tool.partNumber} was rate-limited. Retrying after delay...`);
                    addToast(`API rate limit hit. Retrying for ${tool.partNumber}...`, 'info');
                    // The throttle function will automatically handle the required wait time on the next attempt.
                } else {
                    const finalErrorMsg = attempts >= 3 
                        ? `Failed after ${attempts} retries due to persistent API rate limits.` 
                        : `A non-retryable error occurred: ${message}`;
                    console.error(`Final attempt failed for ${tool.partNumber}:`, error);
                    reportSourcingCache.current.set(tool.partNumber, { error: finalErrorMsg });
                    break; // Exit the while loop for this tool
                }
            }
        }
        
        setReportGenerationProgress(prev => ({ ...prev, current: i + 1 }));
    }
    
    setReportGenerationProgress(prev => ({ ...prev, status: 'complete' }));
  };
  
    const handlePrintReport = (isQuick: boolean) => {
        if (!result) return;

        if (!isQuick) {
            handleGenerateReport(); // This triggers the modal for sourcing
            return;
        }

        // Logic for immediate quick print
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            reportWindow.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <title>Tooling Report (Quick View)</title>
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
                root.render(<PDFReport result={result} sourcingData={new Map()} isQuickReport={true} />);
                
                setTimeout(() => {
                    reportWindow.focus();
                    reportWindow.print();
                }, 1000);
            }
        }
    };


  const renderContent = () => {
    switch (route) {
      case 'manager':
        return (
          <InventoryManager
            tools={masterInventory}
            onAddTool={handleAddTool}
            onUpdateTool={handleUpdateTool}
            onDeleteTool={requestDeleteTools}
            addToast={addToast}
            onImportMaster={handleMasterInventoryImport}
            isImportingMaster={isMasterImporting}
          />
        );
      case 'datahub':
        return (
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
        );
      case 'kits':
        return (
          <KitsManager 
            kits={kits}
            masterInventory={masterInventory}
            onKitsUpdate={handleKitsUpdate}
            addToast={addToast}
          />
        );
      case 'purchasing':
        return (
            <PurchasingManager 
                purchasePlan={purchasePlan}
                masterInventory={masterInventory}
                onAddTool={handleAddTool}
                addToast={addToast}
            />
        );
      case 'checker':
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-6">
                <PredictiveTooling onToolsPredicted={handleToolsPredicted} addToast={addToast} />
                <ManualToolEntry ref={manualToolEntryRef} onAddTool={handleManualAddNeededTool} />
              </div>

              <InventoryCard
                title="Needed Tools"
                tools={neededTools}
                status="master"
                onImport={handleNeededToolsImport}
                isImporting={isNeededImporting}
                onSave={() => setIsSaveListModalOpen(true)}
                onLoadKit={() => setIsLoadKitModalOpen(true)}
                isNeededToolsList={true}
                onFocusManualEntry={handleFocusManualEntry}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
              <button
                onClick={handleCompare}
                disabled={isComparing || neededTools.length === 0}
                className="w-full sm:w-auto bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-wait transition-all transform hover:scale-105"
              >
                {isComparing ? 'Analyzing...' : 'Compare Inventories'}
              </button>
              {result && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {!viewingComparison && (
                        <button
                          onClick={() => setIsSaveComparisonModalOpen(true)}
                          className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-500 transition-colors"
                        >
                          Save Comparison
                        </button>
                    )}
                     <button
                        onClick={() => handlePrintReport(true)}
                        className="w-full sm:w-auto bg-teal-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                        title="Generate a quick report without sourcing details"
                      >
                        <DocumentArrowDownIcon className="w-5 h-5"/>
                        Quick Report
                      </button>
                      <button
                        onClick={() => handlePrintReport(false)}
                        className="w-full sm:w-auto bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-500 transition-colors flex items-center justify-center gap-2"
                        title="Generate a full report with AI-powered sourcing information (can be slow)"
                      >
                        <DocumentArrowDownIcon className="w-5 h-5"/>
                        Full Report
                      </button>
                    <button
                      onClick={handleClear}
                      className="w-full sm:w-auto bg-gray-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
              )}
            </div>

            {isComparing && (
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="mt-2 text-gray-400">Processing with AI...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-300 p-4 rounded-lg text-center">
                <strong>Error:</strong> {error}
              </div>
            )}

            {viewingComparison && (
                <div className="bg-indigo-900/30 border border-indigo-700/50 text-indigo-200 p-4 rounded-lg text-center mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
                    <div>
                        <strong>Viewing Saved Report:</strong> "{viewingComparison.name}" from {new Date(viewingComparison.createdAt).toLocaleString()}
                    </div>
                    <button onClick={handleClear} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors flex-shrink-0">
                        Start New Comparison
                    </button>
                </div>
            )}

            {result && (
              <>
                 <ComparisonSummary 
                    totalNeeded={result.available.length + result.onOrder.length + result.shortage.length}
                    availableCount={result.available.length}
                    onOrderCount={result.onOrder.length}
                    shortageCount={result.shortage.length}
                 />
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                  <InventoryCard
                    title="Available"
                    tools={result.available}
                    status="available"
                  />
                  <InventoryCard
                    title="On Order"
                    tools={result.onOrder}
                    status="onOrder"
                    onFindSourcing={handleFindSourcing}
                  />
                  <InventoryCard
                    title="Shortages"
                    tools={result.shortage}
                    status="shortage"
                    onExport={() => setIsReportModalOpen(true)}
                    onFindSourcing={handleFindSourcing}
                  />
                </div>
              </>
            )}

            {result?.suggestedSubstitutions && result.suggestedSubstitutions.length > 0 && (
                <div className="bg-gray-800/50 p-5 rounded-xl shadow-md border border-gray-700 animate-fade-in">
                    <h3 className="text-xl font-bold text-yellow-300 mb-4">Suggested Substitutions</h3>
                    <ul className="space-y-3">
                        {result.suggestedSubstitutions.map((sub, index) => (
                            <li key={index} className="bg-gray-900/40 p-3 rounded-lg">
                                <p className="font-semibold text-gray-200">Needed: <span className="font-normal">{sub.neededTool.name} (P/N: {sub.neededTool.partNumber})</span></p>
                                <p className="font-semibold text-gray-200">Suggestion: <span className="font-normal">{sub.suggestedTool.name} (P/N: {sub.suggestedTool.partNumber})</span></p>
                                <p className="text-sm mt-1"><span className="font-semibold text-yellow-400">{sub.confidence} Confidence:</span> <span className="text-gray-400">{sub.reason}</span></p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      <ReportGenerationModal 
        isOpen={isReportGenerationModalOpen}
        onClose={() => setIsReportGenerationModalOpen(false)}
        result={result}
        sourcingData={reportSourcingCache.current}
        progress={reportGenerationProgress}
      />

      <SourcingInfoModal 
        isOpen={isSourcingModalOpen}
        onClose={() => setIsSourcingModalOpen(false)}
        tool={sourcingTool}
        sourcingInfo={currentSourcingInfo}
      />
      
      <AddAircraftModal
        isOpen={isAddAircraftModalOpen}
        onClose={() => setIsAddAircraftModalOpen(false)}
        onAdd={handleAddAircraft}
      />
      
      <MaintenanceEventAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        eventName={analyzingEvent?.eventName}
        isLoading={isAnalyzing}
        tasks={analysisResult}
      />

      <ConfirmationModal
        isOpen={toolsToDelete.length > 0}
        onClose={() => setToolsToDelete([])}
        onConfirm={confirmDeleteTools}
        title={`Delete ${toolsToDelete.length} Tool(s)?`}
        message={
          <>
            <p className="mb-2">Are you sure you want to permanently delete the selected tool(s)?</p>
            <ul className="list-disc list-inside bg-gray-900/50 p-2 rounded-md max-h-32 overflow-y-auto text-sm">
                {toolsToDelete.slice(0, 5).map(t => <li key={t.serialNumber}>{t.name}</li>)}
                {toolsToDelete.length > 5 && <li>...and {toolsToDelete.length - 5} more.</li>}
            </ul>
            <p className="mt-2 text-yellow-400">This action cannot be undone.</p>
          </>
        }
      />
      <ShortageReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        tools={result?.shortage || []}
      />
      <SaveListModal 
        isOpen={isSaveListModalOpen}
        onClose={() => setIsSaveListModalOpen(false)}
        onSave={handleSaveToolList}
        aircrafts={aircraftData}
      />
       <SaveComparisonModal
        isOpen={isSaveComparisonModalOpen}
        onClose={() => setIsSaveComparisonModalOpen(false)}
        onSave={handleSaveComparison}
        aircrafts={aircraftData}
        defaultMaintenanceEvent={viewingComparison?.maintenanceEvent || ''}
      />
      <LoadKitModal 
        isOpen={isLoadKitModalOpen}
        onClose={() => setIsLoadKitModalOpen(false)}
        onLoadKit={handleLoadKit}
        kits={kits}
      />

      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex justify-center items-center gap-4">
                  <ToolIcon className="w-10 h-10 text-cyan-400" />
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Tool Inventory System
                  </h1>
                </div>
            </div>
          <p className="text-center text-md text-gray-400 max-w-2xl mx-auto">
            An AI-powered expert system for managing and verifying specialized tool inventories.
          </p>
        </header>

        <nav className="flex justify-center items-center gap-2 sm:gap-4 mb-8 bg-gray-800/60 p-2 rounded-xl border border-gray-700 max-w-2xl mx-auto">
            {['checker', 'manager', 'purchasing', 'datahub', 'kits'].map((r) => (
                <button
                    key={r}
                    onClick={() => navigate(r as any)}
                    className={`flex-1 text-center font-semibold text-sm sm:text-base py-2 px-4 rounded-lg transition-colors capitalize ${route === r ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                >
                    {r}
                </button>
            ))}
        </nav>

        {isAppLoading ? (
            <div className="text-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading inventory...</p>
            </div>
        ) : (
          <main className="animate-fade-in">{renderContent()}</main>
        )}
      </div>
    </div>
  );
};

export default App;