import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, Clock, Trophy, UserCheck, UserPlus, Vote, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getVotingContract, getElectionInfo, getCandidates, getVoterStatus, getCandidateStatus } from '../utils/contract';
import { electionService } from '../utils/database';
import toast from 'react-hot-toast';
import CountdownTimer from './CountdownTimer';
import CandidateList from './CandidateList';
import VotingInterface from './VotingInterface';
import ElectionResults from './ElectionResults';
import AdminPanel from './AdminPanel';
import ApplyModal from './ApplyModal';

const ElectionDetails: React.FC = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { provider, signer, account, isConnected } = useWeb3();
  
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<{
    isOwner: boolean;
    isCandidate: boolean;
    isVoter: boolean;
    candidateApproved: boolean;
    voterApproved: boolean;
    hasVoted: boolean;
  }>({
    isOwner: false,
    isCandidate: false,
    isVoter: false,
    candidateApproved: false,
    voterApproved: false,
    hasVoted: false
  });
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyType, setApplyType] = useState<'candidate' | 'voter'>('voter');
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'vote' | 'results' | 'admin'>('overview');

  useEffect(() => {
    if (contractAddress && provider) {
      loadElectionData();
    }
  }, [contractAddress, provider, account]);

  const loadElectionData = async () => {
    if (!contractAddress || !provider) return;
    
    try {
      setLoading(true);
      const contract = getVotingContract(contractAddress, provider, signer);
      
      // Get election info
      const electionInfo = await getElectionInfo(contract);
      const owner = await contract.owner();
      const candidatesList = await getCandidates(contract);
      
      setElection({
        ...electionInfo,
        contractAddress,
        owner
      });
      setCandidates(candidatesList);

      // Get user status if connected
      if (account) {
        const [voterStatus, candidateStatus] = await Promise.all([
          getVoterStatus(contract, account),
          getCandidateStatus(contract, account)
        ]);

        setUserStatus({
          isOwner: owner.toLowerCase() === account.toLowerCase(),
          isCandidate: candidateStatus.registered,
          isVoter: voterStatus.registered,
          candidateApproved: candidateStatus.approved,
          voterApproved: voterStatus.approved,
          hasVoted: voterStatus.hasVoted
        });
      }

    } catch (error: any) {
      console.error('Error loading election data:', error);
      toast.error('Failed to load election data');
    } finally {
      setLoading(false);
    }
  };

  const getElectionStatus = () => {
    if (!election) return 'unknown';
    const now = Date.now() / 1000;
    if (!election.active) return 'ended';
    if (election.startTime > now) return 'upcoming';
    if (election.endTime < now) return 'ended';
    return 'active';
  };

  const handleApply = (type: 'candidate' | 'voter') => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    setApplyType(type);
    setShowApplyModal(true);
  };

  const handleApplicationSubmitted = () => {
    setShowApplyModal(false);
    loadElectionData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`text-center p-8 rounded-2xl ${
          isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/50 border border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Election Not Found
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            The election you're looking for doesn't exist or couldn't be loaded.
          </p>
        </div>
      </div>
    );
  }

  const status = getElectionStatus();
  const canVote = status === 'active' && userStatus.voterApproved && !userStatus.hasVoted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            isDark 
              ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300' 
              : 'bg-white/50 hover:bg-gray-100/50 text-gray-700'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Election Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl backdrop-blur-sm border ${
          isDark 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white/50 border-gray-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {election.name}
            </h1>
            <p className={`text-lg mb-4 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {election.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {new Date(election.startTime * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {candidates.length} Candidates
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : status === 'upcoming'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            
            {status !== 'ended' && (
              <CountdownTimer
                targetTime={status === 'upcoming' ? election.startTime : election.endTime}
                label={status === 'upcoming' ? 'Starts in' : 'Ends in'}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* User Status & Actions */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-xl ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700' 
              : 'bg-white/50 border border-gray-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Your Status:
              </span>
              {userStatus.isOwner && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Owner
                </span>
              )}
              {userStatus.candidateApproved && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Candidate
                </span>
              )}
              {userStatus.voterApproved && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Voter
                </span>
              )}
              {userStatus.hasVoted && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  Voted
                </span>
              )}
            </div>

            <div className="flex gap-2 ml-auto">
              {!userStatus.isCandidate && !userStatus.isVoter && status === 'upcoming' && (
                <>
                  <button
                    onClick={() => handleApply('candidate')}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Apply as Candidate
                  </button>
                  <button
                    onClick={() => handleApply('voter')}
                    className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Apply as Voter
                  </button>
                </>
              )}
              
              {canVote && (
                <button
                  onClick={() => setActiveTab('vote')}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                >
                  <Vote className="w-4 h-4" />
                  Cast Vote
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Calendar },
            { id: 'candidates', label: 'Candidates', icon: Users },
            ...(canVote ? [{ id: 'vote', label: 'Vote', icon: Vote }] : []),
            ...(status === 'ended' ? [{ id: 'results', label: 'Results', icon: Trophy }] : []),
            ...(userStatus.isOwner ? [{ id: 'admin', label: 'Admin', icon: Settings }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? isDark 
                    ? 'border-purple-400 text-purple-400' 
                    : 'border-purple-600 text-purple-600'
                  : isDark 
                    ? 'border-transparent text-gray-400 hover:text-gray-300' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className={`p-6 rounded-xl ${
              isDark 
                ? 'bg-gray-800/50 border border-gray-700' 
                : 'bg-white/50 border border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Election Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Starts: {new Date(election.startTime * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ends: {new Date(election.endTime * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl ${
              isDark 
                ? 'bg-gray-800/50 border border-gray-700' 
                : 'bg-white/50 border border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Contract Info
              </h3>
              <div className="space-y-2">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Address:</span> {election.contractAddress}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="font-medium">Owner:</span> {election.owner}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'candidates' && (
          <CandidateList 
            candidates={candidates} 
            contractAddress={contractAddress!}
            onDataChange={loadElectionData}
          />
        )}

        {activeTab === 'vote' && canVote && (
          <VotingInterface 
            candidates={candidates}
            contractAddress={contractAddress!}
            onVoteSubmitted={loadElectionData}
          />
        )}

        {activeTab === 'results' && status === 'ended' && (
          <ElectionResults contractAddress={contractAddress!} />
        )}

        {activeTab === 'admin' && userStatus.isOwner && (
          <AdminPanel 
            contractAddress={contractAddress!}
            onDataChange={loadElectionData}
          />
        )}
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        type={applyType}
        contractAddress={contractAddress!}
        onApplicationSubmitted={handleApplicationSubmitted}
      />
    </div>
  );
};

export default ElectionDetails;