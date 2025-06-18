import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ProcessAnalysis, ProcessNode, ProcessEdge, ProcessInsight } from '../types/process';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, TrendingUp, Zap, Target } from 'lucide-react';

interface ProcessVisualizationProps {
  analysis: ProcessAnalysis;
  onNodeSelect?: (node: ProcessNode) => void;
}

const ProcessVisualization: React.FC<ProcessVisualizationProps> = ({ 
  analysis, 
  onNodeSelect 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<ProcessNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInsights, setShowInsights] = useState(true);

  useEffect(() => {
    if (!svgRef.current || !analysis.mainProcesses.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    const container = svg.append('g');

    // Create force simulation
    const simulation = d3.forceSimulation(analysis.mainProcesses)
      .force('link', d3.forceLink(analysis.edges)
        .id((d: any) => d.id)
        .distance(100)
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create links
    const links = container.selectAll('.link')
      .data(analysis.edges)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', (d: ProcessEdge) => getEdgeColor(d))
      .attr('stroke-width', (d: ProcessEdge) => Math.max(1, Math.sqrt(d.frequency) * 2))
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');

    // Create arrowhead marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#666')
      .attr('stroke', '#666');

    // Create nodes
    const nodes = container.selectAll('.node')
      .data(analysis.mainProcesses)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, ProcessNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add node circles
    nodes.append('circle')
      .attr('r', (d: ProcessNode) => Math.max(15, Math.sqrt(d.frequency) * 3))
      .attr('fill', (d: ProcessNode) => getNodeColor(d))
      .attr('stroke', (d: ProcessNode) => getNodeBorderColor(d))
      .attr('stroke-width', 2);

    // Add node labels
    nodes.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text((d: ProcessNode) => d.name.length > 12 ? d.name.substring(0, 12) + '...' : d.name);

    // Add frequency labels
    nodes.append('text')
      .attr('dy', '1.5em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.8)')
      .attr('font-size', '8px')
      .text((d: ProcessNode) => `${d.frequency}x`);

    // Node click handler
    nodes.on('click', (event, d) => {
      setSelectedNode(d);
      onNodeSelect?.(d);
    });

    // Simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodes
        .attr('transform', (d: ProcessNode) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: ProcessNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: ProcessNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: ProcessNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }, [analysis, onNodeSelect]);

  const getNodeColor = (node: ProcessNode): string => {
    if (node.bottleneckScore > 0.7) return '#ef4444'; // Red for bottlenecks
    if (node.wasteScore > 0.6) return '#f97316'; // Orange for waste
    if (node.efficiency > 0.8) return '#22c55e'; // Green for efficient
    return '#6366f1'; // Default blue
  };

  const getNodeBorderColor = (node: ProcessNode): string => {
    if (node.bottleneckScore > 0.9) return '#dc2626';
    if (node.wasteScore > 0.8) return '#ea580c';
    if (node.efficiency > 0.9) return '#16a34a';
    return '#4f46e5';
  };

  const getEdgeColor = (edge: ProcessEdge): string => {
    if (edge.bottleneckScore > 0.7) return '#ef4444';
    if (edge.efficiency > 0.8) return '#22c55e';
    return '#6b7280';
  };

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.5
    );
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1 / 1.5
    );
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
  };

  const getInsightIcon = (type: ProcessInsight['type']) => {
    switch (type) {
      case 'bottleneck': return <AlertTriangle className="h-4 w-4" />;
      case 'waste': return <Target className="h-4 w-4" />;
      case 'efficiency': return <TrendingUp className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: ProcessInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Process Flow Visualization</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all"
          >
            {showInsights ? 'Hide' : 'Show'} Insights
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <svg
              ref={svgRef}
              width="100%"
              height="600"
              viewBox="0 0 800 600"
              className="border border-white/10 rounded-lg bg-slate-900/50"
            />
          </div>

          {/* Legend */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Legend</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-white">Bottleneck</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-white">Waste</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-white">Efficient</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-white">Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="space-y-4">
          {/* Process Metrics */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Process Metrics</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-purple-200">Total Cases:</span>
                <span className="text-white font-medium">{analysis.metrics.totalCases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Avg Case Time:</span>
                <span className="text-white font-medium">{(analysis.metrics.avgCaseTime / 3600).toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Activities:</span>
                <span className="text-white font-medium">{analysis.metrics.totalActivities}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Efficiency:</span>
                <span className="text-white font-medium">{(analysis.metrics.efficiencyScore * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Bottlenecks:</span>
                <span className="text-red-400 font-medium">{analysis.metrics.bottleneckCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Waste:</span>
                <span className="text-orange-400 font-medium">{analysis.metrics.wastePercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Selected Node Details */}
          {selectedNode && (
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-3">Selected Process</h3>
              <div className="space-y-2 text-xs">
                <div className="font-medium text-white">{selectedNode.name}</div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Frequency:</span>
                  <span className="text-white">{selectedNode.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Avg Duration:</span>
                  <span className="text-white">{selectedNode.avgDuration.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Efficiency:</span>
                  <span className="text-white">{(selectedNode.efficiency * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Bottleneck Score:</span>
                  <span className={selectedNode.bottleneckScore > 0.7 ? 'text-red-400' : 'text-white'}>
                    {(selectedNode.bottleneckScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Waste Score:</span>
                  <span className={selectedNode.wasteScore > 0.6 ? 'text-orange-400' : 'text-white'}>
                    {(selectedNode.wasteScore * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Insights */}
          {showInsights && (
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-3">Process Insights</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analysis.insights.slice(0, 5).map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getSeverityColor(insight.severity)}`}
                  >
                    <div className="flex items-start space-x-2">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium mb-1">{insight.title}</div>
                        <div className="text-xs opacity-80 mb-2">{insight.description}</div>
                        <div className="text-xs font-medium">
                          Impact: {insight.impact.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessVisualization;