import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CountdownTimerProps {
  targetTime: number;       // UNIX timestamp (in seconds)
  label: string;            // Label under the countdown
  phase?: string;           // Optional phase label (e.g., "Reveal Phase")
  onExpire?: () => void;    // Optional callback on expiry
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTime, label, phase = '', onExpire }) => {
  const { isDark } = useTheme();
  const [timeLeft, setTimeLeft] = useState(targetTime - Math.floor(Date.now() / 1000));


useEffect(() => {
  const now = Math.floor(Date.now() / 1000);
  const initialRemaining = targetTime - now;

  if (initialRemaining <= 0) {
    setTimeLeft(0);
    if (onExpire) onExpire();
    return; // Don't start interval
  }

  const timer = setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = targetTime - now;
    setTimeLeft(remaining);

    if (remaining <= 0 && onExpire) {
      clearInterval(timer);
      setTimeLeft(0);
      onExpire();
    }
  }, 1000);

  return () => clearInterval(timer);
}, [targetTime, onExpire]);



  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Expired';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft <= 3600 && timeLeft > 0;

  return (
    <div
      className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl w-fit ${
        isDark
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-white/50 border border-gray-200'
      }`}
    >
      {phase && (
        <span
          className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded ${
            isDark ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-800'
          }`}
        >
          {phase}
        </span>
      )}

      <div className="flex items-center gap-2">
        <Clock
          className={`w-4 h-4 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
        />
        <div className="text-right">
          <p
            className={`text-xs font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {label}
          </p>
          <p
            className={`text-lg font-mono font-bold ${
              isExpired
                ? 'text-red-500'
                : isUrgent
                ? 'text-yellow-500 animate-pulse'
                : isDark
                ? 'text-white'
                : 'text-gray-900'
            }`}
          >
            {formatTime(timeLeft)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
