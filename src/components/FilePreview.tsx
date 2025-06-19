import React from 'react';
import { FileText, Database, Activity, Eye, BarChart3, FileJson, FileSpreadsheet } from 'lucide-react';
import { ParsedData } from '../utils/fileParser';

interface FilePreviewProps {
  parsedData: ParsedData;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ parsedData, onClose }) => {
  const getFileIcon = () => {
    switch (parsedData.type) {
      case 'csv': return <Database className="h-5 w-5 text-green-400" />;
      case 'xes': return <Activity className="h-5 w-5 text-blue-400" />;
      case 'json': return <FileJson className="h-5 w-5 text-yellow-400" />;
      case 'xlsx': return <FileSpreadsheet className="h-5 w-5 text-teal-400" />;
      default: return <FileText className="h-5 w-5 text-purple-400" />;
    }
  };

  const getFileTypeLabel = () => {
    switch (parsedData.type) {
      case 'csv': return 'CSV Data';
      case 'xes': return 'XES Process Log';
      case 'json': return 'JSON Data';
      case 'xlsx': return 'XLSX Spreadsheet';
      default: return 'Text File';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getFileIcon()}
          <div>
            <h3 className="text-lg font-semibold text-white">{getFileTypeLabel()}</h3>
            <p className="text-sm text-purple-200">{parsedData.metadata?.fileName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-purple-300 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* File Metadata */}
      <div className="bg-white/10 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-purple-200">
            Size: {parsedData.metadata?.fileSize ? 
              (parsedData.metadata.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown'}
          </span>
          {parsedData.preview?.totalRows && (
            <span className="text-green-300">
              Rows: {parsedData.preview.totalRows.toLocaleString()}
            </span>
          )}
          {parsedData.preview?.totalEvents && (
            <span className="text-blue-300">
              Events: {parsedData.preview.totalEvents.toLocaleString()}
            </span>
          )}
          {parsedData.preview?.sheetName && (
            <span className="text-teal-300">
              Sheet: {parsedData.preview.sheetName}
            </span>
          )}
        </div>
      </div>

      {/* CSV or XLSX Preview */}
      {(parsedData.type === 'csv' || parsedData.type === 'xlsx') && parsedData.preview && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-white">Data Preview</span>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/20">
                  {parsedData.preview.headers?.map((header, index) => (
                    <th key={index} className={`text-left p-2 font-medium ${
                      parsedData.type === 'xlsx' ? 'text-teal-300' : 'text-green-300'
                    }`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.preview.rows?.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-white/10">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-2 text-white">
                        {cell.length > 20 ? `${cell.substring(0, 20)}...` : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.preview.totalRows && parsedData.preview.totalRows > 5 && (
              <p className="text-xs text-purple-300 mt-2">
                Showing 5 of {parsedData.preview.totalRows.toLocaleString()} rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* XES Preview */}
      {parsedData.type === 'xes' && parsedData.preview && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Process Events Preview</span>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {parsedData.preview.events?.slice(0, 10).map((event, index) => (
                <div key={index} className="bg-white/10 rounded p-2 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-blue-300 font-medium">
                      {event.concept_name || 'Unknown Activity'}
                    </span>
                    <span className="text-purple-300">
                      Case: {event.case_id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-white/70">
                    {event.timestamp && (
                      <span>⏰ {new Date(event.timestamp).toLocaleString()}</span>
                    )}
                    {event.resource && (
                      <span>👤 {event.resource}</span>
                    )}
                    {event.lifecycle_transition && (
                      <span>🔄 {event.lifecycle_transition}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {parsedData.preview.totalEvents && parsedData.preview.totalEvents > 10 && (
              <p className="text-xs text-purple-300 mt-2">
                Showing 10 of {parsedData.preview.totalEvents.toLocaleString()} events
              </p>
            )}
          </div>
        </div>
      )}

      {/* Text Preview */}
      {parsedData.type === 'text' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Content Preview</span>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 max-h-32 overflow-y-auto">
            <pre className="text-xs text-white whitespace-pre-wrap">
              {parsedData.content.substring(0, 500)}
              {parsedData.content.length > 500 && '...'}
            </pre>
          </div>
        </div>
      )}

      {/* JSON Preview */}
      {parsedData.type === 'json' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FileJson className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">JSON Content Preview</span>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 max-h-48 overflow-y-auto">
            <pre className="text-xs text-white whitespace-pre-wrap">
              {parsedData.content.length > 1000 
                ? `${parsedData.content.substring(0, 1000)}...` 
                : parsedData.content
              }
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePreview;