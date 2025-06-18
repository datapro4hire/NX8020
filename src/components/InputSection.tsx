import React, { useState, useCallback } from 'react';
import { Upload, Type, Send, FileText, Database, Activity } from 'lucide-react';
import { parseFile, ParsedData } from '../utils/fileParser';
import FilePreview from './FilePreview';

interface InputSectionProps {
  onAnalyze: (text: string, fileData?: ParsedData) => void;
  isProcessing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isProcessing }) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textToAnalyze = parsedData ? parsedData.content : inputText.trim();
    if (textToAnalyze && !isProcessing) {
      onAnalyze(textToAnalyze, parsedData || undefined);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    const allowedExtensions = ['txt', 'csv', 'xes'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setParseError('Please upload a .txt, .csv, or .xes file');
      return;
    }

    setIsParsingFile(true);
    setParseError(null);
    setParsedData(null);

    try {
      const parsed = await parseFile(file);
      setParsedData(parsed);
      setInputText('');
      setActiveTab('text');
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse file');
    } finally {
      setIsParsingFile(false);
    }
  };

  const clearFile = () => {
    setParsedData(null);
    setParseError(null);
    setInputText('');
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'csv': return <Database className="h-4 w-4" />;
      case 'xes': return <Activity className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const sampleTexts = [
    "Process mining analysis shows bottlenecks in customer service workflow with average wait times exceeding 2 hours.",
    "Manufacturing process data indicates critical inefficiencies in quality control stage affecting overall throughput.",
    "Healthcare patient flow analysis reveals optimization opportunities in emergency department triage processes."
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-6">
          <Type className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Input Processing</h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'text'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            <Type className="h-4 w-4" />
            <span>Text Input</span>
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'file'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>File Upload</span>
          </button>
        </div>

        {activeTab === 'text' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Show file info if file is loaded */}
            {parsedData && (
              <div className="bg-white/10 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getFileTypeIcon(parsedData.type)}
                    <span className="text-sm text-white">
                      {parsedData.metadata?.fileName} loaded
                    </span>
                    <span className="text-xs text-purple-300">
                      ({parsedData.type.toUpperCase()})
                    </span>
                    {parsedData.type === 'xes' && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        Process Mining Ready
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="text-purple-300 hover:text-white text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                {parsedData ? 'Processed content ready for analysis' : 'Enter text for analysis'}
              </label>
              <textarea
                value={parsedData ? parsedData.content.substring(0, 500) + (parsedData.content.length > 500 ? '...' : '') : inputText}
                onChange={(e) => !parsedData && setInputText(e.target.value)}
                placeholder={parsedData ? 'File content loaded - ready to analyze' : 'Paste your text here for LLM and ML analysis...'}
                className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                disabled={isProcessing || !!parsedData}
                readOnly={!!parsedData}
              />
            </div>
            
            {!parsedData && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-purple-300">Quick samples:</span>
                {sampleTexts.map((sample, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setInputText(sample)}
                    className="text-xs bg-white/10 hover:bg-white/20 text-purple-200 px-2 py-1 rounded-md transition-all"
                    disabled={isProcessing}
                  >
                    Sample {index + 1}
                  </button>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={(!inputText.trim() && !parsedData) || isProcessing}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isProcessing ? 'Processing...' : 'Analyze Content'}</span>
            </button>
          </form>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? 'border-purple-400 bg-purple-500/20'
                : 'border-white/30 hover:border-purple-400/50'
            }`}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                {isParsingFile ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <Upload className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">
                  {isParsingFile ? 'Processing file...' : 'Drop your file here'}
                </p>
                <p className="text-purple-300 text-sm">
                  Supports .txt, .csv, and .xes files
                </p>
              </div>
              
              {/* File type indicators */}
              <div className="flex justify-center space-x-4 text-xs">
                <div className="flex items-center space-x-1 text-purple-300">
                  <FileText className="h-3 w-3" />
                  <span>TXT</span>
                </div>
                <div className="flex items-center space-x-1 text-green-300">
                  <Database className="h-3 w-3" />
                  <span>CSV</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-300">
                  <Activity className="h-3 w-3" />
                  <span>XES</span>
                </div>
              </div>

              <input
                type="file"
                accept=".txt,.csv,.xes"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isProcessing || isParsingFile}
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-white/10 hover:bg-white/20 text-purple-200 px-4 py-2 rounded-lg cursor-pointer transition-all disabled:opacity-50"
              >
                Choose File
              </label>

              {parseError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{parseError}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* File Preview */}
      {parsedData && (
        <FilePreview 
          parsedData={parsedData} 
          onClose={() => setParsedData(null)} 
        />
      )}
    </div>
  );
};

export default InputSection;