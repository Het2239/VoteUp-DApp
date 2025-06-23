import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useNavigate } from 'react-router-dom';
import { getVotingContract, getElectionInfo } from '../utils/contract';
import { electionService } from '../utils/database';
import toast from 'react-hot-toast';

interface JoinElectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinElectionModal: React.FC<JoinElectionModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { provider, account } = useWeb3();
  const navigate = useNavigate();
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !account) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!contractAddress) {
      toast.error('Please enter a contract address');
      return;
    }

    setLoading(true);
    try {
      // Validate contract address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
        throw new Error('Invalid contract address format');
      }

      // Try to get contract info
      const contract = getVotingContract(contractAddress, provider);
      const electionInfo = await getElectionInfo(contract);

      // Check if election exists in database
      let election = await electionService.getElectionByAddress(contractAddress);
      
      if (!election) {
        // Add to database if not exists
        const electionData = {
          name: electionInfo.name,
          description: electionInfo.description,
          contractAddress,
          deployedBy: 'Unknown',
          startTime: electionInfo.startTime,
          endTime: electionInfo.endTime,
          createdAt: Date.now() / 1000,
          active: electionInfo.active
        };
        
        await electionService.addElection(electionData);
      }

      // Navigate to election details
      navigate(`/election/${contractAddress}`);
      onClose();
      
    } catch (error: any) {
      console.error('Error joining election:', error);
      toast.error(error.message || 'Failed to join election. Please check the contract address.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`w-full max-w-md rounded-2xl p-6 ${
            isDark 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Join Election
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Contract Address
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value.trim())}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="0x..."
                required
                disabled={loading}
              />
            </div>

            <div className={`p-4 rounded-xl ${
              isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div className="text-sm">
                  <p className={`font-medium ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    How to Join
                  </p>
                  <p className={`mt-1 ${
                    isDark ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    Enter the contract address of the election you want to join. You can then apply as a candidate or voter.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  'Joining...'
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Join Election
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JoinElectionModal;