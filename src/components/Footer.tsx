import React from 'react';
import { Github, Code, Zap } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-purple-200">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span className="text-sm">Built with React + TypeScript</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Powered by Flask Backend</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="#" 
              className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="text-sm">View Source</span>
            </a>
            <div className="text-sm text-purple-300">
              Flask API: <code className="bg-white/10 px-2 py-1 rounded">localhost:5000/analyze</code>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-purple-300 text-sm">
            NX8020 - Process Mining - Integrating LLM reasoning with traditional ML classification
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
