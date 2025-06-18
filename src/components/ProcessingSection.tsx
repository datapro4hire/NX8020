import React from 'react';
import { Brain, BarChart3, Loader2, CheckCircle } from 'lucide-react';

interface ProcessingSectionProps {
  isProcessing: boolean;
}

const ProcessingSection: React.FC<ProcessingSectionProps> = ({ isProcessing }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
      <div className="flex items-center space-x-2 mb-6">
        <Loader2 className={`h-5 w-5 text-purple-400 ${isProcessing ? 'animate-spin' : ''}`} />
        <h2 className="text-xl font-semibold text-white">Processing Pipeline</h2>
      </div>

      <div className="space-y-4">
        {/* LLM Processing */}
        <div className={`p-4 rounded-lg border ${
          isProcessing 
            ? 'border-purple-400 bg-purple-500/20' 
            : 'border-white/20 bg-white/5'
        } transition-all`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isProcessing 
                  ? 'bg-purple-500 animate-pulse' 
                  : 'bg-white/10'
              }`}>
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">LLM Pipeline</h3>
                <p className="text-sm text-purple-200">LangChain + Ollama</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                  <span className="text-sm text-purple-300">Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-300">Ready</span>
                </>
              )}
            </div>
          </div>
          
          {isProcessing && (
            <div className="mt-3">
              <div className="bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-purple-300 mt-1">Generating natural language response...</p>
            </div>
          )}
        </div>

        {/* ML Processing */}
        <div className={`p-4 rounded-lg border ${
          isProcessing 
            ? 'border-blue-400 bg-blue-500/20' 
            : 'border-white/20 bg-white/5'
        } transition-all`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isProcessing 
                  ? 'bg-blue-500 animate-pulse' 
                  : 'bg-white/10'
              }`}>
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">ML Pipeline</h3>
                <p className="text-sm text-blue-200">scikit-learn Model</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                  <span className="text-sm text-blue-300">Analyzing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-300">Ready</span>
                </>
              )}
            </div>
          </div>
          
          {isProcessing && (
            <div className="mt-3">
              <div className="bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full animate-pulse" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-blue-300 mt-1">Computing classification scores...</p>
            </div>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-white/20">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 text-white animate-spin" />
            <span className="text-white text-sm font-medium">Processing your request...</span>
          </div>
          <p className="text-purple-200 text-xs mt-1">Both pipelines are running in parallel for optimal performance</p>
        </div>
      )}
    </div>
  );
};

export default ProcessingSection;