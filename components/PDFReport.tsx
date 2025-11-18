import React from 'react';
import type { ComparisonResult, SourcingInfo, Tool } from '../types';
import { ToolIcon } from './icons/ToolIcon';

interface PDFReportProps {
  result: ComparisonResult;
  sourcingData: Map<string, SourcingInfo | { error: string }>;
  isQuickReport?: boolean;
  aircraftName?: string;
}

const PDFReport: React.FC<PDFReportProps> = ({ result, sourcingData, isQuickReport = false, aircraftName }) => {
    const reportDate = new Date().toLocaleString();

    const Section: React.FC<{title: string, count: number, color: string, children: React.ReactNode}> = ({title, count, color, children}) => (
        <div className="mb-8 break-inside-avoid">
            <h2 className={`text-2xl font-bold p-3 rounded-t-lg ${color} text-white`}>
                {title} <span className="font-normal">({count} items)</span>
            </h2>
            <div className="border-l border-r border-b border-gray-300 rounded-b-lg p-3">
                {count > 0 ? children : <p className="text-gray-500 italic">No items in this category.</p>}
            </div>
        </div>
    );
    
    const ToolItem: React.FC<{tool: Tool}> = ({ tool }) => (
        <div className="py-2 px-3 border-b border-gray-200">
            <p className="font-semibold text-gray-800">{tool.name}</p>
            <p className="text-sm text-gray-600">
                <span className="font-medium">P/N:</span> {tool.partNumber} | <span className="font-medium">Mfg:</span> {tool.manufacturer}
            </p>
        </div>
    );
    
    const OnOrderItem: React.FC<{tool: Tool}> = ({ tool }) => (
        <div className="py-2 px-3 border-b border-gray-200">
            <p className="font-semibold text-gray-800">{tool.name}</p>
            <p className="text-sm text-gray-600">
                <span className="font-medium">P/N:</span> {tool.partNumber} | <span className="font-medium">Mfg:</span> {tool.manufacturer}
            </p>
            <div className="mt-1 pl-4 text-xs text-gray-700 space-y-0.5">
                {tool.quantity && <p><span className="font-semibold">Qty:</span> {tool.quantity}</p>}
                {tool.unitPrice && <p><span className="font-semibold">Unit Price:</span> {tool.unitPrice}</p>}
                {tool.totalPrice && <p><span className="font-semibold">Total:</span> {tool.totalPrice}</p>}
                {tool.sourcingLink && <p><span className="font-semibold">Source:</span> <a href={tool.sourcingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tool.sourcingLink}</a></p>}
            </div>
        </div>
    );

    const SourcingInfoDisplay: React.FC<{tool: Tool}> = ({ tool }) => {
        const info = sourcingData.get(tool.partNumber);
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
    
    const SourcedToolItem: React.FC<{tool: Tool}> = ({ tool }) => (
         <div className="py-2 px-3 border-b border-gray-200 break-inside-avoid-page">
            <p className="font-semibold text-gray-800">{tool.name}</p>
            <p className="text-sm text-gray-600">
                <span className="font-medium">P/N:</span> {tool.partNumber} | <span className="font-medium">Mfg:</span> {tool.manufacturer}
            </p>
            <SourcingInfoDisplay tool={tool} />
        </div>
    );

    return (
        <div className="p-4 font-sans text-gray-900">
            <header className="flex justify-between items-center pb-4 mb-6 border-b-2 border-gray-400">
                <div>
                    <h1 className="text-4xl font-extrabold flex items-center gap-3">
                        <ToolIcon className="w-9 h-9" /> 
                        Tooling Report
                    </h1>
                     {aircraftName && <h2 className="text-2xl font-normal text-gray-700">{aircraftName}</h2>}
                    <p className="text-gray-600">Generated on {reportDate}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">Comparison Summary</p>
                    <p>Total Needed: {result.available.length + result.onOrder.length + result.shortage.length}</p>
                    <p>Available: {result.available.length}</p>
                    <p>On Order: {result.onOrder.length}</p>
                    <p>Shortages: {result.shortage.length}</p>
                </div>
            </header>

            <main>
                <Section title="Available in Inventory" count={result.available.length} color="bg-green-600">
                    <div className="space-y-1">
                        {result.available.map((tool, i) => <ToolItem key={`${tool.partNumber}-${i}`} tool={tool} />)}
                    </div>
                </Section>
                 <Section title="On Order (Purchasing Plan)" count={result.onOrder.length} color="bg-purple-600">
                    <div className="space-y-1">
                        {result.onOrder.map((tool, i) => <OnOrderItem key={`${tool.partNumber}-${i}`} tool={tool} />)}
                    </div>
                </Section>
                <Section title="Shortages (Action Required)" count={result.shortage.length} color="bg-red-600">
                    <div className="space-y-1">
                        {isQuickReport
                            ? result.shortage.map((tool, i) => <ToolItem key={`${tool.partNumber}-${i}`} tool={tool} />)
                            : result.shortage.map((tool, i) => <SourcedToolItem key={`${tool.partNumber}-${i}`} tool={tool} />)
                        }
                    </div>
                </Section>

                {result.suggestedSubstitutions && result.suggestedSubstitutions.length > 0 && (
                    <Section title="Suggested Substitutions" count={result.suggestedSubstitutions.length} color="bg-yellow-600">
                        <div className="space-y-3">
                            {result.suggestedSubstitutions.map((sub, i) => (
                                <div key={i} className="py-2 px-3 border-b border-gray-200 break-inside-avoid-page">
                                    <p className="text-sm">
                                        <span className="font-semibold text-gray-800">Needed:</span> {sub.neededTool.name} ({sub.neededTool.partNumber})
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-semibold text-gray-800">Suggest:</span> {sub.suggestedTool.name} ({sub.suggestedTool.partNumber})
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
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