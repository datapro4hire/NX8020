import React from 'react';
import { Brain, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-white/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Dual Stack</h1>
              <p className="text-purple-200 text-sm">LLM + ML Processing Engine</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Ollama Ready</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Local Processing</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;