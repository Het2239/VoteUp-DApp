import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Award, Crown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getVotingContract, getResults } from '../utils/contract';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface ElectionResultsProps {
  contractAddress: string;
}

const ElectionResults: React.FC<ElectionResultsProps> = ({ contractAddress }) => {
  const { isDark } = useTheme();
  const { provider } = useWeb3();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [contractAddress, provider]);

  const loadResults = async () => {
    if (!provider) return;

    try {
      const contract = getVotingContract(contractAddress, provider);
      const resultsData = await getResults(contract);
      setResults(resultsData);

      // Celebrate with confetti for the winner
      if (resultsData.winnerName) {
        confetti({
          particleCount: 200,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#06B6D4', '#10B981']
        });
      }
    } catch (error: any) {
      console.error('Error loading results:', error);
      toast.error('Failed to load election results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={`text-center p-8 rounded-xl ${
        isDark 
          ? 'bg-gray-800/50 border border-gray-700' 
          : 'bg-white/50 border border-gray-200'
      }`}>
        <Trophy className={`w-16 h-16 mx-auto mb-4 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
        <h3 className={`text-lg font-semibold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Results Not Available
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Election results will be available after the voting period ends.
        </p>
      </div>
    );
  }

  const totalVotes = results.allCandidates.reduce((sum: number, candidate: any) => sum + candidate.voteCount, 0);
  const sortedCandidates = [...results.allCandidates].sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className="space-y-6">
      {/* Winner Announcement */}
      {results.winnerName && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center p-8 rounded-2xl ${
            isDark 
              ? 'bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border border-purple-600' 
              : 'bg-gradient-to-r from-purple-100 to-cyan-100 border border-purple-300'
          }`}
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Crown className={`w-16 h-16 mx-auto ${
              isDark ? 'text-yellow-400' : 'text-yellow-500'
            }`} />
          </motion.div>
          <h2 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            🎉 Winner Announced! 🎉
          </h2>
          <p className={`text-xl mb-4 ${
            isDark ? 'text-purple-300' : 'text-purple-700'
          }`}>
            {results.winnerName}
          </p>
          <p className={`text-lg ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            With {results.maxVotes} votes ({totalVotes > 0 ? Math.round((results.maxVotes / totalVotes) * 100) : 0}% of total votes)
          </p>
        </motion.div>
      )}

      {/* Results Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-xl overflow-hidden ${
          isDark 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white/50 border border-gray-200'
        }`}
      >
        <div className="p-6">
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Award className="w-5 h-5" />
            Final Results
          </h3>
          
          <div className="space-y-4">
            {sortedCandidates.map((candidate, index) => {
              const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
              const isWinner = candidate.name === results.winnerName;
              
              return (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    isWinner
                      ? isDark
                        ? 'border-yellow-500 bg-yellow-900/20'
                        : 'border-yellow-500 bg-yellow-50'
                      : isDark
                        ? 'border-gray-700 bg-gray-800/30'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-yellow-500 text-white'
                          : index === 1
                            ? 'bg-gray-400 text-white'
                            : index === 2
                              ? 'bg-amber-600 text-white'
                              : isDark
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {candidate.name}
                          {isWinner && <Crown className="w-4 h-4 inline ml-2 text-yellow-500" />}
                        </h4>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {candidate.party}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {candidate.voteCount}
                      </p>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className={`w-full h-2 rounded-full overflow-hidden ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className={`h-full ${
                        isWinner
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                      }`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className={`p-4 rounded-xl text-center ${
          isDark 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white/50 border border-gray-200'
        }`}>
          <Users className={`w-8 h-8 mx-auto mb-2 ${
            isDark ? 'text-blue-400' : 'text-blue-500'
          }`} />
          <p className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {totalVotes}
          </p>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Total Votes
          </p>
        </div>
        
        <div className={`p-4 rounded-xl text-center ${
          isDark 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white/50 border border-gray-200'
        }`}>
          <Award className={`w-8 h-8 mx-auto mb-2 ${
            isDark ? 'text-green-400' : 'text-green-500'
          }`} />
          <p className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {sortedCandidates.length}
          </p>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Candidates
          </p>
        </div>
        
        <div className={`p-4 rounded-xl text-center ${
          isDark 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white/50 border border-gray-200'
        }`}>
          <Trophy className={`w-8 h-8 mx-auto mb-2 ${
            isDark ? 'text-yellow-400' : 'text-yellow-500'
          }`} />
          <p className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {results.maxVotes}
          </p>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Winning Votes
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ElectionResults;