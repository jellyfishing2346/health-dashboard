import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { HealthMetric } from '../../types/health';

interface MetricCardProps {
  metric: HealthMetric;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-600">{metric.label}</h4>
        <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
          {getTrendIcon()}
        </div>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold text-gray-900">
          {metric.value > 0 ? metric.value : '--'}
        </span>
        <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
      </div>
    </div>
  );
};
