import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, CheckCircle, XCircle, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getVotingContract, getPendingCandidates, getPendingVoters } from '../utils/contract';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  contractAddress: string;
  onDataChange: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ contractAddress, onDataChange }) => {
  const { isDark } = useTheme();
  const { provider, signer } = useWeb3();
  const [pendingCandidates, setPendingCandidates] = useState<any[]>([]);
  const [pendingVoters, setPendingVoters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadPendingRequests();
  }, [contractAddress, provider]);

  const loadPendingRequests = async () => {
    if (!provider || !signer) return;

    try {
      const contract = getVotingContract(contractAddress, provider, signer);
      const [candidates, voters] = await Promise.all([
        getPendingCandidates(contract),
        getPendingVoters(contract)
      ]);

      setPendingCandidates(candidates);
      setPendingVoters(voters);
    } catch (error: any) {
      console.error('Error loading pending requests:', error);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const approveCandidate = async (candidateAddress: string, candidateName: string) => {
    if (!signer) return;

    setProcessing(candidateAddress);
    try {
      const contract = getVotingContract(contractAddress, provider!, signer);
      
      toast.loading(`Approving ${candidateName}...`, { id: 'approve' });
      const tx = await contract.approveCandidate(candidateAddress);
      await tx.wait();
      
      toast.success(`${candidateName} approved as candidate!`, { id: 'approve' });
      loadPendingRequests();
      onDataChange();
      
    } catch (error: any) {
      console.error('Error approving candidate:', error);
      toast.error(error.message || 'Failed to approve candidate', { id: 'approve' });
    } finally {
      setProcessing(null);
    }
  };

  const approveVoter = async (voterAddress: string, voterName: string) => {
    if (!signer) return;

    setProcessing(voterAddress);
    try {
      const contract = getVotingContract(contractAddress, provider!, signer);
      
      toast.loading(`Approving ${voterName}...`, { id: 'approve' });
      const tx = await contract.approveVoter(voterAddress);
      await tx.wait();
      
      toast.success(`${voterName} approved as voter!`, { id: 'approve' });
      loadPendingRequests();
      onDataChange();
      
    } catch (error: any) {
      console.error('Error approving voter:', error);
      toast.error(error.message || 'Failed to approve voter', { id: 'approve' });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className={`w-6 h-6 ${
          isDark ? 'text-purple-400' : 'text-purple-600'
        }`} />
        <h3 className={`text-2xl font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Admin Panel
        </h3>
      </div>

      {/* Pending Candidates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${
          isDark 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white/50 border border-gray-200'
        }`}
      >
        <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <Users className="w-5 h-5" />
          Pending Candidates ({pendingCandidates.length})
        </h4>

        {pendingCandidates.length === 0 ? (
          <p className={`text-center py-8 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            No pending candidate applications
          </p>
        ) : (
          <div className="space-y-3">
            {pendingCandidates.map((candidate, index) => (
              <motion.div
                key={candidate.wallet}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'border-gray-700 bg-gray-800/30' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {candidate.name}
                    </h5>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {candidate.party}
                    </p>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {candidate.wallet}
                    </p>
                  </div>
                  <button
                    onClick={() => approveCandidate(candidate.wallet, candidate.name)}
                    disabled={processing === candidate.wallet}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {processing === candidate.wallet ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pending Voters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 rounded-xl ${
          isDark 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white/50 border border-gray-200'
        }`}
      >
        <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <UserCheck className="w-5 h-5" />
          Pending Voters ({pendingVoters.length})
        </h4>

        {pendingVoters.length === 0 ? (
          <p className={`text-center py-8 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            No pending voter applications
          </p>
        ) : (
          <div className="space-y-3">
            {pendingVoters.map((voter, index) => (
              <motion.div
                key={voter.wallet}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'border-gray-700 bg-gray-800/30' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {voter.name}
                    </h5>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {voter.wallet}
                    </p>
                  </div>
                  <button
                    onClick={() => approveVoter(voter.wallet, voter.name)}
                    disabled={processing === voter.wallet}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {processing === voter.wallet ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPanel;