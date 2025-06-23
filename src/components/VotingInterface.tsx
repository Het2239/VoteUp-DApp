import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, CheckCircle, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getVotingContract } from '../utils/contract';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface Candidate {
  id: number;
  name: string;
  party: string;
  wallet: string;
  voteCount: number;
  approved: boolean;
}

interface VotingInterfaceProps {
  candidates: Candidate[];
  contractAddress: string;
  onVoteSubmitted: () => void;
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({ 
  candidates, 
  contractAddress, 
  onVoteSubmitted 
}) => {
  const { isDark } = useTheme();
  const { provider, signer } = useWeb3();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);

  const handleVote = async () => {
    if (!selectedCandidate || !signer) return;

    setVoting(true);
    try {
      const contract = getVotingContract(contractAddress, provider!, signer);
      
      toast.loading('Submitting your vote...', { id: 'vote' });
      const tx = await contract.vote(selectedCandidate);
      await tx.wait();
      
      toast.success('Vote submitted successfully!', { id: 'vote' });
      
      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      onVoteSubmitted();
      
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error.message || 'Failed to submit vote', { id: 'vote' });
    } finally {
      setVoting(false);
    }
  };

  const approvedCandidates = candidates.filter(c => c.approved);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Cast Your Vote
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Select a candidate to vote for. You can only vote once.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvedCandidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedCandidate === candidate.id
                ? isDark
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-purple-500 bg-purple-50'
                : isDark
                  ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  : 'border-gray-200 bg-white/50 hover:border-gray-300'
            }`}
            onClick={() => setSelectedCandidate(candidate.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedCandidate === candidate.id
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600'
                    : isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                }`}>
                  <User className={`w-6 h-6 ${
                    selectedCandidate === candidate.id
                      ? 'text-white'
                      : isDark
                        ? 'text-gray-400'
                        : 'text-gray-600'
                  }`} />
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
              
              {selectedCandidate === candidate.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedCandidate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={handleVote}
            disabled={voting}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
          >
            <Vote className="w-5 h-5" />
            {voting ? 'Submitting Vote...' : 'Submit Vote'}
          </button>
          
          <p className={`text-sm mt-2 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            You are voting for: <span className="font-medium">
              {approvedCandidates.find(c => c.id === selectedCandidate)?.name}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default VotingInterface;