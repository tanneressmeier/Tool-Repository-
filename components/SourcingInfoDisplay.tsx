import React from 'react';
import type { SourcingInfo } from '../types';

interface SourcingInfoDisplayProps {
  info: SourcingInfo | { status: 'loading' | 'error', message?: string };
}

const PriceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.28-.659 2.003-.659c.768 0 1.536.219 2.242.659.879.659 2.22.659 3.099 0l.879-.659M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.28-.659 2.003-.659c.768 0 1.536.219 2.242.659.879.659 2.22.659 3.099 0l.879-.659" /></svg>
);
const PurchaseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.093-.822l.383-1.437c.113-.42-.028-.86-.334-1.172h-.002M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.093-.822l.383-1.437c.113-.42-.028-.86-.334-1.172h-.002M7.5 14.25h11.218m-4.5-8.25c-.247 0-.474.1-6.36.138M7.5 14.25h11.218M15 11.25a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
);
const RentalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
);
const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
);
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
);

const SourcingInfoDisplay: React.FC<SourcingInfoDisplayProps> = ({ info }) => {

  if ('status' in info) {
    if (info.status === 'error') {
      return <div className="mt-3 text-sm text-center text-red-400">{info.message || 'An error occurred.'}</div>;
    }
    return null;
  }

  const hasPurchaseLinks = info.purchaseLinks && info.purchaseLinks.length > 0;
  const hasRentalLinks = info.rentalLinks && info.rentalLinks.length > 0;

  return (
    <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-3">
        <div className="flex items-center gap-2 text-sm">
            <PriceIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="font-semibold text-gray-400">Est. Price:</span>
            <span className="text-gray-200">{info.estimatedPrice}</span>
        </div>

        {hasPurchaseLinks && (
            <div>
                <div className="flex items-center gap-2 text-sm mb-2">
                    <PurchaseIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-400">Purchase Options:</span>
                </div>
                <ul className="pl-7 space-y-1">
                    {info.purchaseLinks.map((link, i) => (
                        <li key={i} className="text-xs">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1.5">
                                {link.sourceName} <ExternalLinkIcon className="w-3 h-3" />
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {hasRentalLinks && (
             <div>
                <div className="flex items-center gap-2 text-sm mb-2">
                    <RentalIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-400">Rental Options:</span>
                </div>
                <ul className="pl-7 space-y-1">
                    {info.rentalLinks.map((link, i) => (
                        <li key={i} className="text-xs">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 hover:underline inline-flex items-center gap-1.5">
                                {link.sourceName} <ExternalLinkIcon className="w-3 h-3" />
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {info.sourcingNotes && (
             <div className="flex items-start gap-2 text-sm">
                <InfoIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                    <span className="font-semibold text-gray-400">Notes:</span>
                    <p className="text-xs text-gray-400 italic">{info.sourcingNotes}</p>
                </div>
            </div>
        )}

    </div>
  );
};

export default SourcingInfoDisplay;
