
import React from 'react';
import type { ComparisonResult, SourcingInfo, Tool } from '../types';
import { ToolIcon } from './icons/ToolIcon';

interface PDFReportProps {
  result: ComparisonResult;
  sourcingData: Map<string, SourcingInfo | { error: string }>;
  isQuickReport?: boolean;
  aircraftName?: string;
  toolingListName?: string;
}

const PDFReport: React.FC<PDFReportProps> = ({ result, sourcingData, isQuickReport = false, aircraftName, toolingListName }) => {
    const reportDate = new Date().toLocaleString();

    const Section: React.FC<{title: string, count: number, color: string, children: React.ReactNode}> = ({title, count, color, children}) => (
        <div className="mb-8">
            <h2 className={`pdf-no-split text-2xl font-bold p-3 rounded-t-lg ${color} text-white`}>
                {title} <span className="font-normal">({count} items)</span>
            </h2>
            <div className="border-l border-r border-b border-gray-300 rounded-b-lg p-3">
                {count > 0 ? children : <p className="text-gray-500 italic">No items in this category.</p>}
            </div>
        </div>
    );
    
    const ToolItem: React.FC<{tool: Tool}> = ({ tool }) => {
        const category = tool.category || 'Tool';
        return (
            <div className="pdf-no-split py-5 px-3 border-b border-gray-200 flex justify-between items-start">
                <div>
                    <p className="font-semibold text-gray-800">{tool.name.toUpperCase()}</p>
                    <div className="text-sm text-gray-600 mt-1 flex items-center space-x-6">
                        <p><span className="font-medium">Model:</span> {tool.model}</p>
                        <p><span className="font-medium">Mfg:</span> {tool.manufacturer.toUpperCase()}</p>
                    </div>
                </div>
                <span className="flex-shrink-0 ml-4 text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{category}</span>
            </div>
        );
    };
    
    const OnOrderItem: React.FC<{tool: Tool}> = ({ tool }) => {
        const formatPrice = (price: string | undefined) => {
            if (!price || parseFloat(price.replace(/[^0-9.-]+/g,"")) === 0) {
                return "Quote must be requested";
            }
            return price;
        };
        
        const category = tool.category || 'Part';

        return (
            <div className="pdf-no-split py-5 px-3 border-b border-gray-200 flex justify-between items-start">
                <div>
                    <p className="font-semibold text-gray-800">{tool.name.toUpperCase()}</p>
                     <div className="text-sm text-gray-600 mt-1 flex items-center space-x-6">
                        <p><span className="font-medium">Model:</span> {tool.model}</p>
                        <p><span className="font-medium">Mfg:</span> {tool.manufacturer.toUpperCase()}</p>
                    </div>
                    <div className="mt-2 pl-4 text-xs text-gray-700 space-y-1">
                        <p><span className="font-semibold">Qty:</span> {tool.quantity || '1'}</p>
                        {tool.unitPrice && <p><span className="font-semibold">Unit Price:</span> {formatPrice(tool.unitPrice)}</p>}
                        {tool.totalPrice && <p><span className="font-semibold">Total:</span> {formatPrice(tool.totalPrice)}</p>}
                        {tool.sourcingLink && <p><span className="font-semibold">Source:</span> <a href={tool.sourcingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tool.sourcingLink}</a></p>}
                    </div>
                </div>
                <span className="flex-shrink-0 ml-4 text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{category}</span>
            </div>
        );
    };

    const SourcingInfoDisplay: React.FC<{tool: Tool}> = ({ tool }) => {
        const info = sourcingData.get(tool.model);
        if (!info) return <div className="text-xs text-red-600 italic mt-1 pl-2">Sourcing info not available.</div>;
        if ('error' in info) return <div className="text-xs text-red-600 italic mt-1 pl-2">{info.error}</div>;

        return (
            <div className="mt-2 pl-4 border-l-2 border-gray-300 text-xs text-gray-700 space-y-1">
                <p><span className="font-semibold">Est. Price:</span> {info.estimatedPrice}</p>
                {info.purchaseLinks?.length > 0 && (
                    <div>
                        <p className="font-semibold">Purchase:</p>
                        <ul className="list-disc list-inside ml-2">
                            {info.purchaseLinks.map((link, i) => 
                                <li key={`p-${i}`}>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">{link.sourceName}</a>
                                    {link.availability && <span className="text-gray-500 ml-2">({link.availability})</span>}
                                </li>
                            )}
                        </ul>
                    </div>
                )}
                 {info.rentalLinks?.length > 0 && (
                    <div>
                        <p className="font-semibold">Rental:</p>
                        <ul className="list-disc list-inside ml-2">
                            {info.rentalLinks.map((link, i) => 
                                <li key={`r-${i}`}>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">{link.sourceName}</a>
                                    {link.availability && <span className="text-gray-500 ml-2">({link.availability})</span>}
                                </li>
                            )}
                        </ul>
                    </div>
                )}
                 {info.sourcingNotes && <p className="mt-1"><span className="font-semibold">Notes:</span> <em>{info.sourcingNotes}</em></p>}
            </div>
        )
    };
    
    const SourcedToolItem: React.FC<{tool: Tool}> = ({ tool }) => {
        const category = tool.category || 'Tool';
        return (
            <div className="pdf-no-split py-5 px-3 border-b border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-gray-800">{tool.name.toUpperCase()}</p>
                        <div className="text-sm text-gray-600 mt-1 flex items-center space-x-6">
                            <p><span className="font-medium">Model:</span> {tool.model}</p>
                            <p><span className="font-medium">Mfg:</span> {tool.manufacturer.toUpperCase()}</p>
                        </div>
                    </div>
                    <span className="flex-shrink-0 ml-4 text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{category}</span>
                </div>
                <SourcingInfoDisplay tool={tool} />
            </div>
        );
    };

    const onOrderGroupedByStatus = result.onOrder.reduce((acc, tool) => {
        const status = tool.status?.trim() || 'Needs Sourcing';
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(tool);
        return acc;
    }, {} as Record<string, Tool[]>);

    const statusOrder = [
        'Pending Approval',
        'Approved',
        'Sourcing',
        'In Research',
        'Needs Sourcing',
        'Ordered',
        'Received',
    ];

    const statusColors: { [key: string]: string } = {
        'Pending Approval': 'bg-yellow-500',
        'Approved': 'bg-teal-500',
        'Sourcing': 'bg-blue-500',
        'In Research': 'bg-indigo-500',
        'Needs Sourcing': 'bg-gray-500',
        'Ordered': 'bg-orange-500',
        'Received': 'bg-cyan-600',
    };

    const sortedStatuses = Object.keys(onOrderGroupedByStatus).sort((a, b) => {
        const aIndex = statusOrder.indexOf(a);
        const bIndex = statusOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    return (
        <div className="p-8 font-sans text-gray-900 bg-white max-w-[210mm] mx-auto">
            <header className="pdf-no-split flex justify-between items-center pb-6 mb-8 border-b-4 border-gray-800">
                <div>
                    <h1 className="text-4xl font-extrabold flex items-center gap-3 text-gray-900">
                        <ToolIcon className="w-10 h-10" /> 
                        Tooling Report
                    </h1>
                     <div className="mt-3">
                        <h2 className="text-2xl font-bold text-gray-800">{aircraftName || 'Aircraft Unspecified'}</h2>
                        <p className="text-lg text-gray-600 font-medium">{toolingListName || 'Standard Tool List'}</p>
                     </div>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Generated on {reportDate}</p>
                </div>
                <div className="text-right bg-gray-50 p-5 rounded-xl border-2 border-gray-200 shadow-sm">
                    <p className="font-bold text-lg text-gray-800 mb-3 border-b border-gray-300 pb-2">Comparison Summary</p>
                    <div className="text-sm space-y-2">
                        <p className="flex justify-between gap-8"><span>Total Needed:</span> <span className="font-bold">{result.available.length + result.onOrder.length + result.shortage.length}</span></p>
                        <p className="flex justify-between gap-8 text-green-700"><span>Available:</span> <span className="font-bold">{result.available.length}</span></p>
                        <p className="flex justify-between gap-8 text-purple-700"><span>In Procurement:</span> <span className="font-bold">{result.onOrder.length}</span></p>
                        <p className="flex justify-between gap-8 text-red-700"><span>Shortages:</span> <span className="font-bold">{result.shortage.length}</span></p>
                    </div>
                </div>
            </header>

            <main>
                <Section title="Available in Inventory" count={result.available.length} color="bg-green-600">
                    <div className="space-y-1">
                        {result.available.map((tool, i) => <ToolItem key={`${tool.model}-${i}`} tool={tool} />)}
                    </div>
                </Section>
                
                {sortedStatuses.map(status => {
                    const tools = onOrderGroupedByStatus[status];
                    if (!tools || tools.length === 0) return null;
                    const color = statusColors[status] || 'bg-purple-600';

                    return (
                        <Section key={status} title={status} count={tools.length} color={color}>
                            <div className="space-y-1">
                                {tools.map((tool, i) => <OnOrderItem key={`${tool.model}-${i}`} tool={tool} />)}
                            </div>
                        </Section>
                    )
                })}

                <Section title="Shortages (Action Required)" count={result.shortage.length} color="bg-red-600">
                    <div className="space-y-1">
                        {isQuickReport
                            ? result.shortage.map((tool, i) => <ToolItem key={`${tool.model}-${i}`} tool={tool} />)
                            : result.shortage.map((tool, i) => <SourcedToolItem key={`${tool.model}-${i}`} tool={tool} />)
                        }
                    </div>
                </Section>

                {result.suggestedSubstitutions && result.suggestedSubstitutions.length > 0 && (
                    <Section title="Suggested Substitutions" count={result.suggestedSubstitutions.length} color="bg-yellow-600">
                        <div className="space-y-3">
                            {result.suggestedSubstitutions.map((sub, i) => (
                                <div key={i} className="pdf-no-split py-3 px-3 border-b border-gray-200">
                                    <p className="text-sm">
                                        <span className="font-semibold text-gray-800">Needed:</span> {sub.neededTool.name.toUpperCase()} ({sub.neededTool.model})
                                    </p>
                                    <p className="text-sm mt-1">
                                        <span className="font-semibold text-gray-800">Suggest:</span> {sub.suggestedTool.name.toUpperCase()} ({sub.suggestedTool.model})
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1.5">
                                        <span className="font-semibold">Confidence:</span> {sub.confidence} - <span className="italic">{sub.reason}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
            </main>
        </div>
    );
};

export default PDFReport;
