import React from 'react';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';

// Icons for the summary card
const ClipboardListIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25-2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-7.5a2.25 2.25 0 0 1 2.25-2.25Z" /></svg>
);
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);

interface ComparisonSummaryProps {
  totalNeeded: number;
  availableCount: number;
  onOrderCount: number;
  shortageCount: number;
}

const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({ totalNeeded, availableCount, onOrderCount, shortageCount }) => {
  const fillRate = totalNeeded > 0 ? (availableCount / totalNeeded) * 100 : 0;

  return (
    <div className="bg-gray-900/50 p-5 rounded-xl shadow-md border border-gray-700 mb-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-300">Inventory Fill Rate</span>
          <span className="text-sm font-bold text-cyan-300">{fillRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-cyan-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${fillRate}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {/* Total Needed */}
        <div>
            <ClipboardListIcon className="w-8 h-8 mx-auto text-gray-400 mb-1" />
            <p className="text-2xl font-bold text-white">{totalNeeded}</p>
            <p className="text-xs text-gray-500 font-medium">Total Needed</p>
        </div>
        
        {/* Available */}
        <div>
            <CheckCircleIcon className="w-8 h-8 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold text-green-400">{availableCount}</p>
            <p className="text-xs text-gray-500 font-medium">Available</p>
        </div>
        
        {/* On Order */}
        <div>
            <ShoppingCartIcon className="w-8 h-8 mx-auto text-purple-400 mb-1" />
            <p className="text-2xl font-bold text-purple-300">{onOrderCount}</p>
            <p className="text-xs text-gray-500 font-medium">On Order</p>
        </div>

        {/* Shortages */}
        <div>
            <XCircleIcon className="w-8 h-8 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold text-red-400">{shortageCount}</p>
            <p className="text-xs text-gray-500 font-medium">Shortages</p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSummary;