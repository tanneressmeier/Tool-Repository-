import React, { useState, useEffect } from 'react';
import type { Tool } from '../types';

interface CostAnalysisDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Tool | null;
  onReanalyze: (tool: Tool) => void;
}

const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>;


const CostAnalysisDetailsModal: React.FC<CostAnalysisDetailsModalProps> = ({ isOpen, onClose, tool, onReanalyze }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen]);
  
  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };

  if (!isOpen) return null;
  
  const analysis = tool?.costAnalysis;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
        <div className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-xl transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
            <header className="p-5 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Cost Analysis Details</h2>
                {/* FIX: Property 'partNumber' does not exist on type 'Tool'. */}
                <p className="text-sm text-gray-400 mt-1">{tool?.name} (P/N: {tool?.model})</p>
            </header>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {analysis ? (
                    <>
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-400">Average Market Cost</p>
                            <p className="text-2xl font-bold text-cyan-300">{analysis.averageCost}</p>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-400">Analysis Notes</p>
                            <p className="text-gray-300 italic">{analysis.notes || "No notes provided."}</p>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Sources Found ({analysis.sources.length})</h3>
                            {analysis.sources.length > 0 ? (
                                <ul className="space-y-2">
                                    {analysis.sources.map((source, index) => (
                                        <li key={index} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-200">{source.sourceName}</p>
                                                <p className="text-cyan-400 font-mono">{source.price}</p>
                                            </div>
                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm bg-blue-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-blue-500 transition-colors">
                                                Visit <ExternalLinkIcon className="w-4 h-4" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No specific pricing sources were identified by the AI.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">No analysis data available for this tool.</p>
                )}
            </div>
             <footer className="flex justify-between items-center p-4 border-t border-gray-700 bg-gray-800/50">
                <button 
                    type="button" 
                    onClick={() => { if(tool) { onReanalyze(tool); handleClose(); } }} 
                    className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-500 transition-colors"
                >
                    Re-analyze
                </button>
                <button type="button" onClick={handleClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Close</button>
            </footer>
        </div>
    </div>
  );
};

export default CostAnalysisDetailsModal;