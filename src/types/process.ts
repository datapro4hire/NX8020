export interface ProcessNode {
  id: string;
  name: string;
  frequency: number;
  avgDuration: number;
  totalDuration: number;
  efficiency: number;
  bottleneckScore: number;
  wasteScore: number;
  type: 'activity' | 'gateway' | 'event';
  subProcesses?: ProcessNode[];
  position?: { x: number; y: number };
  connections?: string[];
}

export interface ProcessEdge {
  source: string;
  target: string;
  frequency: number;
  avgDuration: number;
  efficiency: number;
  bottleneckScore: number;
}

export interface ProcessInsight {
  type: 'bottleneck' | 'waste' | 'efficiency' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: number;
  recommendation: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ProcessAnalysis {
  mainProcesses: ProcessNode[];
  edges: ProcessEdge[];
  insights: ProcessInsight[];
  metrics: {
    totalCases: number;
    avgCaseTime: number;
    totalActivities: number;
    efficiencyScore: number;
    bottleneckCount: number;
    wastePercentage: number;
  };
}