import React, { useState } from 'react';
import { ProcessNode, ProcessInsight } from '../types/process';
import { ChevronDown, ChevronRight, AlertTriangle, Target, TrendingUp, Clock, Users, Activity } from 'lucide-react';

interface ProcessDrillDownProps {
  selectedNode: ProcessNode;
  insights: ProcessInsight[];
}

const ProcessDrillDown: React.FC<ProcessDrillDownProps> = ({ selectedNode, insights }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const nodeInsights = insights.filter(insight => insight.nodeId === selectedNode.id);

  const getPerformanceColor = (score: number, isInverted = false) => {
    if (isInverted) {
      if (score > 0.8) return 'text-red-400';
      if (score > 0.6) return 'text-orange-400';
      if (score > 0.4) return 'text-yellow-400';
      return 'text-green-400';
    } else {
      if (score > 0.8) return 'text-green-400';
      if (score > 0.6) return 'text-yellow-400';
      if (score > 0.4) return 'text-orange-400';
      return 'text-red-400';
    }
  };

  const generateSubProcesses = (node: ProcessNode) => {
    // Mock subprocess generation based on the main process
    const subProcesses = [
      {
        name: `${node.name} - Preparation`,
        duration: node.avgDuration * 0.3,
        frequency: node.frequency,
        efficiency: node.efficiency * 0.9,
        bottleneckScore: node.bottleneckScore * 0.7
      },
      {
        name: `${node.name} - Execution`,
        duration: node.avgDuration * 0.5,
        frequency: node.frequency,
        efficiency: node.efficiency * 1.1,
        bottleneckScore: node.bottleneckScore * 1.2
      },
      {
        name: `${node.name} - Validation`,
        duration: node.avgDuration * 0.2,
        frequency: node.frequency * 0.8,
        efficiency: node.efficiency * 0.8,
        bottleneckScore: node.bottleneckScore * 0.9
      }
    ];

    return subProcesses;
  };

  const subProcesses = generateSubProcesses(selectedNode);

  const SectionHeader: React.FC<{ title: string; section: string; icon: React.ReactNode }> = ({ title, section, icon }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span className="font-medium text-white">{title}</span>
      </div>
      {expandedSections.has(section) ? (
        <ChevronDown className="h-4 w-4 text-purple-300" />
      ) : (
        <ChevronRight className="h-4 w-4 text-purple-300" />
      )}
    </button>
  );

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Process Deep Dive</h2>
        <p className="text-purple-200 text-sm">Detailed analysis of {selectedNode.name}</p>
      </div>

      <div className="space-y-4">
        {/* Overview Section */}
        <div>
          <SectionHeader 
            title="Overview" 
            section="overview" 
            icon={<Activity className="h-4 w-4 text-blue-400" />} 
          />
          {expandedSections.has('overview') && (
            <div className="mt-3 p-4 bg-white/5 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-purple-200 text-sm">Total Executions:</span>
                    <span className="text-white font-medium">{selectedNode.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200 text-sm">Average Duration:</span>
                    <span className="text-white font-medium">{selectedNode.avgDuration.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200 text-sm">Total Time Spent:</span>
                    <span className="text-white font-medium">{(selectedNode.totalDuration / 3600).toFixed(1)}h</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-purple-200 text-sm">Efficiency Score:</span>
                    <span className={`font-medium ${getPerformanceColor(selectedNode.efficiency)}`}>
                      {(selectedNode.efficiency * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200 text-sm">Bottleneck Risk:</span>
                    <span className={`font-medium ${getPerformanceColor(selectedNode.bottleneckScore, true)}`}>
                      {(selectedNode.bottleneckScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200 text-sm">Waste Level:</span>
                    <span className={`font-medium ${getPerformanceColor(selectedNode.wasteScore, true)}`}>
                      {(selectedNode.wasteScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sub-processes Section */}
        <div>
          <SectionHeader 
            title="Sub-processes" 
            section="subprocesses" 
            icon={<Target className="h-4 w-4 text-green-400" />} 
          />
          {expandedSections.has('subprocesses') && (
            <div className="mt-3 space-y-3">
              {subProcesses.map((subprocess, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{subprocess.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-purple-300" />
                      <span className="text-sm text-purple-200">{subprocess.duration.toFixed(1)}s</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-purple-200">Frequency:</span>
                      <div className="text-white font-medium">{subprocess.frequency}</div>
                    </div>
                    <div>
                      <span className="text-purple-200">Efficiency:</span>
                      <div className={`font-medium ${getPerformanceColor(subprocess.efficiency)}`}>
                        {(subprocess.efficiency * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-purple-200">Bottleneck:</span>
                      <div className={`font-medium ${getPerformanceColor(subprocess.bottleneckScore, true)}`}>
                        {(subprocess.bottleneckScore * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Performance bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-purple-200 mb-1">
                      <span>Performance</span>
                      <span>{(subprocess.efficiency * 100).toFixed(0)}%</span>
                    </div>
                    <div className="bg-white/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          subprocess.efficiency > 0.8 ? 'bg-green-500' :
                          subprocess.efficiency > 0.6 ? 'bg-yellow-500' :
                          subprocess.efficiency > 0.4 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${subprocess.efficiency * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights Section */}
        {nodeInsights.length > 0 && (
          <div>
            <SectionHeader 
              title="Process Insights" 
              section="insights" 
              icon={<TrendingUp className="h-4 w-4 text-yellow-400" />} 
            />
            {expandedSections.has('insights') && (
              <div className="mt-3 space-y-3">
                {nodeInsights.map((insight, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        insight.severity === 'critical' ? 'bg-red-500/20' :
                        insight.severity === 'high' ? 'bg-orange-500/20' :
                        insight.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                      }`}>
                        {insight.type === 'bottleneck' && <AlertTriangle className="h-4 w-4 text-red-400" />}
                        {insight.type === 'waste' && <Target className="h-4 w-4 text-orange-400" />}
                        {insight.type === 'efficiency' && <TrendingUp className="h-4 w-4 text-green-400" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">{insight.title}</h4>
                        <p className="text-sm text-purple-200 mb-2">{insight.description}</p>
                        <div className="bg-white/10 rounded-lg p-2">
                          <p className="text-xs text-white font-medium">Recommendation:</p>
                          <p className="text-xs text-purple-200 mt-1">{insight.recommendation}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-purple-300">Impact Score:</span>
                          <span className={`font-medium ${
                            insight.impact > 80 ? 'text-red-400' :
                            insight.impact > 60 ? 'text-orange-400' :
                            insight.impact > 40 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {insight.impact.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recommendations Section */}
        <div>
          <SectionHeader 
            title="Optimization Recommendations" 
            section="recommendations" 
            icon={<Users className="h-4 w-4 text-purple-400" />} 
          />
          {expandedSections.has('recommendations') && (
            <div className="mt-3 space-y-3">
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                <h4 className="font-medium text-white mb-2">Priority Actions</h4>
                <ul className="space-y-2 text-sm text-purple-200">
                  {selectedNode.bottleneckScore > 0.7 && (
                    <li className="flex items-start space-x-2">
                      <span className="text-red-400">•</span>
                      <span>Address bottleneck by increasing resource allocation or automating manual steps</span>
                    </li>
                  )}
                  {selectedNode.wasteScore > 0.6 && (
                    <li className="flex items-start space-x-2">
                      <span className="text-orange-400">•</span>
                      <span>Reduce waste by eliminating unnecessary steps and optimizing resource utilization</span>
                    </li>
                  )}
                  {selectedNode.efficiency < 0.6 && (
                    <li className="flex items-start space-x-2">
                      <span className="text-yellow-400">•</span>
                      <span>Improve efficiency through process standardization and training</span>
                    </li>
                  )}
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400">•</span>
                    <span>Monitor performance metrics and establish continuous improvement cycles</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessDrillDown;