
import React, { useState, useRef, useMemo } from 'react';
import type { SaleItem, SaleMatch, PurchasePlanItem, AircraftData, Tool } from '../types';
import { processForSaleCsv } from '../services/geminiService';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { INCOMING_SALE_LIST_TEXT } from '../preloadedData';

interface SaleFinderProps {
    purchasePlan: PurchasePlanItem[];
    aircraftData: AircraftData[];
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const CloudArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
    </svg>
);

const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const SaleFinder: React.FC<SaleFinderProps> = ({ purchasePlan, aircraftData, addToast }) => {
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
    const [matches, setMatches] = useState<SaleMatch[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const normalize = (s: string) => s ? s.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';

    const handleImport = async (file: File) => {
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            await processText(text);
        };
        reader.readAsText(file);
    };

    const handleLoadIncoming = async () => {
        await processText(INCOMING_SALE_LIST_TEXT);
    };

    const processText = async (text: string) => {
        setIsProcessing(true);
        try {
            const items = await processForSaleCsv(text);
            setSaleItems(items);
            runComparison(items);
            addToast(`Loaded ${items.length} items for sale.`, 'success');
        } catch (err) {
            console.error(err);
            addToast("Failed to process sale list.", 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const runComparison = (items: SaleItem[]) => {
        const newMatches: SaleMatch[] = [];

        // 1. Build Lookup Maps for Purchase Plan
        const planPartMap = new Map<string, PurchasePlanItem[]>();
        const planNameMap = new Map<string, PurchasePlanItem[]>();

        purchasePlan.forEach(item => {
            if (item.partNumber) {
                const key = normalize(item.partNumber);
                if (key.length > 2) { // Only index if meaningful length
                    if (!planPartMap.has(key)) planPartMap.set(key, []);
                    planPartMap.get(key)!.push(item);
                }
            }
            if (item.name) {
                const key = normalize(item.name);
                if (key.length > 3) {
                    if (!planNameMap.has(key)) planNameMap.set(key, []);
                    planNameMap.get(key)!.push(item);
                }
            }
        });

        // 2. Build Lookup Maps for Needed Tools (Tooling Lists)
        const neededPartMap = new Map<string, { tool: Tool, source: string }[]>();
        const neededNameMap = new Map<string, { tool: Tool, source: string }[]>();

        aircraftData.forEach(ac => {
            ac.toolLists.forEach(list => {
                list.tools.forEach(tool => {
                    const sourceName = `${ac.name} > ${list.name}`;
                    
                    if (tool.model && tool.model !== 'N/A') {
                        const key = normalize(tool.model);
                        if (key.length > 2) {
                            if (!neededPartMap.has(key)) neededPartMap.set(key, []);
                            neededPartMap.get(key)!.push({ tool, source: sourceName });
                        }
                    }
                    if (tool.name) {
                        const key = normalize(tool.name);
                        if (key.length > 3) {
                            if (!neededNameMap.has(key)) neededNameMap.set(key, []);
                            neededNameMap.get(key)!.push({ tool, source: sourceName });
                        }
                    }
                });
            });
        });

        // 3. Perform Matching
        items.forEach(saleItem => {
            const salePartKey = normalize(saleItem.model);
            const saleNameKey = normalize(saleItem.name);
            
            const matchesForThisItem: { name: string; model: string; sourceContext: string }[] = [];
            let matchType: 'Purchase Plan' | 'Needed Tool' | undefined;
            let bestConfidence: 'High' | 'Medium' = 'Medium';

            // A. Check Purchase Plan (Part Number) - High Confidence
            if (salePartKey && planPartMap.has(salePartKey)) {
                const plans = planPartMap.get(salePartKey)!;
                plans.forEach(p => {
                    matchesForThisItem.push({
                        name: p.name,
                        model: p.partNumber,
                        sourceContext: `Purchase Plan (P/N Match)`
                    });
                });
                matchType = 'Purchase Plan';
                bestConfidence = 'High';
            }

            // B. Check Needed Tools (Part Number) - High Confidence
            if (salePartKey && neededPartMap.has(salePartKey)) {
                const needs = neededPartMap.get(salePartKey)!;
                needs.forEach(n => {
                    matchesForThisItem.push({
                        name: n.tool.name,
                        model: n.tool.model,
                        sourceContext: `Needed: ${n.source} (P/N Match)`
                    });
                });
                matchType = matchType || 'Needed Tool';
                bestConfidence = 'High';
            }

            // C. Check Purchase Plan (Name) - Medium Confidence (only if no P/N match)
            if (saleNameKey && planNameMap.has(saleNameKey)) {
                const plans = planNameMap.get(saleNameKey)!;
                // Avoid duplicates if we already matched by P/N
                if (matchesForThisItem.length === 0) {
                    plans.forEach(p => {
                        matchesForThisItem.push({
                            name: p.name,
                            model: p.partNumber,
                            sourceContext: `Purchase Plan (Name Match)`
                        });
                    });
                    matchType = matchType || 'Purchase Plan';
                }
            }

            // D. Check Needed Tools (Name) - Medium Confidence (only if no P/N match)
            if (saleNameKey && neededNameMap.has(saleNameKey)) {
                const needs = neededNameMap.get(saleNameKey)!;
                if (matchesForThisItem.length === 0) {
                    needs.forEach(n => {
                        matchesForThisItem.push({
                            name: n.tool.name,
                            model: n.tool.model,
                            sourceContext: `Needed: ${n.source} (Name Match)`
                        });
                    });
                    matchType = matchType || 'Needed Tool';
                }
            }

            if (matchesForThisItem.length > 0 && matchType) {
                newMatches.push({
                    saleItem,
                    matchType,
                    matchConfidence: bestConfidence,
                    matchedWith: matchesForThisItem
                });
            }
        });

        setMatches(newMatches);
        if (newMatches.length > 0) {
            addToast(`Found ${newMatches.length} matches!`, 'success');
        } else {
            addToast("No matches found against current needs.", 'info');
        }
    };

    const nonMatchingCount = saleItems.length - matches.length;

    return (
        <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 min-h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Sale Opportunity Matcher</h2>
                    <p className="text-gray-400 text-sm mt-1">Compare "For Sale" lists against your Needed Tools and Purchasing Plan.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleLoadIncoming}
                        disabled={isProcessing}
                        className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-900/20 disabled:bg-gray-600 disabled:cursor-wait transition-all"
                    >
                        {isProcessing ? 'Analyzing...' : (
                            <>
                                <ClipboardIcon className="w-5 h-5" />
                                Load Incoming List
                            </>
                        )}
                    </button>
                    <input
                        type="file"
                        accept=".csv,.txt,.pdf"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 shadow-lg shadow-green-900/20 disabled:bg-gray-600 disabled:cursor-wait transition-all"
                    >
                        {isProcessing ? 'Analyzing...' : (
                            <>
                                <CloudArrowUpIcon className="w-5 h-5" />
                                Upload List
                            </>
                        )}
                    </button>
                </div>
            </div>

            {saleItems.length === 0 && !isProcessing && (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl p-12">
                    <SearchIcon className="w-16 h-16 mb-4 text-gray-600" />
                    <p className="text-lg font-medium">No sale list loaded</p>
                    <p className="text-sm mt-1 max-w-md text-center">Upload a CSV or click "Load Incoming List" to check tools for sale against your needs.</p>
                </div>
            )}

            {saleItems.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-hidden">
                    {/* Matches Column */}
                    <div className="lg:col-span-2 flex flex-col min-h-0 bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                                Matches Found ({matches.length})
                            </h3>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {matches.length > 0 ? matches.map((match, idx) => (
                                <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-sm hover:border-cyan-500/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{match.saleItem.name}</h4>
                                            <p className="text-sm text-cyan-400 font-mono">{match.saleItem.model}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xl font-bold text-green-400 font-mono">{match.saleItem.price}</span>
                                            <span className="text-xs text-gray-400">{match.saleItem.condition}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 space-y-2">
                                        {match.matchedWith.map((m, mIdx) => (
                                            <div key={mIdx} className="bg-gray-900/50 p-2 rounded text-sm flex items-center gap-3">
                                                {match.matchType === 'Purchase Plan' ? (
                                                    <ShoppingCartIcon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                                ) : (
                                                    <CheckBadgeIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className="text-gray-300 font-medium">Matches: <span className="text-white">{m.sourceContext}</span></p>
                                                    <p className="text-xs text-gray-500">Needed: {m.name} ({m.model})</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No matches found in the uploaded list.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Non-Matches Column */}
                    <div className="flex flex-col min-h-0 bg-gray-900/30 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="p-4 border-b border-gray-800 bg-gray-800/40 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-gray-400">Not Needed ({nonMatchingCount})</h3>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-2">
                            {saleItems.filter(item => !matches.some(m => m.saleItem === item)).map((item, idx) => (
                                <div key={idx} className="bg-gray-800/30 border border-gray-800 p-3 rounded-lg flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-gray-300 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{item.model}</p>
                                    </div>
                                    <span className="text-sm font-mono text-gray-400 ml-2 whitespace-nowrap">{item.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SaleFinder;
