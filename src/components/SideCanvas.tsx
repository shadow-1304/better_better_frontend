import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Download, Copy, Code, Table, BarChart3, FileText, Calendar, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CanvasData {
  type: 'table' | 'chart' | 'code' | 'diagram' | 'text' | 'reminders';
  title?: string;
  content: any;
  metadata?: {
    language?: string;
    rows?: number;
    columns?: number;
    chartType?: string;
  };
}

interface SideCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  data: CanvasData | null;
}

const SideCanvas: React.FC<SideCanvasProps> = ({ isOpen, onClose, data }) => {
  const { theme } = useTheme();
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllReminders, setShowAllReminders] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    console.log('SideCanvas props:', { isOpen, data });
    if (isOpen && data) {
      console.log('SideCanvas should render with data:', data);
    }
  }, [isOpen, data]);

  const canvasBg = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const headerBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  const handleCopy = async () => {
    if (!data) return;
    
    try {
      let textToCopy = '';
      if (data.type === 'reminders' && Array.isArray(data.content)) {
        textToCopy = data.content.join('\n');
      } else if (data.type === 'table' && Array.isArray(data.content)) {
        textToCopy = data.content.map(row => 
          Object.values(row).join('\t')
        ).join('\n');
      } else if (data.type === 'code') {
        textToCopy = data.content;
      } else {
        textToCopy = JSON.stringify(data.content, null, 2);
      }
      
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    
    const element = document.createElement('a');
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    if (data.type === 'reminders') {
      content = data.content.join('\n');
      filename = `${data.title || 'reminders'}.txt`;
    } else if (data.type === 'table') {
      content = data.content.map((row: any) => 
        Object.values(row).join(',')
      ).join('\n');
      filename = `${data.title || 'table'}.csv`;
      mimeType = 'text/csv';
    } else if (data.type === 'code') {
      content = data.content;
      filename = `${data.title || 'code'}.${data.metadata?.language || 'txt'}`;
    } else {
      content = JSON.stringify(data.content, null, 2);
      filename = `${data.title || 'data'}.json`;
      mimeType = 'application/json';
    }

    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getIcon = () => {
    if (!data) return <FileText size={16} />;
    
    switch (data.type) {
      case 'reminders': return <Calendar size={16} />;
      case 'table': return <Table size={16} />;
      case 'chart': return <BarChart3 size={16} />;
      case 'code': return <Code size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const renderContent = () => {
    if (!data) {
      console.log('No data for SideCanvas');
      return <div className="text-center py-8 opacity-60">No data available</div>;
    }
    
    console.log('Rendering content for type:', data.type, 'Content:', data.content);
    switch (data.type) {
      case 'reminders':
        return <RemindersCanvas data={data.content} theme={theme} showAll={showAllReminders} currentPage={currentPage} itemsPerPage={itemsPerPage} />;
      case 'table':
        return <TableCanvas data={data.content} theme={theme} />;
      case 'chart':
        return <ChartCanvas data={data.content} theme={theme} chartType={data.metadata?.chartType} />;
      case 'code':
        return <CodeCanvas code={data.content} language={data.metadata?.language} theme={theme} />;
      case 'diagram':
        return <DiagramCanvas data={data.content} theme={theme} />;
      default:
        return <TextCanvas content={data.content} theme={theme} />;
    }
  };

  if (!isOpen) {
    console.log('SideCanvas not rendering because isOpen is false');
    return null;
  }

  return (
    <div className={`
      fixed right-0 top-0 h-full z-50 transition-all duration-300 ease-in-out
      ${isMinimized ? 'w-16' : 'w-96 lg:w-[500px]'}
      ${canvasBg} ${borderColor} border-l shadow-2xl border-red-500
    `}>
      {/* Header */}
      <div className={`
        flex items-center justify-between p-4 ${headerBg} ${borderColor}
        border-b sticky top-0 z-10
      `}>
        {!isMinimized && (
          <div className="flex items-center space-x-3 flex-1">
            <div className={`
              p-2 rounded-lg
              ${theme === 'dark' ? 'bg-teal-400 bg-opacity-20 text-teal-400' : 'bg-teal-600 bg-opacity-20 text-teal-600'}
            `}>
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {data?.title || `${data?.type?.charAt(0).toUpperCase()}${data?.type?.slice(1)} View`}
              </h3>
              {data?.metadata && (
                <p className="text-xs opacity-60 truncate">
                  {data.metadata.rows && `${data.metadata.rows} rows`}
                  {data.metadata.columns && ` • ${data.metadata.columns} columns`}
                  {data.metadata.language && `Language: ${data.metadata.language}`}
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-1">
          {!isMinimized && (
            <>
              {data?.type === 'reminders' && (
                <button
                  onClick={() => setShowAllReminders(!showAllReminders)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
                  `}
                  title={showAllReminders ? 'Hide No Upcoming Birthdays' : 'Show All Reminders'}
                >
                  {showAllReminders ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
              <button
                onClick={handleCopy}
                className={`
                  p-2 rounded-lg transition-colors text-xs
                  ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
                `}
                title="Copy content"
              >
                {copied ? (
                  <span className="text-green-500 text-xs">✓</span>
                ) : (
                  <Copy size={14} />
                )}
              </button>
              
              <button
                onClick={handleDownload}
                className={`
                  p-2 rounded-lg transition-colors
                  ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
                `}
                title="Download"
              >
                <Download size={14} />
              </button>
            </>
          )}
          
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className={`
              p-2 rounded-lg transition-colors
              ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
            `}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-200 text-red-600'}
            `}
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="h-[calc(100vh-80px)] overflow-auto p-4">
          {renderContent()}
          {data?.type === 'reminders' && Array.isArray(data.content) && (
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`
                  px-4 py-2 rounded-lg text-sm
                  ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                  ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
                `}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {Math.ceil((showAllReminders ? data.content.length : data.content.filter((r: string) => r.startsWith('Birthday reminder')).length) / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil((showAllReminders ? data.content.length : data.content.filter((r: string) => r.startsWith('Birthday reminder')).length) / itemsPerPage)}
                className={`
                  px-4 py-2 rounded-lg text-sm
                  ${currentPage >= Math.ceil((showAllReminders ? data.content.length : data.content.filter((r: string) => r.startsWith('Birthday reminder')).length) / itemsPerPage) ? 'opacity-50 cursor-not-allowed' : ''}
                  ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
                `}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Minimized state */}
      {isMinimized && (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] space-y-4">
          <div className={`
            p-3 rounded-lg
            ${theme === 'dark' ? 'bg-teal-400 bg-opacity-20 text-teal-400' : 'bg-teal-600 bg-opacity-20 text-teal-600'}
          `}>
            {getIcon()}
          </div>
          <div className="writing-mode-vertical text-xs opacity-60 transform rotate-90">
            Canvas
          </div>
        </div>
      )}
    </div>
  );
};

// Reminders Canvas Component
const RemindersCanvas: React.FC<{ data: string[]; theme: string; showAll: boolean; currentPage: number; itemsPerPage: number }> = ({ data, theme, showAll, currentPage, itemsPerPage }) => {
  console.log('RemindersCanvas data:', data);
  if (!Array.isArray(data) || data.length === 0) {
    console.log('No reminders data available');
    return <div className="text-center py-8 opacity-60">No reminders available</div>;
  }

  const parseReminder = (reminder: string) => {
    console.log('Parsing reminder:', reminder);
    const isUpcoming = reminder.startsWith('Birthday reminder');
    if (isUpcoming) {
      const parts = reminder.split(/:| - /);
      const name = parts[0]?.replace('Birthday reminder for ', '').trim() || 'Unknown';
      const date = parts[1]?.trim() || 'N/A';
      const days = parts[2]?.replace(/\(|\)/g, '').trim() || 'N/A';
      const description = parts[3]?.trim() || '';
      return { isUpcoming: true, name, date, days, description };
    } else {
      const parts = reminder.split('Next birthday:');
      const name = parts[0]?.replace('No upcoming birthday for ', '').replace(' within the next 30 days.', '').trim() || 'Unknown';
      const date = parts[1]?.trim() || 'N/A';
      return { isUpcoming: false, name, date, days: 'N/A', description: '' };
    }
  };

  const filteredData = showAll ? data : data.filter(reminder => reminder.startsWith('Birthday reminder'));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  console.log('Filtered data:', filteredData.length, 'Paginated data:', paginatedData);

  return (
    <div className="space-y-4">
      {paginatedData.map((reminder, index) => {
        const parsed = parseReminder(reminder);
        return (
          <div
            key={index}
            className={`
              p-4 rounded-lg shadow-md
              ${parsed.isUpcoming
                ? theme === 'dark' ? 'bg-teal-900' : 'bg-teal-50'
                : theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
              }
              ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}
            `}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Calendar size={16} className={parsed.isUpcoming ? 'text-teal-500' : 'text-gray-500'} />
              <h4 className="font-semibold text-sm">{parsed.name}</h4>
            </div>
            <p className="text-xs">
              <span className="font-medium">Date:</span> {parsed.date}
            </p>
            <p className="text-xs">
              <span className="font-medium">Days Remaining:</span> {parsed.days}
            </p>
            {parsed.description && (
              <p className="text-xs mt-1 italic">{parsed.description}</p>
            )}
          </div>
        );
      })}
      {filteredData.length === 0 && (
        <div className="text-center py-8 opacity-60">No upcoming birthdays found</div>
      )}
    </div>
  );
};

// Table Canvas Component
const TableCanvas: React.FC<{ data: any[]; theme: string }> = ({ data, theme }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-center py-8 opacity-60">No data available</div>;
  }

  const headers = Object.keys(data[0]);
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className={`
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
            border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`
                ${rowIndex % 2 === 0 
                  ? theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                  : theme === 'dark' ? 'bg-gray-850' : 'bg-gray-50'
                }
                border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}
                hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} transition-colors
              `}
            >
              {headers.map((header, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Code Canvas Component
const CodeCanvas: React.FC<{ code: string; language?: string; theme: string }> = ({ 
  code, 
  language, 
  theme 
}) => {
  return (
    <div className={`
      rounded-lg p-4 font-mono text-sm overflow-x-auto
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
    `}>
      {language && (
        <div className={`
          text-xs mb-2 px-2 py-1 rounded inline-block
          ${theme === 'dark' ? 'bg-gray-700 text-teal-400' : 'bg-gray-200 text-teal-600'}
        `}>
          {language}
        </div>
      )}
      <pre className="whitespace-pre-wrap break-words">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Chart Canvas Component
const ChartCanvas: React.FC<{ data: any; theme: string; chartType?: string }> = ({ 
  data, 
  theme, 
  chartType 
}) => {
  return (
    <div className="text-center py-8">
      <BarChart3 size={48} className={theme === 'dark' ? 'text-teal-400' : 'text-teal-600'} />
      <p className="text-sm opacity-60">
        Chart visualization ({chartType || 'default'})
      </p>
      <p className="text-xs opacity-40 mt-2">
        Chart rendering would be implemented with a charting library
      </p>
    </div>
  );
};

// Diagram Canvas Component
const DiagramCanvas: React.FC<{ data: any; theme: string }> = ({ data, theme }) => {
  return (
    <div className="text-center py-8">
      <FileText size={48} className={theme === 'dark' ? 'text-teal-400' : 'text-teal-600'} />
      <p className="text-sm opacity-60">Diagram visualization</p>
      <p className="text-xs opacity-40 mt-2">
        Diagram rendering would be implemented with a diagramming library
      </p>
    </div>
  );
};

// Text Canvas Component
const TextCanvas: React.FC<{ content: any; theme: string }> = ({ content, theme }) => {
  const displayContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  
  return (
    <div className={`
      rounded-lg p-4 text-sm
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
    `}>
      <pre className="whitespace-pre-wrap break-words font-mono">
        {displayContent}
      </pre>
    </div>
  );
};

export default SideCanvas;