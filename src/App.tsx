import React, { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ProcessingSection from './components/ProcessingSection';
import ResultsSection from './components/ResultsSection';
import ProcessVisualization from './components/ProcessVisualization';
import ProcessDrillDown from './components/ProcessDrillDown';
import Footer from './components/Footer';
import { ProcessAnalyzer } from './utils/processAnalyzer';
import { ProcessAnalysis, ProcessNode } from './types/process';
import { ParsedData } from './utils/fileParser';

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
  const [processAnalysis, setProcessAnalysis] = useState<ProcessAnalysis | null>(null);
  const [selectedNode, setSelectedNode] = useState<ProcessNode | null>(null);
  const [parsedFileData, setParsedFileData] = useState<ParsedData | null>(null);

  const handleAnalyze = async (text: string, fileData?: ParsedData) => {
    setInputText(text);
    setIsProcessing(true);
    setResults(null);
    setProcessAnalysis(null);
    setSelectedNode(null);
    setParsedFileData(fileData || null);

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          file_data: fileData
        })
      });

      const data = await response.json();
      
      setResults({
        llm_response: data.llm_response,
        ml_prediction: data.ml_prediction,
        ml_confidence: 0.9, // From model if available
        processing_time: {
          llm: data.llm_time || 1.5,
          ml: data.ml_time || 0.5
        }
      });

      if (data.process_analysis) {
        setProcessAnalysis(data.process_analysis);
      }
    } catch (error) {
      console.error('Processing failed:', error);
      // Fallback to mock data if needed
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockXESFromCSV = (rows: string[][], headers: string[]): any[] => {
    const events: any[] = [];
    
    rows.forEach((row, index) => {
      const caseId = `case_${Math.floor(index / 5) + 1}`;
      const activities = ['Data Collection', 'Data Validation', 'Analysis', 'Review', 'Approval'];
      const activity = activities[index % activities.length];
      
      events.push({
        case_id: caseId,
        concept_name: activity,
        timestamp: new Date(Date.now() - (rows.length - index) * 3600000).toISOString(),
        resource: `Resource_${Math.floor(Math.random() * 5) + 1}`,
        lifecycle_transition: 'complete'
      });
    });
    
    return events;
  };

  const generateMockXESFromJSON = (jsonContent: string): any[] => {
    try {
      const data = JSON.parse(jsonContent);
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
        // Assuming an array of event-like objects
        return data.map((item, index) => ({
          case_id: item.case_id || `json_case_${Math.floor(index / 3) + 1}`,
          concept_name: item.activity || item.concept_name || `Activity ${index + 1}`,
          timestamp: item.timestamp || new Date(Date.now() - (data.length - index) * 1800000).toISOString(),
          resource: item.resource || `Resource_JSON_${(index % 3) + 1}`,
          lifecycle_transition: item.lifecycle_transition || 'complete',
          ...item // include other properties
        }));
      }
    } catch (e) {
      console.warn("Could not parse JSON for mock XES generation, or it's not an array of objects.", e);
    }
    // Fallback if JSON is not in the expected format or parsing fails
    return [{
      case_id: 'json_fallback_case',
      concept_name: 'JSON Data Processed',
      timestamp: new Date().toISOString()
    }];
  };

  const generateMockLLMResponse = (text: string): string => {
    const responses = [
      `Based on the input analysis, I can identify several key patterns and insights. The data suggests ${Math.random() > 0.5 ? 'significant process inefficiencies' : 'opportunities for optimization'} with particular attention needed for ${Math.random() > 0.5 ? 'bottleneck resolution' : 'waste reduction'}. The process flow indicates ${Math.random() > 0.5 ? 'high variability in execution times' : 'consistent performance patterns'} that require targeted interventions.`,
      `The comprehensive analysis reveals important process mining insights. Key findings include ${Math.random() > 0.5 ? 'critical path bottlenecks' : 'resource allocation issues'} and ${Math.random() > 0.5 ? 'workflow inefficiencies' : 'performance optimization opportunities'}. I recommend implementing ${Math.random() > 0.5 ? 'automated monitoring systems' : 'process standardization measures'} to address these challenges.`,
      `From the process data, I can extract meaningful patterns indicating ${Math.random() > 0.5 ? 'suboptimal resource utilization' : 'workflow optimization potential'}. The analysis shows ${Math.random() > 0.5 ? 'significant wait times' : 'processing delays'} in key activities, suggesting the need for ${Math.random() > 0.5 ? 'capacity planning improvements' : 'process reengineering initiatives'}.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateMockMLPrediction = (text: string): string => {
    const predictions = ['Critical Bottleneck', 'High Efficiency', 'Moderate Waste', 'Optimal Flow', 'Process Anomaly'];
    const weights = text.toLowerCase().includes('urgent') || text.toLowerCase().includes('critical') 
      ? [0.4, 0.1, 0.3, 0.1, 0.1] 
      : [0.1, 0.3, 0.2, 0.3, 0.1];
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < predictions.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return predictions[i];
      }
    }
    
    return predictions[2];
  };

  const handleNodeSelect = (node: ProcessNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative">
        <div className="absolute inset-0 opacity-50"></div>
        
        <div className="relative z-10">
          <Header />
          
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="space-y-8">
              {/* Input and Processing Section */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <InputSection onAnalyze={handleAnalyze} isProcessing={isProcessing} />
                  <ProcessingSection isProcessing={isProcessing} />
                </div>
                
                <div>
                  <ResultsSection results={results} inputText={inputText} />
                </div>
              </div>

              {/* Process Visualization Section */}
              {processAnalysis && (
                <div className="space-y-8">
                  <ProcessVisualization 
                    analysis={processAnalysis} 
                    onNodeSelect={handleNodeSelect}
                  />
                  
                  {selectedNode && (
                    <ProcessDrillDown 
                      selectedNode={selectedNode} 
                      insights={processAnalysis.insights}
                    />
                  )}
                </div>
              )}
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;