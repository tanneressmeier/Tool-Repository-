
import React, { useRef, useState, useMemo } from 'react';
import type { Tool } from '../types';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';

interface InventoryCardProps {
  title: string;
  tools: Tool[];
  status: 'master' | 'available' | 'shortage' | 'onOrder';
  onImport?: (file: File) => void;
  isImporting?: boolean;
  onExport?: () => void;
  onSave?: () => void;
  onLoadKit?: () => void;
  onFindSourcing?: (tool: Tool) => void;
  isNeededToolsList?: boolean;
  onFocusManualEntry?: () => void;
  // New prop for handling drops
  onToolDrop?: (tool: Tool, sourceStatus: string, targetStatus: string) => void;
}

const statusStyles = {
  master: {
    bg: 'bg-gray-800/50 border-gray-700',
    titleColor: 'text-white',
    listIcon: 'text-gray-400',
  },
  available: {
    bg: 'bg-green-900/30 border-green-700/50',
    titleColor: 'text-green-300',
    listIcon: 'text-green-400',
  },
  onOrder: {
    bg: 'bg-purple-900/30 border-purple-700/50',
    titleColor: 'text-purple-300',
    listIcon: 'text-purple-400',
  },
  shortage: {
    bg: 'bg-red-900/30 border-red-700/50',
    titleColor: 'text-red-300',
    listIcon: 'text-red-400',
  },
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const ListIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

const EmptyListIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118A2.25 2.25 0 0 0 1 18.122V7.5A2.25 2.25 0 0 1 3.25 5.25h14A2.25 2.25 0 0 1 19.5 7.5v8.168c0 .434-.234.84-.632 1.084a.75.75 0 0 1-.86.173l-2.064-.972-2.064.972a.75.75 0 0 1-.86-.173 2.25 2.25 0 0 0-2.475-2.118 3 3 0 0 0-5.78-1.128Z" />
    </svg>
);

const InventoryCard: React.FC<InventoryCardProps> = ({ title, tools, status, onImport, isImporting, onExport, onSave, onLoadKit, onFindSourcing, isNeededToolsList, onFocusManualEntry, onToolDrop }) => {
  const styles = statusStyles[status];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const COLLAPSE_THRESHOLD = 10;
  const isCollapsible = isNeededToolsList && tools.length > COLLAPSE_THRESHOLD;

  const groupedTools = useMemo(() => {
    // Grouping only applies to "Needed Tools" list when categories are present
    if (status !== 'master' || !tools.some(t => t.category)) {
      return { 'All Tools': tools };
    }
    
    const groups: { [key: string]: Tool[] } = {};
    tools.forEach(tool => {
        const category = tool.category || 'Uncategorized';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(tool);
    });

    // Sort categories
    const sortedCategories = Object.keys(groups).sort();
    const sortedGroups: { [key: string]: Tool[] } = {};
    sortedCategories.forEach(cat => {
      sortedGroups[cat] = groups[cat];
    });

    return sortedGroups;
  }, [tools, status]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, tool: Tool) => {
      if (!onToolDrop) return; // Only allow drag if drops are handled
      // We serialize the tool and its source status
      e.dataTransfer.setData('application/json', JSON.stringify({ tool, sourceStatus: status }));
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      if (!onToolDrop) return;
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
  };

  const handleDragLeave = () => {
      setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      if (!onToolDrop) return;
      e.preventDefault();
      setIsDragOver(false);

      try {
          const data = e.dataTransfer.getData('application/json');
          const { tool, sourceStatus } = JSON.parse(data);

          // Only process if the source status is different from the current card status
          if (sourceStatus !== status) {
              onToolDrop(tool, sourceStatus, status);
          }
      } catch (err) {
          console.error("Failed to process drop", err);
      }
  };

  const getIcon = () => {
    switch (status) {
      case 'available': return <CheckIcon className={styles.listIcon} />;
      case 'onOrder': return <ShoppingCartIcon className={styles.listIcon} />;
      case 'shortage': return <XIcon className={styles.listIcon} />;
      case 'master': return <ListIcon className={styles.listIcon} />;
      default: return null;
    }
  };
  
  const Detail = ({ label, value }: {label: string, value: string | undefined}) => {
    if (!value || value.toLowerCase() === 'n/a' || value.toLowerCase().includes('missing')) return null;
    return (
      <span className="mr-3">
        <span className="font-semibold text-gray-500">{label}:</span> {value}
      </span>
    )
  };

  const renderToolItem = (tool: Tool, index: number) => (
    <li 
      key={`${tool.model}-${tool.serialNumber}-${index}`}
      className={`bg-gray-900/40 p-3 rounded-lg animate-fade-in ${onToolDrop ? 'cursor-grab active:cursor-grabbing hover:bg-gray-800/60' : ''}`}
      style={{ animationDelay: `${Math.min(index * 20, 300)}ms`, opacity: 0 }}
      draggable={!!onToolDrop}
      onDragStart={(e) => handleDragStart(e, tool)}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-1">{getIcon()}</span>
        <div className="flex-grow">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-gray-200 font-medium">{tool.name}</p>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            <Detail label="Mfg" value={tool.manufacturer} />
            <Detail label="Model" value={tool.model} />
            { status !== 'shortage' && status !== 'onOrder' && <Detail label="S/N" value={tool.serialNumber} /> }
          </div>
           {status === 'available' && (
             <div className="text-xs text-gray-500 mt-1">
              <Detail label="Location" value={tool.location} />
              <Detail label="Cal Status" value={tool.calibrationStatus} />
            </div>
           )}
        </div>
        {(status === 'shortage' || status === 'onOrder') && onFindSourcing && (
          <button 
            onClick={() => onFindSourcing(tool)}
            className="text-xs bg-teal-600 text-white font-semibold py-1 px-2.5 rounded-md hover:bg-teal-500 transition-colors flex-shrink-0"
          >
             Sourcing
          </button>
        )}
      </div>
    </li>
  );

  const NeededToolsEmptyState = () => (
    <div className="text-center py-8 px-4 flex flex-col items-center justify-center h-full animate-fade-in">
      <EmptyListIcon className="w-16 h-16 text-gray-600" />
      <h4 className="text-lg font-semibold text-gray-300 mt-4">Your Tool List is Empty</h4>
      <p className="text-gray-500 mt-1 max-w-sm">Get started by adding tools to compare against the master inventory.</p>
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        {onLoadKit && (
          <button
            onClick={onLoadKit}
            className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Load from Kit
          </button>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 transition-colors"
        >
          Import from CSV
        </button>
        <button
          onClick={onFocusManualEntry}
          className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Add Tool Manually
        </button>
      </div>
    </div>
  );

  return (
    <div 
        className={`relative p-5 rounded-xl shadow-md border h-full flex flex-col transition-colors duration-200 ${styles.bg} ${isDragOver ? 'border-dashed border-2 border-cyan-400 bg-gray-800/80' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className={`text-xl font-bold ${styles.titleColor}`}>{title}</h3>
        <div className="flex items-center gap-2">
          {onSave && tools.length > 0 && (
             <button
                onClick={onSave}
                className="bg-blue-600 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-blue-500 transition-colors"
              >
                Save List
              </button>
          )}
          {onLoadKit && (
            <button
                onClick={onLoadKit}
                className="bg-indigo-600 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-indigo-500 transition-colors"
            >
                Load Kit
            </button>
          )}
          {onImport && (
            <>
              <input
                type="file"
                accept=".csv,text/csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={isImporting}
              />
               {!isNeededToolsList || tools.length > 0 ? (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="bg-gray-600 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-wait transition-colors"
                >
                    {isImporting ? 'Importing...' : 'Import CSV'}
                </button>
               ) : null}
            </>
          )}
          {status === 'shortage' && tools.length > 0 && onExport && (
            <button
              onClick={onExport}
              className="bg-cyan-700 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-cyan-600 transition-colors"
            >
              Export Report
            </button>
          )}
        </div>
      </div>
      {isImporting && (
          <div className="absolute inset-0 bg-gray-800/80 flex justify-center items-center rounded-xl z-10">
              <p className="text-white animate-pulse">Processing with AI...</p>
          </div>
      )}
      
      {/* Drag Hint - Only show if this card supports drops and is not being hovered */}
      {onToolDrop && !isDragOver && tools.length === 0 && !isNeededToolsList && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 top-16">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 p-6 rounded-lg">
                  <p className="text-gray-400 font-medium">Drag tools here</p>
              </div>
          </div>
      )}

      <div className="flex-grow min-h-0 overflow-y-auto pr-2 z-10">
        {tools.length > 0 ? (
          <div className={`space-y-2 ${isCollapsible && !isExpanded ? 'max-h-[500px] overflow-y-auto' : ''}`}>
            {Object.entries(groupedTools).map(([category, toolList], groupIndex) => (
              <div key={category} className="animate-fade-in" style={{ animationDelay: `${groupIndex * 50}ms`, opacity: 0 }}>
                {Object.keys(groupedTools).length > 1 && category !== 'All Tools' && (
                   <h4 className="font-semibold text-cyan-400 text-sm mt-4 mb-2 sticky top-0 bg-gray-800/80 backdrop-blur-sm py-1 px-1 rounded-md">{category}</h4>
                )}
                <ul className="space-y-2">
                  {Array.isArray(toolList) && toolList.map((tool, index) => renderToolItem(tool, index))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          isImporting ? null : (isNeededToolsList ? <NeededToolsEmptyState /> : null)
        )}
      </div>
      {isCollapsible && (
        <div className="flex-shrink-0 mt-2 pt-2 border-t border-gray-700/50 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {isExpanded ? 'Show Less' : `Show All ${tools.length} Tools`}
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryCard;