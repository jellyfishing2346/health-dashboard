import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { HealthMetric } from '@/types/health';

interface MetricCardProps { metric: HealthMetric }

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const Icon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  const color = metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600';
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-600">{metric.label}</h4>
        <div className={`flex items-center space-x-1 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold text-gray-900">{metric.value > 0 ? metric.value : '--'}</span>
        <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
      </div>
    </div>
  );
};
