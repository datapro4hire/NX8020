import React, { useState, useCallback } from 'react';
import { Upload, Type, Send, FileText } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (text: string) => void;
  isProcessing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isProcessing }) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      onAnalyze(inputText.trim());
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
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setInputText(text);
          setActiveTab('text');
        };
        reader.readAsText(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputText(text);
        setActiveTab('text');
      };
      reader.readAsText(file);
    }
  };

  const sampleTexts = [
    "Customer is complaining about slow response times and requesting immediate escalation.",
    "System performance has degraded significantly over the past 24 hours with multiple service interruptions.",
    "User feedback indicates high satisfaction with the new feature implementation and requests for additional functionality."
  ];

  return (
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
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Enter text for analysis
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here for LLM and ML analysis..."
              className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={isProcessing}
            />
          </div>
          
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

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>{isProcessing ? 'Processing...' : 'Analyze Text'}</span>
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
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Drop your text file here</p>
              <p className="text-purple-300 text-sm">or click to browse</p>
            </div>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-white/10 hover:bg-white/20 text-purple-200 px-4 py-2 rounded-lg cursor-pointer transition-all"
            >
              Choose File
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputSection;