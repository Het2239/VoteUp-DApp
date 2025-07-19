import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, CheckCircle, User, Eye, EyeOff, Lock, Unlock, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getVotingContract } from '../utils/contract';
// import * as ethers from 'ethers';
import { keccak256, solidityPacked } from 'ethers';





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
  const [revealing, setRevealing] = useState(false);
  const [phase, setPhase] = useState<'voting' | 'reveal' | 'ended'>('voting');
  const [secret, setSecret] = useState<string>('');
  const [voteCommitment, setVoteCommitment] = useState<string>('');
  const [hasCommitted, setHasCommitted] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [electionInfo, setElectionInfo] = useState<any>(null);

  useEffect(() => {
    checkElectionPhase();
    checkVoterStatus();
  }, [contractAddress, provider, signer]);

  const checkElectionPhase = async () => {
    if (!provider) return;

    try {
      const contract = getVotingContract(contractAddress, provider);
      const election = await contract.getElectionInfo();
      const revealPhaseStarted = await contract.revealPhaseStarted();
      const currentTime = Math.floor(Date.now() / 1000);

      setElectionInfo(election);

      if (currentTime > election.endTime || !election.active) {
        if (revealPhaseStarted) {
          setPhase('reveal');
        } else {
          setPhase('ended');
        }
      } else {
        setPhase('voting');
      }
    } catch (error) {
      console.error('Error checking election phase:', error);
    }
  };

  const checkVoterStatus = async () => {
    if (!provider || !signer) return;

    try {
      const contract = getVotingContract(contractAddress, provider);
      const voterAddress = await signer.getAddress();
      
      // Check if voter has committed
      const commitment = await contract.getVoteCommitment(voterAddress);
      setHasCommitted(commitment !== '0x0000000000000000000000000000000000000000000000000000000000000000');
      setVoteCommitment(commitment);

      // Check if voter has revealed
      const voterStatus = await contract.getVoterStatus(voterAddress);
      setHasRevealed(voterStatus.hasRevealed);
    } catch (error) {
      console.error('Error checking voter status:', error);
    }
  };

  const generateSecret = () => {
    const randomSecret = Math.floor(Math.random() * 1000000).toString();
    setSecret(randomSecret);
  };

  const handleCommitVote = async () => {
    if (!selectedCandidate || !signer || !secret) return;

    setVoting(true);
    try {
      const contract = getVotingContract(contractAddress, provider!, signer);
      
      // Generate vote hash: keccak256(candidateId, secret)
      const voteHash = keccak256(
        solidityPacked(['uint256', 'uint256'], [selectedCandidate, secret])
      );
      
      toast.loading('Committing your vote...', { id: 'commit' });
      const tx = await contract.commitVote(voteHash);
      await tx.wait();
      
      toast.success('Vote committed successfully! Keep your secret safe.', { id: 'commit' });
      setHasCommitted(true);
      setVoteCommitment(voteHash);
      
      // Celebrate with confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      onVoteSubmitted();
      
    } catch (error: any) {
      console.error('Error committing vote:', error);
      toast.error(error.message || 'Failed to commit vote', { id: 'commit' });
    } finally {
      setVoting(false);
    }
  };

  const handleRevealVote = async () => {
    if (!selectedCandidate || !signer || !secret) return;

    setRevealing(true);
    try {
      const contract = getVotingContract(contractAddress, provider!, signer);
      
      toast.loading('Revealing your vote...', { id: 'reveal' });
      const tx = await contract.revealVote(selectedCandidate, secret);
      await tx.wait();
      
      toast.success('Vote revealed successfully!', { id: 'reveal' });
      setHasRevealed(true);
      
      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      onVoteSubmitted();
      
    } catch (error: any) {
      console.error('Error revealing vote:', error);
      toast.error(error.message || 'Failed to reveal vote', { id: 'reveal' });
    } finally {
      setRevealing(false);
    }
  };

  const approvedCandidates = candidates.filter(c => c.approved);

  const renderVotingPhase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Cast Your Vote (Commit Phase)
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Select a candidate and generate a secret to commit your vote privately.
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
          className="space-y-4"
        >
          <div className={`p-4 rounded-xl border ${
            isDark ? 'border-yellow-600 bg-yellow-900/20' : 'border-yellow-500 bg-yellow-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Secret Generation
              </h4>
            </div>
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Generate a secret number to secure your vote. Keep this secret safe - you'll need it to reveal your vote later.
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Your secret number"
                  className={`w-full p-3 rounded-lg border ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>
              <button
                onClick={() => setShowSecret(!showSecret)}
                className={`p-3 rounded-lg ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
              >
                {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button
                onClick={generateSecret}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleCommitVote}
              disabled={voting || !secret}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              <Lock className="w-5 h-5" />
              {voting ? 'Committing Vote...' : 'Commit Vote'}
            </button>
            
            <p className={`text-sm mt-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              You are voting for: <span className="font-medium">
                {approvedCandidates.find(c => c.id === selectedCandidate)?.name}
              </span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderRevealPhase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Reveal Your Vote
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Enter your candidate choice and secret to reveal your committed vote.
        </p>
      </div>

      {hasCommitted && (
        <div className={`p-4 rounded-xl border ${
          isDark ? 'border-green-600 bg-green-900/20' : 'border-green-500 bg-green-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Vote Committed
            </h4>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Your vote commitment: {voteCommitment}
          </p>
        </div>
      )}

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
          className="space-y-4"
        >
          <div className={`p-4 rounded-xl border ${
            isDark ? 'border-blue-600 bg-blue-900/20' : 'border-blue-500 bg-blue-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Unlock className="w-5 h-5 text-blue-500" />
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Enter Your Secret
              </h4>
            </div>
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Enter the secret number you used when committing your vote.
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Your secret number"
                  className={`w-full p-3 rounded-lg border ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>
              <button
                onClick={() => setShowSecret(!showSecret)}
                className={`p-3 rounded-lg ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
              >
                {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleRevealVote}
              disabled={revealing || !secret || hasRevealed}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              <Unlock className="w-5 h-5" />
              {revealing ? 'Revealing Vote...' : hasRevealed ? 'Vote Already Revealed' : 'Reveal Vote'}
            </button>
            
            <p className={`text-sm mt-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Revealing vote for: <span className="font-medium">
                {approvedCandidates.find(c => c.id === selectedCandidate)?.name}
              </span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderEndedPhase = () => (
    <div className={`text-center p-8 rounded-xl ${
      isDark 
        ? 'bg-gray-800/50 border border-gray-700' 
        : 'bg-white/50 border border-gray-200'
    }`}>
      <Vote className={`w-16 h-16 mx-auto mb-4 ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`} />
      <h3 className={`text-lg font-semibold mb-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Election Ended
      </h3>
      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        The election has ended. Results will be available after the reveal phase.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {phase === 'voting' && !hasCommitted && (
          <motion.div
            key="voting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderVotingPhase()}
          </motion.div>
        )}
        
        {phase === 'voting' && hasCommitted && (
          <motion.div
            key="committed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`text-center p-8 rounded-xl ${
              isDark 
                ? 'bg-green-900/20 border border-green-600' 
                : 'bg-green-50 border border-green-300'
            }`}
          >
            <CheckCircle className={`w-16 h-16 mx-auto mb-4 text-green-500`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Vote Committed Successfully
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Your vote has been committed. Wait for the reveal phase to begin.
            </p>
          </motion.div>
        )}
        
        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderRevealPhase()}
          </motion.div>
        )}
        
        {phase === 'ended' && (
          <motion.div
            key="ended"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderEndedPhase()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VotingInterface;