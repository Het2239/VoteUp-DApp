import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Users, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getVotingContract } from '../utils/contract';
import toast from 'react-hot-toast';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'candidate' | 'voter';
  contractAddress: string;
  onApplicationSubmitted: () => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  type,
  contractAddress,
  onApplicationSubmitted
}) => {
  const { isDark } = useTheme();
  const { provider, signer } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    party: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const contract = getVotingContract(contractAddress, provider!, signer);
      
      let tx;
      if (type === 'candidate') {
        if (!formData.party) {
          toast.error('Please enter your party affiliation');
          setLoading(false);
          return;
        }
        toast.loading('Submitting candidate application...', { id: 'apply' });
        tx = await contract.requestCandidateRegistration(formData.name, formData.party);
      } else {
        toast.loading('Submitting voter application...', { id: 'apply' });
        tx = await contract.requestVoterRegistration(formData.name);
      }
      
      await tx.wait();
      
      toast.success(`${type === 'candidate' ? 'Candidate' : 'Voter'} application submitted successfully!`, { id: 'apply' });
      
      setFormData({ name: '', party: '' });
      onApplicationSubmitted();
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application', { id: 'apply' });
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
              Apply as {type === 'candidate' ? 'Candidate' : 'Voter'}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>

            {type === 'candidate' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Party Affiliation
                </label>
                <input
                  type="text"
                  value={formData.party}
                  onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your party or affiliation"
                  required
                  disabled={loading}
                />
              </div>
            )}

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
                    Application Process
                  </p>
                  <p className={`mt-1 ${
                    isDark ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    Your application will be reviewed by the election administrator. You'll be notified once approved.
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
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  type === 'candidate'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg'
                }`}
                disabled={loading}
              >
                {type === 'candidate' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApplyModal;