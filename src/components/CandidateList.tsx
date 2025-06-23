import React from 'react';
import { motion } from 'framer-motion';
import { User, Users, Award } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Candidate {
  id: number;
  name: string;
  party: string;
  wallet: string;
  voteCount: number;
  approved: boolean;
}

interface CandidateListProps {
  candidates: Candidate[];
  contractAddress: string;
  onDataChange: () => void;
}

const CandidateList: React.FC<CandidateListProps> = ({ candidates, contractAddress, onDataChange }) => {
  const { isDark } = useTheme();

  const approvedCandidates = candidates.filter(c => c.approved);

  if (approvedCandidates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center p-8 rounded-xl ${
          isDark 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white/50 border border-gray-200'
        }`}
      >
        <Users className={`w-16 h-16 mx-auto mb-4 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <h3 className={`text-lg font-semibold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          No Candidates Yet
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Candidates will appear here once they are approved by the election administrator.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className={`text-xl font-bold ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Candidates ({approvedCandidates.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvedCandidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl backdrop-blur-sm border transition-all ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                : 'bg-white/50 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600' 
                    : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                }`}>
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {candidate.name}
                  </h4>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {candidate.party}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Award className={`w-5 h-5 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-500'
                }`} />
                <span className={`font-bold text-lg ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {candidate.voteCount}
                </span>
              </div>
            </div>
            
            <div className={`text-xs ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {candidate.wallet.slice(0, 6)}...{candidate.wallet.slice(-4)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CandidateList;