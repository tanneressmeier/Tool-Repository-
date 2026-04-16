
import React, { useState, useEffect, useMemo } from 'react';
import type { Tool } from '../types';

interface CompanyToolsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
}

// --- ICONS ---

const PrinterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const AdjustmentsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
    </svg>
);

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);

// --- TYPES ---

interface ReportConfig {
    title: string;
    subtitle: string;
    groupByLocation: boolean;
    separateOwnership: boolean;
    sortBy: 'id' | 'value-desc' | 'name-asc';
    columns: {
        id: boolean;
        name: boolean;
        model: boolean;
        manufacturer: boolean;
        serialNumber: boolean;
        calibration: boolean;
        value: boolean;
        location: boolean;
        owner: boolean;
    };
}

// --- MAIN COMPONENT ---

const CompanyToolsReportModal: React.FC<CompanyToolsReportModalProps> = ({ isOpen, onClose, tools }) => {
  const [show, setShow] = useState(false);
  const [view, setView] = useState<'dashboard' | 'builder'>('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportLocation, setReportLocation] = useState<'All' | 'BJC' | 'SLC'>('All');

  // Default Config
  const [config, setConfig] = useState<ReportConfig>({
      title: "Tool Inventory Valuation",
      subtitle: "FULL INVENTORY • ASSET AUDIT",
      groupByLocation: true,
      separateOwnership: true,
      sortBy: 'id',
      columns: {
          id: true,
          name: true,
          model: true,
          manufacturer: true,
          serialNumber: false,
          calibration: true,
          value: true,
          location: false,
          owner: true
      }
  });

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setShow(true));
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
        onClose();
        setView('dashboard'); // Reset view on close
    }, 200);
  };

  // --- DATA PROCESSING FOR DASHBOARD ---
  const stats = useMemo(() => {
    const result = {
        companyTools: [] as Tool[],
        companyCount: 0,
        personnelCount: 0,
        calibratedCount: 0,
        needsCalCount: 0,
        totalValue: 0,
        categoryValues: {} as Record<string, number>
    };

    const getCategory = (t: Tool) => {
        if (t.category && t.category !== 'N/A') return t.category;
        const n = t.name.toLowerCase();
        if (n.includes('jack') || n.includes('stand') || n.includes('dolly') || n.includes('hoist') || n.includes('lift')) return 'Jacking & Lifting';
        if (n.includes('test') || n.includes('meter') || n.includes('gauge') || n.includes('analy') || n.includes('probe')) return 'Test Equipment';
        if (n.includes('wrench') || n.includes('socket') || n.includes('plier') || n.includes('crimp') || n.includes('driver')) return 'Hand Tools';
        if (n.includes('power') || n.includes('charger') || n.includes('batt')) return 'Power & Battery';
        if (n.includes('kit') || n.includes('set')) return 'Kits';
        return 'General Support';
    };

    tools.forEach(tool => {
        if (!tool.toolId) return;
        const upId = tool.toolId.toUpperCase();
        
        // Filter to include BJC, SLC (TL prefix), and generic SLC prefixes
        const isBjc = upId.startsWith('BJC');
        const isSlc = upId.startsWith('SLC') || upId.startsWith('TL');

        if (!isBjc && !isSlc) return;

        // Apply Location Filter
        if (reportLocation === 'BJC' && !isBjc) return;
        if (reportLocation === 'SLC' && !isSlc) return;

        result.companyTools.push(tool);
        
        const isCompany = tool.owner && tool.owner.toLowerCase().includes('company');
        if (isCompany) result.companyCount++;
        else result.personnelCount++;
        
        const cleanCost = tool.toolCost ? tool.toolCost.replace(/[^0-9.-]+/g, "") : "0";
        const val = parseFloat(cleanCost) || 0;
        result.totalValue += val;

        if (tool.calibrationStatus === 'Good') result.calibratedCount++;
        if (tool.calibrationStatus === 'Needs Calibration') result.needsCalCount++;

        const cat = getCategory(tool);
        result.categoryValues[cat] = (result.categoryValues[cat] || 0) + val;
    });

    // Default sort for dashboard: Prefix then ID Number
    result.companyTools.sort((a, b) => {
        const idA = a.toolId || '';
        const idB = b.toolId || '';
        
        const partsA = idA.split('-');
        const partsB = idB.split('-');
        
        const prefixA = partsA[0];
        const prefixB = partsB[0];
        
        // Sort by prefix first (e.g., BJC vs TL)
        if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
        
        // Then by number
        const numA = parseInt(partsA[1] || '0', 10);
        const numB = parseInt(partsB[1] || '0', 10);
        return numA - numB;
    });

    return result;
  }, [tools, reportLocation]);

  const formatCurrency = (value: number | string) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return '$0.00';
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(num);
  };

  // --- PDF GENERATION ---
  const generatePDF = (action: 'download' | 'print') => {
    setIsGenerating(true);
    try {
        // @ts-ignore
        // Optimization: Enable compression
        const doc = new window.jspdf.jsPDF({ compress: true });
        
        // Optimization: Add Metadata
        doc.setProperties({
            title: config.title,
            subject: config.subtitle,
            author: 'Tool Inventory Checker',
            keywords: 'inventory, aviation, tools, valuation, report',
            creator: 'Tool Inventory Checker (AI Powered)'
        });

        const width = doc.internal.pageSize.getWidth() as number;
        const height = doc.internal.pageSize.getHeight() as number;
        const margin = 14;

        // Logo Helper
        const drawLogo = (x: number, y: number) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            let currentX = x;
            doc.setTextColor(60, 60, 60); doc.text("ELEV", currentX, y); currentX += (doc.getTextWidth("ELEV") as number);
            doc.setTextColor(0, 174, 239); doc.text("A", currentX, y); currentX += (doc.getTextWidth("A") as number);
            doc.setTextColor(60, 60, 60); doc.text("TE", currentX, y); currentX += (doc.getTextWidth("TE") as number);
            doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(120, 120, 120); doc.text("MRO", currentX + 2, y + 1);
        };

        // --- PAGE 1: SUMMARY (Using existing logic but with Config Titles) ---
        drawLogo(margin, 25);
        doc.setFontSize(8); doc.setTextColor(100, 100, 100);
        doc.text(`GENERATED: ${new Date().toLocaleDateString().toUpperCase()}`, width - margin, 25, { align: 'right' });
        doc.setDrawColor(220, 220, 220); doc.line(margin, 35, width - margin, 35);

        doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.setTextColor(45, 55, 72);
        doc.text(config.title, width / 2, 55, { align: 'center' });
        doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.setTextColor(113, 128, 150);
        
        let subTitleText = config.subtitle;
        if (reportLocation !== 'All' && subTitleText.includes("FULL INVENTORY")) {
            subTitleText = subTitleText.replace("FULL INVENTORY", `${reportLocation} INVENTORY`);
        }
        doc.text(subTitleText, width / 2, 63, { align: 'center' });

        // Hero Box
        const boxTop = 75; const boxHeight = 40; const boxWidth = 140; const boxX = (width - boxWidth) / 2;
        doc.setFillColor(235, 248, 255); doc.setDrawColor(66, 153, 225); doc.roundedRect(boxX, boxTop, boxWidth, boxHeight, 3, 3, "FD");
        doc.setFontSize(10); doc.setTextColor(49, 130, 206); doc.text("TOTAL ASSET VALUATION", width / 2, boxTop + 10, { align: 'center' });
        doc.setFont("courier", "bold"); doc.setFontSize(28); doc.setTextColor(44, 82, 130);
        doc.text(formatCurrency(stats.totalValue), width / 2, boxTop + 24, { align: 'center' });

        // Metrics Grid
        const gridTop = 130; const cardW = 80; const cardH = 35; const gap = 15;
        const row1Y = gridTop; const row2Y = gridTop + cardH + gap;
        const col1X = (width / 2) - cardW - (gap / 2); const col2X = (width / 2) + (gap / 2);

        const drawMetric = (x: number, y: number, label: string, value: string, accentColor: string) => {
            doc.setFillColor(255, 255, 255); doc.setDrawColor(226, 232, 240); doc.roundedRect(x, y, cardW, cardH, 2, 2, "FD");
            doc.setFillColor(accentColor); doc.rect(x, y + 5, 4, cardH - 10, "F");
            doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(45, 55, 72); doc.text(value, x + 12, y + 14);
            doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(113, 128, 150); doc.text(label.toUpperCase(), x + 12, y + 26);
        };
        drawMetric(col1X, row1Y, "Company Owned", stats.companyCount.toString(), "#4a5568");
        drawMetric(col2X, row1Y, "Personnel Owned", stats.personnelCount.toString(), "#a0aec0");
        drawMetric(col1X, row2Y, "Calibrated (Good)", stats.calibratedCount.toString(), "#48bb78");
        drawMetric(col2X, row2Y, "Needs Calibration", stats.needsCalCount.toString(), "#f56565");

        // Chart Logic
        const chartY = 230;
        // Explicitly typing the result of Object.entries to [string, number][] to avoid arithmetic errors on 'unknown' types
        const sortedCategories = (Object.entries(stats.categoryValues) as [string, number][]).sort(([, a], [, b]) => b - a).slice(0, 5);
        const maxValue = sortedCategories[0]?.[1] || 1;
        let currentBarY = chartY;
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(100, 116, 139);
        doc.text("VALUATION BY CATEGORY", width / 2, chartY - 5, { align: 'center' });
        
        const chartColors = [[49, 130, 206], [56, 178, 172], [128, 90, 213], [214, 158, 46], [113, 128, 150]];
        sortedCategories.forEach(([cat, val], i) => {
             const color = chartColors[i % chartColors.length];
             doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(80, 80, 80);
             doc.text(cat.length > 18 ? cat.substring(0, 18) + '...' : cat, (width-140)/2, currentBarY + 3.5);
             const barW = (val / maxValue) * (140 - 35 - 25);
             doc.setFillColor(color[0], color[1], color[2]); doc.roundedRect((width-140)/2 + 35, currentBarY, Math.max(barW, 1), 5, 1, 1, "F");
             doc.text(formatCurrency(val), (width-140)/2 + 35 + barW + 2, currentBarY + 3.5);
             currentBarY += 9;
        });

        // --- PAGE 2+: LISTING (DYNAMIC) ---
        doc.addPage();

        // Define Columns
        const availableColumns = [
            { header: "ID", dataKey: "toolId", show: config.columns.id },
            { header: "Tool Name", dataKey: "name", show: config.columns.name },
            { header: "Model / P/N", dataKey: "model", show: config.columns.model },
            { header: "Manufacturer", dataKey: "manufacturer", show: config.columns.manufacturer },
            { header: "Serial #", dataKey: "serialNumber", show: config.columns.serialNumber },
            { header: "Location", dataKey: "location", show: config.columns.location },
            { header: "Owner", dataKey: "owner", show: config.columns.owner },
            { header: "CAL Status", dataKey: "calibrationStatus", show: config.columns.calibration },
            { header: "Value", dataKey: "toolCost", show: config.columns.value }
        ];

        const activeColumns = availableColumns.filter(c => c.show);
        const tableHead = [activeColumns.map(c => c.header)];

        // Helper to Render Table
        const renderToolTable = (tableTitle: string, tableTools: Tool[], startY: number) => {
            if (tableTools.length === 0) return startY;

            // Sort tools for this table
            tableTools.sort((a, b) => {
                if (config.sortBy === 'value-desc') {
                    const valA = parseFloat(a.toolCost?.replace(/[^0-9.-]+/g, "") || "0") || 0;
                    const valB = parseFloat(b.toolCost?.replace(/[^0-9.-]+/g, "") || "0") || 0;
                    return valB - valA;
                } else if (config.sortBy === 'name-asc') {
                    return a.name.localeCompare(b.name);
                } else {
                    // ID default - Prefix then Number
                    const idA = a.toolId || '';
                    const idB = b.toolId || '';
                    const partsA = idA.split('-');
                    const partsB = idB.split('-');
                    const prefixA = partsA[0];
                    const prefixB = partsB[0];
                    
                    if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
                    
                    const numA = parseInt(partsA[1] || '0', 10);
                    const numB = parseInt(partsB[1] || '0', 10);
                    return numA - numB;
                }
            });

            // Prepare Rows
            const tableRows: any[] = [];

            if (config.groupByLocation) {
                const groups: Record<string, Tool[]> = {};
                tableTools.forEach(t => {
                    const loc = (t.location || 'Unassigned').trim().toUpperCase();
                    if (!groups[loc]) groups[loc] = [];
                    groups[loc].push(t);
                });
                const sortedLocs = Object.keys(groups).sort();

                sortedLocs.forEach(loc => {
                    tableRows.push([{ content: `LOCATION: ${loc}`, colSpan: activeColumns.length, styles: { fillColor: [226, 232, 240], fontStyle: 'bold', textColor: [30, 41, 59] } }]);
                    let subtotal = 0;
                    groups[loc].forEach(tool => {
                        const rowData = activeColumns.map(col => {
                            if (col.dataKey === 'toolCost') {
                                const v = parseFloat(tool.toolCost?.replace(/[^0-9.-]+/g, "") || "0") || 0;
                                subtotal += v;
                                return formatCurrency(v);
                            }
                            if (col.dataKey === 'calibrationStatus') {
                                return tool.calibrationStatus === 'Good' ? 'GOOD' : (tool.calibrationStatus === 'Needs Calibration' ? 'NEEDS CAL' : 'N/A');
                            }
                            // @ts-ignore
                            return tool[col.dataKey] || '';
                        });
                        tableRows.push(rowData);
                    });
                    
                    if (config.columns.value) {
                         const valueColIndex = activeColumns.findIndex(c => c.dataKey === 'toolCost');
                         if (valueColIndex !== -1) {
                             const subRow = Array(activeColumns.length).fill('');
                             subRow[valueColIndex] = { content: formatCurrency(subtotal), styles: { fontStyle: 'bold', font: 'courier', halign: 'right' } };
                             if (valueColIndex > 0) subRow[valueColIndex - 1] = { content: 'Subtotal:', styles: { fontStyle: 'bold', halign: 'right' } };
                             tableRows.push(subRow);
                         }
                    }
                });
            } else {
                tableTools.forEach(tool => {
                    const rowData = activeColumns.map(col => {
                        if (col.dataKey === 'toolCost') return tool.toolCost && tool.toolCost !== '0' ? formatCurrency(tool.toolCost) : '-';
                        if (col.dataKey === 'calibrationStatus') return tool.calibrationStatus === 'Good' ? 'GOOD' : (tool.calibrationStatus === 'Needs Calibration' ? 'NEEDS CAL' : 'N/A');
                        // @ts-ignore
                        return tool[col.dataKey] || '';
                    });
                    tableRows.push(rowData);
                });
            }

            // Draw Title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(45, 55, 72);
            doc.text(tableTitle, margin, startY - 4);

            // Draw Table
            // @ts-ignore
            doc.autoTable({
                head: tableHead,
                body: tableRows,
                startY: startY,
                theme: 'plain',
                styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: { bottom: 0.1 } },
                headStyles: { fillColor: [248, 250, 252], textColor: [71, 85, 105], fontStyle: 'bold', lineWidth: { bottom: 0.5, top: 0.5 } },
                margin: { top: 30 },
                didParseCell: (data: any) => {
                    const calIndex = activeColumns.findIndex(c => c.dataKey === 'calibrationStatus');
                    const valIndex = activeColumns.findIndex(c => c.dataKey === 'toolCost');

                    if (data.section === 'body') {
                         if (calIndex !== -1 && data.column.index === calIndex) {
                            if (data.cell.raw === 'GOOD') data.cell.styles.textColor = [22, 163, 74];
                            else if (data.cell.raw === 'NEEDS CAL') data.cell.styles.textColor = [220, 38, 38];
                            else data.cell.styles.textColor = [148, 163, 184];
                         }
                         if (valIndex !== -1 && data.column.index === valIndex) {
                             data.cell.styles.halign = 'right';
                             data.cell.styles.font = 'courier';
                         }
                    }
                },
                didDrawPage: (data: any) => {
                     const pageNum = doc.internal.getNumberOfPages();
                     if (pageNum > 1) {
                         doc.setFont("helvetica", "normal");
                         doc.setFontSize(8); doc.setTextColor(148, 163, 184);
                         doc.line(margin, height - 15, width - margin, height - 15);
                         doc.text(`Page ${pageNum - 1} | Inventory Listing`, width / 2, height - 10, { align: 'center' });
                     }
                }
            });

            // @ts-ignore
            return (doc.lastAutoTable.finalY as number) + 20; // Return new Y position
        };

        let currentY = 35;
        
        if (config.separateOwnership) {
            const companyItems = stats.companyTools.filter(t => t.owner && t.owner.toLowerCase().includes('company'));
            const personnelItems = stats.companyTools.filter(t => !t.owner || !t.owner.toLowerCase().includes('company'));

            if (companyItems.length > 0) {
                currentY = renderToolTable("COMPANY OWNED ASSETS", companyItems, currentY);
            }
            
            // Check if we need a page break for the next section if space is low
            if (currentY > height - 50) {
                doc.addPage();
                currentY = 35;
            }
            
            if (personnelItems.length > 0) {
                renderToolTable("PERSONNEL OWNED ASSETS", personnelItems, currentY);
            }
        } else {
            renderToolTable("ALL ASSETS", stats.companyTools, currentY);
        }


        if (action === 'download') doc.save(`Inventory_Report_${reportLocation}.pdf`);
        else window.open(doc.output('bloburl'), '_blank');

    } catch (error) {
        console.error(error);
        alert("Error generating report");
    } finally {
        setIsGenerating(false);
    }
  };

  // --- RENDER BUILDER ---
  const renderBuilder = () => (
      <div className="h-full flex flex-col bg-gray-900 rounded-b-2xl">
          <div className="flex-grow p-8 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-8">
                  
                  {/* Section 1: General */}
                  <section className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">1. General Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Report Title</label>
                              <input 
                                type="text" 
                                value={config.title}
                                onChange={e => setConfig({...config, title: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                              />
                          </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Subtitle</label>
                              <input 
                                type="text" 
                                value={config.subtitle}
                                onChange={e => setConfig({...config, subtitle: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                              />
                          </div>
                      </div>
                  </section>

                   {/* Section 2: Columns */}
                   <section className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">2. Select Data Columns</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {Object.entries(config.columns).map(([key, checked]) => (
                              <label key={key} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-700/50 transition-colors">
                                  <input 
                                    type="checkbox" 
                                    checked={checked}
                                    onChange={e => setConfig({
                                        ...config, 
                                        columns: { ...config.columns, [key]: e.target.checked }
                                    })}
                                    className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
                                  />
                                  <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              </label>
                          ))}
                      </div>
                   </section>

                   {/* Section 3: Organization */}
                   <section className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">3. Organization & Sorting</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">Sort Order</label>
                              <select 
                                value={config.sortBy}
                                onChange={e => setConfig({...config, sortBy: e.target.value as any})}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                              >
                                  <option value="id">ID (Default)</option>
                                  <option value="value-desc">Value (High to Low)</option>
                                  <option value="name-asc">Tool Name (A-Z)</option>
                              </select>
                          </div>
                          <div className="flex flex-col gap-4 pt-4">
                              <label className="flex items-center space-x-3 cursor-pointer">
                                   <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${config.separateOwnership ? 'bg-purple-600' : 'bg-gray-700'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="sr-only" 
                                            checked={config.separateOwnership} 
                                            onChange={e => setConfig({...config, separateOwnership: e.target.checked})}
                                        />
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${config.separateOwnership ? 'translate-x-5' : 'translate-x-0'}`} />
                                   </div>
                                   <span className="text-white font-medium">Separate Company vs. Personnel</span>
                              </label>

                              <label className="flex items-center space-x-3 cursor-pointer">
                                   <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${config.groupByLocation ? 'bg-cyan-600' : 'bg-gray-700'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="sr-only" 
                                            checked={config.groupByLocation} 
                                            onChange={e => setConfig({...config, groupByLocation: e.target.checked})}
                                        />
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${config.groupByLocation ? 'translate-x-5' : 'translate-x-0'}`} />
                                   </div>
                                   <span className="text-white font-medium">Group Tools by Location</span>
                              </label>
                          </div>
                      </div>
                   </section>
              </div>
          </div>

          <div className="p-6 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
              <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <ArrowLeftIcon className="w-5 h-5" /> Back to Preview
              </button>
              <div className="flex gap-4">
                    <button 
                        onClick={() => generatePDF('download')}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors shadow-lg font-bold"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        {isGenerating ? 'Processing...' : 'Download Custom Report'}
                    </button>
              </div>
          </div>
      </div>
  );

  // --- RENDER DASHBOARD ---
  const renderDashboard = () => (
    <div className="flex-grow overflow-auto p-6 bg-gray-900/50">
        {/* Visual Dashboard within Modal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg text-white border border-blue-500/30">
                    <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">Total Valuation</p>
                    <p className="text-3xl font-bold font-mono tracking-tight">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Ownership Split</p>
                    <div className="flex justify-between items-end">
                    <div>
                        <p className="text-3xl font-bold text-white">{stats.companyCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Company</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-gray-500">{stats.personnelCount}</p>
                        <p className="text-xs text-gray-600 mt-1">Personnel</p>
                    </div>
                    </div>
            </div>
                <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-green-500 shadow-md">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Calibrated (Good)</p>
                    <p className="text-3xl font-bold text-white">{stats.calibratedCount}</p>
            </div>
                <div className="bg-gray-800 p-6 rounded-xl border-l-4 border-red-500 shadow-md">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Needs Calibration</p>
                    <p className="text-3xl font-bold text-white">{stats.needsCalCount}</p>
            </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
                <h3 className="text-gray-300 font-medium">Preview Data ({stats.companyTools.length} items)</h3>
                <span className="text-xs text-gray-500 italic">Default view: ID Sort</span>
            </div>
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900 text-gray-400">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Tool Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Model</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Manufacturer</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">CAL Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Value</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800">
                    {stats.companyTools.slice(0, 20).map((tool, idx) => (
                        <tr key={tool.toolId || idx} className="hover:bg-gray-700/50 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{tool.toolId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 group-hover:text-white">{tool.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{tool.model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{tool.manufacturer}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tool.calibrationStatus === 'Good' ? 'bg-green-900/30 text-green-400 border border-green-700/50' : (tool.calibrationStatus === 'Needs Calibration' ? 'bg-red-900/30 text-red-400 border border-red-700/50' : 'bg-gray-700 text-gray-400')}`}>
                                    {tool.calibrationStatus === 'Good' ? 'GOOD' : (tool.calibrationStatus === 'Needs Calibration' ? 'NEEDS CAL' : 'N/A')}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-cyan-300">
                                {tool.toolCost && tool.toolCost !== '0' ? formatCurrency(tool.toolCost) : '-'}
                            </td>
                        </tr>
                    ))}
                    {stats.companyTools.length > 20 && (
                         <tr>
                             <td colSpan={6} className="px-6 py-4 text-center text-gray-500 text-sm italic bg-gray-900/30">
                                 ...and {stats.companyTools.length - 20} more items
                             </td>
                         </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );


  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 transition-opacity duration-200 ease-out ${show ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
        <div className={`bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col transition-all duration-200 ease-out ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800 rounded-t-2xl">
                <div>
                    <h2 className="text-2xl font-bold text-white">{view === 'dashboard' ? 'Valuation Dashboard' : 'Report Builder'}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {view === 'dashboard' ? 'Overview of Company Owned Assets (Full Inventory)' : 'Configure PDF Output Settings'}
                    </p>
                </div>
                
                {/* Location Filter Control */}
                {view === 'dashboard' && (
                    <div className="bg-gray-900 p-1 rounded-lg flex items-center border border-gray-700">
                        <button 
                            onClick={() => setReportLocation('All')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${reportLocation === 'All' ? 'bg-cyan-700 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setReportLocation('BJC')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${reportLocation === 'BJC' ? 'bg-cyan-700 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                        >
                            BJC
                        </button>
                        <button 
                            onClick={() => setReportLocation('SLC')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${reportLocation === 'SLC' ? 'bg-cyan-700 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                        >
                            SLC
                        </button>
                    </div>
                )}

                <div className="flex gap-3">
                    {view === 'dashboard' && (
                        <>
                            <button 
                                onClick={() => setView('builder')}
                                className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-cyan-900/50 font-semibold"
                            >
                                <AdjustmentsIcon className="w-5 h-5" />
                                Customize Report
                            </button>
                             <button onClick={handleClose} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors">
                                Close
                            </button>
                        </>
                    )}
                    {view === 'builder' && (
                         <button onClick={handleClose} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors">
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {view === 'dashboard' ? renderDashboard() : renderBuilder()}
        </div>
    </div>
  );
};

export default CompanyToolsReportModal;
