/**
 * LatencyIndicator Component
 *
 * Displays connection latency with color-coded status.
 */

import { Wifi, WifiOff } from 'lucide-react';

interface LatencyIndicatorProps {
  latency: number | null;
}

export function LatencyIndicator({ latency }: LatencyIndicatorProps) {
  // Determine color based on latency
  const getLatencyColor = () => {
    if (latency === null) return 'text-gray-600';
    if (latency < 100) return 'text-green-500';
    if (latency < 300) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getLatencyBg = () => {
    if (latency === null) return 'bg-gray-100';
    if (latency < 100) return 'bg-green-50';
    if (latency < 300) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getLatencyBg()}`}>
      {latency !== null ? (
        <Wifi className={`w-4 h-4 ${getLatencyColor()}`} />
      ) : (
        <WifiOff className="w-4 h-4 text-gray-600" />
      )}
      <span className={`text-sm font-medium ${getLatencyColor()}`}>
        {latency !== null ? `${latency}ms` : '...'}
      </span>
    </div>
  );
}
