import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Election } from '../utils/database';

interface ElectionCardProps {
  election: Election;
}

const ElectionCard: React.FC<ElectionCardProps> = ({ election }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const getElectionStatus = () => {
    const now = Date.now() / 1000;
    if (!election.active) return 'ended';
    if (election.startTime > now) return 'upcoming';
    if (election.endTime < now) return 'ended';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'yellow';
      case 'active': return 'green';
      case 'ended': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    const now = Date.now() / 1000;
    const status = getElectionStatus();
    
    if (status === 'upcoming') {
      const diff = election.startTime - now;
      if (diff > 86400) return `${Math.floor(diff / 86400)}d`;
      if (diff > 3600) return `${Math.floor(diff / 3600)}h`;
      return `${Math.floor(diff / 60)}m`;
    } else if (status === 'active') {
      const diff = election.endTime - now;
      if (diff > 86400) return `${Math.floor(diff / 86400)}d`;
      if (diff > 3600) return `${Math.floor(diff / 3600)}h`;
      return `${Math.floor(diff / 60)}m`;
    }
    return 'Ended';
  };

  const status = getElectionStatus();
  const statusColor = getStatusColor(status);
  const timeRemaining = getTimeRemaining();

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 cursor-pointer ${
        isDark 
          ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
          : 'bg-white/50 border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => navigate(`/election/${election.contractAddress}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold truncate ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {election.name}
          </h3>
          <p className={`text-sm mt-1 truncate ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {election.description}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          statusColor === 'green' 
            ? 'bg-green-100 text-green-800' 
            : statusColor === 'yellow'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {status === 'active' && <CheckCircle className="w-3 h-3" />}
          {status === 'upcoming' && <Clock className="w-3 h-3" />}
          {status === 'ended' && <XCircle className="w-3 h-3" />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className={`w-4 h-4 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            {formatDate(election.startTime)} - {formatDate(election.endTime)}
          </span>
        </div>

        {status !== 'ended' && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className={`w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              {status === 'upcoming' ? 'Starts in' : 'Ends in'} {timeRemaining}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Users className={`w-4 h-4 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            Contract: {election.contractAddress.slice(0, 6)}...{election.contractAddress.slice(-4)}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isDark 
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}>
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </div>
    </motion.div>
  );
};

export default ElectionCard;