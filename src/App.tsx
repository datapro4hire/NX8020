import React, { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ProcessingSection from './components/ProcessingSection';
import ResultsSection from './components/ResultsSection';
import Footer from './components/Footer';

export interface ProcessingResults {
  llm_response: string;
  ml_prediction: string;
  ml_confidence: number;
  processing_time: {
    llm: number;
    ml: number;
  };
}

function App() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResults | null>(null);

  const handleAnalyze = async (text: string) => {
    setInputText(text);
    setIsProcessing(true);
    setResults(null);

    // Simulate API call to Flask backend
    try {
      // In a real app, this would be: await fetch('/analyze', { method: 'POST', ... })
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time
      
      // Mock results
      const mockResults: ProcessingResults = {
        llm_response: generateMockLLMResponse(text),
        ml_prediction: generateMockMLPrediction(text),
        ml_confidence: Math.random() * 0.3 + 0.7, // 70-100%
        processing_time: {
          llm: Math.random() * 2 + 1, // 1-3 seconds
          ml: Math.random() * 1 + 0.5, // 0.5-1.5 seconds
        }
      };
      
      setResults(mockResults);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockLLMResponse = (text: string): string => {
    const responses = [
      `Based on the input text, I can identify several key themes and sentiments. The content appears to focus on ${text.split(' ').slice(0, 3).join(' ')}... This suggests a ${Math.random() > 0.5 ? 'positive' : 'concerning'} situation that requires ${Math.random() > 0.5 ? 'immediate attention' : 'careful monitoring'}. I recommend analyzing the underlying patterns and implementing appropriate measures to address the identified issues.`,
      `The text analysis reveals important insights about user sentiment and context. The main topics discussed include ${text.split(' ').slice(-3).join(' ')}... This indicates a ${Math.random() > 0.5 ? 'high priority' : 'medium priority'} scenario that should be addressed through targeted interventions and follow-up actions.`,
      `From the provided content, I can extract several meaningful patterns and trends. The language suggests ${Math.random() > 0.5 ? 'urgency' : 'routine processing'} with key indicators pointing toward ${Math.random() > 0.5 ? 'customer satisfaction issues' : 'operational optimization opportunities'}. Further analysis would help determine the most effective response strategy.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateMockMLPrediction = (text: string): string => {
    const predictions = ['Critical', 'High Priority', 'Medium Priority', 'Low Priority', 'Routine'];
    const weights = text.toLowerCase().includes('urgent') || text.toLowerCase().includes('critical') 
      ? [0.4, 0.3, 0.2, 0.08, 0.02] 
      : [0.1, 0.2, 0.4, 0.2, 0.1];
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < predictions.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return predictions[i];
      }
    }
    
    return predictions[2]; // fallback to medium priority
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="relative z-10">
          <Header />
          
          <main className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <InputSection onAnalyze={handleAnalyze} isProcessing={isProcessing} />
                <ProcessingSection isProcessing={isProcessing} />
              </div>
              
              <div>
                <ResultsSection results={results} inputText={inputText} />
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;