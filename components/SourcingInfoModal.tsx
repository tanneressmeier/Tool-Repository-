import React, { useState, useEffect } from 'react';
import type { Tool, SourcingInfo, SourcingInfoLink } from '../types';

// Icons
const PriceIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.28-.659 2.003-.659c.768 0 1.536.219 2.242.659.879.659 2.22.659 3.099 0l.879-.659M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.28-.659 2.003-.659c.768 0 1.536.219 2.242.659.879.659 2.22.659 3.099 0l.879-.659" /></svg>;
const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>;
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>;

interface SourcingInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    tool: Tool | null;
    sourcingInfo: SourcingInfo | { status: 'loading' | 'error', message?: string } | null;
}

const SourcingInfoModal: React.FC<SourcingInfoModalProps> = ({ isOpen, onClose, tool, sourcingInfo }) => {
    const [show, setShow] = useState(false);
    const [activeTab, setActiveTab] = useState<'purchase' | 'rental'>('purchase');
    
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setShow(true));
        }
    }, [isOpen]);

    useEffect(() => {
        // When a new tool is selected, reset the tab to purchase
        if (tool) {
            setActiveTab('purchase');
        }
    }, [tool]);

    const handleClose = () => {
        setShow(false);
        setTimeout(() => onClose(), 200); // Animation duration
    };

    if (!isOpen) return null;

    const isLoading = sourcingInfo && 'status' in sourcingInfo && sourcingInfo.status === 'loading';
    const isError = sourcingInfo && 'status' in sourcingInfo && sourcingInfo.status === 'error';
    const hasData = sourcingInfo && !('status' in sourcingInfo);
    
    const info = hasData ? sourcingInfo as SourcingInfo : null;

    const hasPurchaseLinks = info?.purchaseLinks && info.purchaseLinks.length > 0;
    const hasRentalLinks = info?.rentalLinks && info.rentalLinks.length > 0;

    const LinksList: React.FC<{links: SourcingInfoLink[]}> = ({ links }) => (
        <ul className="space-y-2">
            {links.map((link, i) => (
                <li key={i}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between bg-gray-900/50 hover:bg-gray-700/50 p-3 rounded-lg transition-colors">
                        <span className="font-medium text-gray-300 group-hover:text-cyan-300">{link.sourceName}</span>
                        <ExternalLinkIcon className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
                    </a>
                </li>
            ))}
        </ul>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                    <p className="mt-4 text-gray-300">AI is searching the web for sourcing options...</p>
                </div>
            );
        }

        if (isError) {
             const errorInfo = sourcingInfo as { status: 'error', message?: string };
             return <div className="p-10 text-center text-red-400">{errorInfo.message || 'An error occurred while fetching data.'}</div>;
        }

        if (hasData && info) {
            return (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg bg-gray-900/50 p-3 rounded-lg">
                        <PriceIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                        <span className="font-semibold text-gray-400">Est. Price:</span>
                        <span className="text-white font-bold">{info.estimatedPrice}</span>
                    </div>

                    <div>
                        <div className="border-b border-gray-600 mb-2">
                            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('purchase')}
                                    className={`${activeTab === 'purchase' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                                >
                                    Purchase ({info.purchaseLinks?.length || 0})
                                </button>
                                <button
                                    onClick={() => setActiveTab('rental')}
                                    className={`${activeTab === 'rental' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                                >
                                    Rental ({info.rentalLinks?.length || 0})
                                </button>
                            </nav>
                        </div>
                        <div className="pt-2">
                            {activeTab === 'purchase' && (hasPurchaseLinks ? <LinksList links={info.purchaseLinks} /> : <p className="text-gray-500 text-sm p-2">No purchase links found.</p>)}
                            {activeTab === 'rental' && (hasRentalLinks ? <LinksList links={info.rentalLinks} /> : <p className="text-gray-500 text-sm p-2">No rental links found.</p>)}
                        </div>
                    </div>

                     {info.sourcingNotes && (
                        <div className="flex items-start gap-3 text-sm bg-gray-900/50 p-3 rounded-lg">
                            <InfoIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-300">Sourcing Notes</h4>
                                <p className="text-gray-400 italic">{info.sourcingNotes}</p>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        
        return <div className="p-10 text-center text-gray-500">No data available.</div>;
    };

    return (
        <div 
            className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-5 border-b border-gray-700">
                    <h2 id="modal-title" className="text-xl font-bold text-white">Sourcing Details</h2>
                    {tool && (
                        <p className="text-sm text-gray-400 mt-1">{tool.name} | P/N: {tool.partNumber}</p>
                    )}
                </header>

                <div className="flex-grow p-5 overflow-y-auto">
                    {renderContent()}
                </div>

                <footer className="flex-shrink-0 flex justify-end items-center gap-3 p-5 border-t border-gray-700 bg-gray-800/50 rounded-b-2xl">
                    <button onClick={handleClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SourcingInfoModal;
