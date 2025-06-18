import { ProcessAnalysis, ProcessNode, ProcessEdge, ProcessInsight } from '../types/process';
import { XESEvent } from './fileParser';

export class ProcessAnalyzer {
  private events: XESEvent[] = [];
  private traces: Map<string, XESEvent[]> = new Map();

  constructor(events: XESEvent[]) {
    this.events = events;
    this.groupEventsByCase();
  }

  private groupEventsByCase(): void {
    this.events.forEach(event => {
      const caseId = event.case_id || 'unknown';
      if (!this.traces.has(caseId)) {
        this.traces.set(caseId, []);
      }
      this.traces.get(caseId)!.push(event);
    });

    // Sort events within each trace by timestamp
    this.traces.forEach(trace => {
      trace.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeA - timeB;
      });
    });
  }

  public analyze(): ProcessAnalysis {
    const activityStats = this.calculateActivityStatistics();
    const transitionStats = this.calculateTransitionStatistics();
    const mainProcesses = this.identifyMainProcesses(activityStats);
    const edges = this.createProcessEdges(transitionStats);
    const insights = this.generateInsights(mainProcesses, edges);
    const metrics = this.calculateOverallMetrics(mainProcesses, edges);

    return {
      mainProcesses,
      edges,
      insights,
      metrics
    };
  }

  private calculateActivityStatistics(): Map<string, any> {
    const stats = new Map();

    this.events.forEach(event => {
      const activity = event.concept_name || 'Unknown';
      if (!stats.has(activity)) {
        stats.set(activity, {
          frequency: 0,
          durations: [],
          resources: new Set(),
          cases: new Set()
        });
      }

      const activityStats = stats.get(activity);
      activityStats.frequency++;
      activityStats.cases.add(event.case_id);
      if (event.resource) {
        activityStats.resources.add(event.resource);
      }
    });

    // Calculate durations for each activity
    this.traces.forEach(trace => {
      for (let i = 0; i < trace.length - 1; i++) {
        const current = trace[i];
        const next = trace[i + 1];
        const activity = current.concept_name || 'Unknown';
        
        if (current.timestamp && next.timestamp) {
          const duration = new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime();
          stats.get(activity)?.durations.push(duration);
        }
      }
    });

    return stats;
  }

  private calculateTransitionStatistics(): Map<string, any> {
    const transitions = new Map();

    this.traces.forEach(trace => {
      for (let i = 0; i < trace.length - 1; i++) {
        const current = trace[i].concept_name || 'Unknown';
        const next = trace[i + 1].concept_name || 'Unknown';
        const transitionKey = `${current}->${next}`;

        if (!transitions.has(transitionKey)) {
          transitions.set(transitionKey, {
            source: current,
            target: next,
            frequency: 0,
            durations: []
          });
        }

        const transition = transitions.get(transitionKey);
        transition.frequency++;

        if (trace[i].timestamp && trace[i + 1].timestamp) {
          const duration = new Date(trace[i + 1].timestamp).getTime() - new Date(trace[i].timestamp).getTime();
          transition.durations.push(duration);
        }
      }
    });

    return transitions;
  }

  private identifyMainProcesses(activityStats: Map<string, any>): ProcessNode[] {
    const processes: ProcessNode[] = [];

    activityStats.forEach((stats, activity) => {
      const avgDuration = stats.durations.length > 0 
        ? stats.durations.reduce((a: number, b: number) => a + b, 0) / stats.durations.length 
        : 0;
      
      const totalDuration = stats.durations.reduce((a: number, b: number) => a + b, 0);
      const efficiency = this.calculateEfficiency(stats.frequency, avgDuration, stats.resources.size);
      const bottleneckScore = this.calculateBottleneckScore(avgDuration, stats.frequency);
      const wasteScore = this.calculateWasteScore(avgDuration, efficiency);

      processes.push({
        id: activity.replace(/\s+/g, '_').toLowerCase(),
        name: activity,
        frequency: stats.frequency,
        avgDuration: avgDuration / 1000, // Convert to seconds
        totalDuration: totalDuration / 1000,
        efficiency,
        bottleneckScore,
        wasteScore,
        type: 'activity',
        position: { x: 0, y: 0 }, // Will be calculated later
        connections: []
      });
    });

    // Sort by frequency and take top processes
    return processes
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20); // Limit to top 20 processes
  }

  private createProcessEdges(transitionStats: Map<string, any>): ProcessEdge[] {
    const edges: ProcessEdge[] = [];

    transitionStats.forEach((stats, transitionKey) => {
      const avgDuration = stats.durations.length > 0
        ? stats.durations.reduce((a: number, b: number) => a + b, 0) / stats.durations.length
        : 0;

      const efficiency = this.calculateTransitionEfficiency(stats.frequency, avgDuration);
      const bottleneckScore = this.calculateBottleneckScore(avgDuration, stats.frequency);

      edges.push({
        source: stats.source.replace(/\s+/g, '_').toLowerCase(),
        target: stats.target.replace(/\s+/g, '_').toLowerCase(),
        frequency: stats.frequency,
        avgDuration: avgDuration / 1000,
        efficiency,
        bottleneckScore
      });
    });

    return edges.sort((a, b) => b.frequency - a.frequency);
  }

  private generateInsights(processes: ProcessNode[], edges: ProcessEdge[]): ProcessInsight[] {
    const insights: ProcessInsight[] = [];

    // Identify bottlenecks
    const bottlenecks = processes
      .filter(p => p.bottleneckScore > 0.7)
      .sort((a, b) => b.bottleneckScore - a.bottleneckScore);

    bottlenecks.forEach(process => {
      insights.push({
        type: 'bottleneck',
        severity: process.bottleneckScore > 0.9 ? 'critical' : 'high',
        title: `Bottleneck Detected: ${process.name}`,
        description: `This activity has high duration (${process.avgDuration.toFixed(1)}s avg) and frequency (${process.frequency} occurrences)`,
        impact: process.bottleneckScore * 100,
        recommendation: 'Consider resource allocation optimization or process automation',
        nodeId: process.id
      });
    });

    // Identify waste
    const wasteProcesses = processes
      .filter(p => p.wasteScore > 0.6)
      .sort((a, b) => b.wasteScore - a.wasteScore);

    wasteProcesses.forEach(process => {
      insights.push({
        type: 'waste',
        severity: process.wasteScore > 0.8 ? 'high' : 'medium',
        title: `Waste Identified: ${process.name}`,
        description: `Low efficiency (${(process.efficiency * 100).toFixed(1)}%) with high resource consumption`,
        impact: process.wasteScore * 100,
        recommendation: 'Review process necessity and optimize resource utilization',
        nodeId: process.id
      });
    });

    // Identify efficient processes
    const efficientProcesses = processes
      .filter(p => p.efficiency > 0.8 && p.frequency > 10)
      .sort((a, b) => b.efficiency - a.efficiency);

    efficientProcesses.slice(0, 3).forEach(process => {
      insights.push({
        type: 'efficiency',
        severity: 'low',
        title: `High Efficiency: ${process.name}`,
        description: `Excellent performance with ${(process.efficiency * 100).toFixed(1)}% efficiency`,
        impact: process.efficiency * 100,
        recommendation: 'Use as best practice template for other processes',
        nodeId: process.id
      });
    });

    return insights;
  }

  private calculateEfficiency(frequency: number, avgDuration: number, resourceCount: number): number {
    // Normalize values and calculate efficiency score (0-1)
    const frequencyScore = Math.min(frequency / 100, 1);
    const durationScore = Math.max(0, 1 - (avgDuration / 3600000)); // Normalize against 1 hour
    const resourceScore = Math.min(resourceCount / 5, 1);
    
    return (frequencyScore * 0.4 + durationScore * 0.4 + resourceScore * 0.2);
  }

  private calculateBottleneckScore(avgDuration: number, frequency: number): number {
    // Higher duration and frequency = higher bottleneck score
    const durationScore = Math.min(avgDuration / 3600000, 1); // Normalize against 1 hour
    const frequencyScore = Math.min(frequency / 100, 1);
    
    return (durationScore * 0.7 + frequencyScore * 0.3);
  }

  private calculateWasteScore(avgDuration: number, efficiency: number): number {
    // High duration with low efficiency = high waste
    const durationScore = Math.min(avgDuration / 3600000, 1);
    const inefficiencyScore = 1 - efficiency;
    
    return (durationScore * 0.6 + inefficiencyScore * 0.4);
  }

  private calculateTransitionEfficiency(frequency: number, avgDuration: number): number {
    const frequencyScore = Math.min(frequency / 50, 1);
    const durationScore = Math.max(0, 1 - (avgDuration / 1800000)); // Normalize against 30 minutes
    
    return (frequencyScore * 0.5 + durationScore * 0.5);
  }

  private calculateOverallMetrics(processes: ProcessNode[], edges: ProcessEdge[]): any {
    const totalCases = this.traces.size;
    const totalActivities = processes.length;
    
    const avgCaseTime = Array.from(this.traces.values()).reduce((sum, trace) => {
      if (trace.length < 2) return sum;
      const start = new Date(trace[0].timestamp || 0).getTime();
      const end = new Date(trace[trace.length - 1].timestamp || 0).getTime();
      return sum + (end - start);
    }, 0) / totalCases / 1000; // Convert to seconds

    const efficiencyScore = processes.reduce((sum, p) => sum + p.efficiency, 0) / processes.length;
    const bottleneckCount = processes.filter(p => p.bottleneckScore > 0.7).length;
    const wastePercentage = (processes.filter(p => p.wasteScore > 0.6).length / processes.length) * 100;

    return {
      totalCases,
      avgCaseTime,
      totalActivities,
      efficiencyScore,
      bottleneckCount,
      wastePercentage
    };
  }
}