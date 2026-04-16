import React, { useState, useEffect } from 'react';
import type { Tool } from '../types';

interface ShortageReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
}

const ShortageReportModal: React.FC<ShortageReportModalProps> = ({ isOpen, onClose, tools }) => {
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [copyStatus, setCopyStatus] = useState<string>('Copy to Clipboard');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Select all tools by default when the modal opens or tools change
      const allToolIdentifiers = new Set(tools.map(t => t.model + t.name));
      setSelectedTools(allToolIdentifiers);
      // Trigger animation
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen, tools]);
  
  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 200); // Animation duration
  };

  if (!isOpen) {
    return null;
  }

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedTools(new Set(tools.map(t => t.model + t.name)));
    } else {
      setSelectedTools(new Set());
    }
  };

  const handleSelectTool = (toolIdentifier: string, isChecked: boolean) => {
    const newSelection = new Set(selectedTools);
    if (isChecked) {
      newSelection.add(toolIdentifier);
    } else {
      newSelection.delete(toolIdentifier);
    }
    setSelectedTools(newSelection);
  };
  
  const getSelectedTools = () => {
    return tools.filter(t => selectedTools.has(t.model + t.name));
  };

  const handleExportCsv = () => {
    const selected = getSelectedTools();
    if (selected.length === 0) return;

    const headers = 'Tool Name,Manufacturer,Model';
    const csvRows = selected.map(t =>
      `"${t.name.replace(/"/g, '""')}","${t.manufacturer.replace(/"/g, '""')}","${t.model.replace(/"/g, '""')}"`
    );
    const csvContent = `${headers}\n${csvRows.join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = 'shortage_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = () => {
    const selected = getSelectedTools();
    if (selected.length === 0) return;

    const textContent = selected.map(t => `${t.name}\t${t.manufacturer}\t${t.model}`).join('\n');
    navigator.clipboard.writeText(`Tool Name\tManufacturer\tModel\n${textContent}`).then(() => {
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy to Clipboard'), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
      setCopyStatus('Failed to Copy');
      setTimeout(() => setCopyStatus('Copy to Clipboard'), 2000);
    });
  };

  const handlePrint = () => {
    const selected = getSelectedTools();
    if (selected.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Shortage Report</title>');
      printWindow.document.write('<style>body{font-family: Arial, sans-serif; margin: 20px;} h1{text-align: center; color: #333;} table{width: 100%; border-collapse: collapse; margin-top: 20px;} th, td{border: 1px solid #ddd; padding: 10px; text-align: left;} th{background-color: #f2f2f2;}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h1>Shortage Report</h1>');
      printWindow.document.write('<table><thead><tr><th>Tool Name</th><th>Manufacturer</th><th>Model</th></tr></thead><tbody>');
      selected.forEach(t => {
        printWindow.document.write(`<tr><td>${t.name}</td><td>${t.manufacturer}</td><td>${t.model}</td></tr>`);
      });
      printWindow.document.write('</tbody></table>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
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
        className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-5 border-b border-gray-700">
          <h2 id="modal-title" className="text-2xl font-bold text-white">Export Shortage Report</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-grow p-5 overflow-y-auto">
          <div className="flex items-center mb-4 px-2">
            <input
              type="checkbox"
              id="select-all"
              className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600"
              checked={tools.length > 0 && selectedTools.size === tools.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <label htmlFor="select-all" className="ml-3 block text-sm font-medium text-gray-300">
              Select All ({selectedTools.size} / {tools.length} selected)
            </label>
          </div>
          <ul className="space-y-2">
            {tools.map((tool, index) => {
              const toolIdentifier = tool.model + tool.name;
              return (
              <li key={index} className="bg-gray-900/50 rounded-lg p-3 flex items-center">
                <input
                  type="checkbox"
                  id={`tool-${index}`}
                  className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600"
                  checked={selectedTools.has(toolIdentifier)}
                  onChange={(e) => handleSelectTool(toolIdentifier, e.target.checked)}
                />
                <label htmlFor={`tool-${index}`} className="ml-4 flex-grow cursor-pointer">
                  <p className="font-medium text-gray-200">{tool.name}</p>
                  <p className="text-sm text-gray-400">
                    {tool.manufacturer !== 'N/A' && `${tool.manufacturer} | `}Model: {tool.model}
                  </p>
                </label>
              </li>
            )})}
          </ul>
        </div>

        <footer className="flex flex-col sm:flex-row justify-end items-center gap-3 p-5 border-t border-gray-700 bg-gray-800/50 rounded-b-2xl">
          <button onClick={handleCopyToClipboard} disabled={selectedTools.size === 0} className="w-full sm:w-auto text-sm bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors">
            {copyStatus}
          </button>
          <button onClick={handlePrint} disabled={selectedTools.size === 0} className="w-full sm:w-auto text-sm bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors">
            Print Report
          </button>
          <button onClick={handleExportCsv} disabled={selectedTools.size === 0} className="w-full sm:w-auto text-sm bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors">
            Export to CSV
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ShortageReportModal;