import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CountdownTimerProps {
  targetTime: number;
  label: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTime, label }) => {
  const { isDark } = useTheme();
  const [timeLeft, setTimeLeft] = useState(targetTime - Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = targetTime - now;
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '00:00:00';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
      isDark 
        ? 'bg-gray-800/50 border border-gray-700' 
        : 'bg-white/50 border border-gray-200'
    }`}>
      <Clock className={`w-4 h-4 ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`} />
      <div className="text-right">
        <p className={`text-xs font-medium ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {label}
        </p>
        <p className={`text-lg font-mono font-bold ${
          timeLeft <= 3600 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {formatTime(timeLeft)}
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;