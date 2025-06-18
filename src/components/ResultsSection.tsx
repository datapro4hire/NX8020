import React from 'react';
import { Brain, BarChart3, Clock, Target, TrendingUp } from 'lucide-react';
import { ProcessingResults } from '../App';

interface ResultsSectionProps {
  results: ProcessingResults | null;
  inputText: string;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ results, inputText }) => {
  if (!results) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-purple-300" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Ready for Analysis</h3>
          <p className="text-purple-200">Submit your text to see dual AI processing results</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (prediction: string) => {
    switch (prediction.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high priority': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium priority': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low priority': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Summary */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-2xl">
        <h3 className="text-sm font-medium text-purple-200 mb-2">Input Text</h3>
        <p className="text-white text-sm bg-white/10 p-3 rounded-lg">
          {inputText.length > 150 ? `${inputText.substring(0, 150)}...` : inputText}
        </p>
      </div>

      {/* LLM Results */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">LLM Analysis</h3>
            <div className="flex items-center space-x-2 text-sm text-purple-200">
              <Clock className="h-3 w-3" />
              <span>{results.processing_time.llm.toFixed(2)}s</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white leading-relaxed">{results.llm_response}</p>
        </div>
      </div>

      {/* ML Results */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">ML Classification</h3>
            <div className="flex items-center space-x-2 text-sm text-blue-200">
              <Clock className="h-3 w-3" />
              <span>{results.processing_time.ml.toFixed(2)}s</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${getPriorityColor(results.ml_prediction)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Priority Classification</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold mb-1">{results.ml_prediction}</div>
            <div className="text-sm opacity-80">
              Confidence: {(results.ml_confidence * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex justify-between text-sm text-white mb-2">
              <span>Confidence Score</span>
              <span>{(results.ml_confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${results.ml_confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {results.processing_time.llm.toFixed(2)}s
            </div>
            <div className="text-sm text-purple-200">LLM Processing</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {results.processing_time.ml.toFixed(2)}s
            </div>
            <div className="text-sm text-blue-200">ML Processing</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;