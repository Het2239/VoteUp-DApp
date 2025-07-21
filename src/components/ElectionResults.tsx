import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Award, Crown, Shield, Check, X, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getVotingContract, getResults, startRevealPhase, revealVote, getAllRevealedVotes, getRevealedVotes, getCandidates } from '../utils/contract';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { keccak256, solidityPacked } from 'ethers';

interface ElectionResultsProps {
  contractAddress: string;
}
// let totalVotes = 0; // Global variable to hold total votes
const ElectionResults: React.FC<ElectionResultsProps> = ({ contractAddress }) => {
  const { isDark } = useTheme();
  const { provider, signer } = useWeb3();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [revealStarted, setRevealStarted] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [sortedCandidates, setSortedCandidates] = useState<any[]>([]);
  const [votingEndTime, setVotingEndTime] = useState<number | null>(null);
  const [revealDeadline, setRevealDeadline] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));



  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    candidateId: number;
    secret: string;
    commitment: string;
    isValid: boolean | null;
  }>({
    candidateId: 0,
    secret: '',
    commitment: '',
    isValid: null
  });
  const [showSecret, setShowSecret] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [voterStatus, setVoterStatus] = useState<{
    registered: boolean;
    approved: boolean;
    hasRevealed: boolean;
  }>({ registered: false, approved: false, hasRevealed: false });

  useEffect(() => {
    loadResults();
    loadVoterStatus();
  }, [contractAddress, provider, signer]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const contract = getVotingContract(contractAddress, provider!, signer!);
        const candidateList = await getCandidates(contract);
        const revealedVotes = await Promise.all(
          candidateList.map(async (candidate) => {
            const votes = await getRevealedVotes(contract, candidate.id);
            return { ...candidate, voteCount: votes };
          })
        );

        const total = revealedVotes.reduce((sum, c) => sum + Number(c.voteCount), 0);
        setTotalVotes(total);

        const sorted = [...revealedVotes].sort((a, b) => b.voteCount - a.voteCount);
        setSortedCandidates(sorted);

        const { winnerName, maxVotes } = await getResults(contract);
        setResults({ winnerName, maxVotes, allCandidates: revealedVotes });


      } catch (err) {
        console.error("Error loading election results:", err);
      }
    };

    if (provider && signer) {
      fetchResults();
    }
  }, [provider, signer, contractAddress]);


  const loadResults = async () => {
    if (!provider || !signer) return;

    try {
      const contract = getVotingContract(contractAddress, provider, signer);

      const [electionInfo] = await Promise.all([
        contract.getElectionInfo(),
        // contract.revealPhaseStarted()
      ]);
      const endTime = Number(electionInfo.votingEndTime);
      const now = Math.floor(Date.now() / 1000);
      setVotingEndTime(endTime);
      setRevealDeadline(endTime + 86400); // 24 hours
      setCurrentTime(now);


      // setRevealStarted(revealStartedStatus);
      const allRevealed = await getAllRevealedVotes(contract);
      const TotalVotes = allRevealed.reduce((sum, candidate) => sum + Number(candidate.votes), 0);
      // totalVotes = TotalVotes; // Update global totalVotes variable
      const currentTime = Math.floor(Date.now() / 1000);

      const owner = await contract.owner();
      const userAddress = await signer.getAddress();
      setIsOwner(owner.toLowerCase() === userAddress.toLowerCase());

      const resultsData = await getResults(contract);

      setResults(resultsData);

      if (resultsData.winnerName && resultsData.winnerName.length > 0) {
  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#8B5CF6', '#06B6D4', '#10B981']
  });
}

    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load election results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const isInRevealPeriod = revealStarted && votingEndTime && currentTime >= votingEndTime && currentTime <= (votingEndTime + 86400);
  const revealTimeLeft = revealDeadline ? revealDeadline - currentTime : 0;


  const loadVoterStatus = async () => {
    if (!provider || !signer) return;

    try {
      const contract = getVotingContract(contractAddress, provider);
      const voterAddress = await signer.getAddress();

      // Get voter status
      const status = await contract.getVoterStatus(voterAddress);
      setVoterStatus({
        registered: status.registered,
        approved: status.approved,
        hasRevealed: status.hasRevealed
      });

      // Get vote commitment if exists
      const commitment = await contract.getVoteCommitment(voterAddress);
      if (commitment !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        setVerificationData(prev => ({
          ...prev,
          commitment
        }));
      }
    } catch (error: any) {
      console.error('Error loading voter status:', error);
    }
  };
//   const debugElectionPhase = async () => {
//   const contract = getVotingContract(contractAddress, provider!, signer!);
//   const election = await contract.getElectionInfo();
//   const now = Math.floor(Date.now() / 1000);

//   console.log("🕒 Current Time:", now);
//   console.log("🗳️ Start Time:", Number(election.startTime));
//   console.log("🛑 End Time:", Number(election.endTime));
//   console.log("🪪 Active:", election.active);
//   console.log("📢 Reveal window ends at:", Number(election.endTime) + 86400);
// };
// debugElectionPhase();


  const handleManualRevealStart = async () => {
    if (!provider || !signer) return;
    try {
      const contract = getVotingContract(contractAddress, provider, signer);
      const tx = await startRevealPhase(contract);
      await tx.wait();
      toast.success('Reveal phase started manually!');
      setRevealStarted(true);
    } catch (error) {
      console.error('Failed to start reveal phase:', error);
      toast.error('Could not start reveal phase');
    }
  };

  const verifyVote = async () => {
    if (!provider || !signer || !verificationData.candidateId || !verificationData.secret) {
      toast.error('Please enter both candidate ID and secret');
      return;
    }

    setVerifying(true);
    try {
      const contract = getVotingContract(contractAddress, provider);
      const voterAddress = await signer.getAddress();

      // Get the stored commitment
      const storedCommitment = await contract.getVoteCommitment(voterAddress);

      if (storedCommitment === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        toast.error('No vote commitment found for your address');
        setVerificationData(prev => ({ ...prev, isValid: false }));
        return;
      }

      // Compute the hash locally using the same method as the contract
      const computedHash = keccak256(
        solidityPacked(['uint256', 'uint256'], [verificationData.candidateId, verificationData.secret])
      );

      // Compare with stored commitment
      const isValid = storedCommitment.toLowerCase() === computedHash.toLowerCase();

      setVerificationData(prev => ({
        ...prev,
        commitment: storedCommitment,
        isValid
      }));

      if (isValid) {
        toast.success('✅ Vote verification successful! Your vote was counted correctly.');
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#059669']
        });
      } else {
        toast.error('❌ Vote verification failed. The candidate ID or secret is incorrect.');
      }

    } catch (error: any) {
      console.error('Error verifying vote:', error);
      toast.error('Failed to verify vote');
      setVerificationData(prev => ({ ...prev, isValid: false }));
    } finally {
      setVerifying(false);
    }
  };

  const handleRevealVote = async () => {
    if (!provider || !signer) return;
    const { candidateId, secret } = verificationData;

    if (!candidateId || !secret) {
      toast.error('Enter candidate ID and secret to reveal vote');
      return;
    }

    setRevealing(true);
    try {
      const contract = getVotingContract(contractAddress, provider, signer);
      const tx = await revealVote(contract, candidateId, parseInt(secret));
      await tx.wait();
      toast.success('🗳️ Vote revealed successfully!');
      setVoterStatus((prev) => ({ ...prev, hasRevealed: true }));
    } catch (error) {
      console.error('Error revealing vote:', error);
      toast.error('Failed to reveal vote');
    } finally {
      setRevealing(false);
    }
  };

  const resetVerification = () => {
    setVerificationData({
      candidateId: 0,
      secret: '',
      commitment: verificationData.commitment,
      isValid: null
    });
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
      <div className={`text-center p-8 rounded-xl ${isDark
        ? 'bg-gray-800/50 border border-gray-700'
        : 'bg-white/50 border border-gray-200'
        }`}>
        <Trophy className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
          }`}>
          Results Not Available
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Election results will be available after the voting period ends.
        </p>
      </div>
    );
  }

  // const totalVotes = results.allCandidates.reduce((sum: number, candidate: any) => sum + candidate.voteCount, 0);
  // const sortedCandidates = [...results.allCandidates].sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className="space-y-6">
  {/* Winner Announcement */}
  {results.winnerName && results.winnerName.length > 0 && (
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
        <Crown
          className={`w-16 h-16 mx-auto ${
            isDark ? 'text-yellow-400' : 'text-yellow-500'
          }`}
        />
      </motion.div>
      <h2
        className={`text-3xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        🎉
        {Array.isArray(results.winnerName) && results.winnerName.length > 1
          ? "It's a Tie!"
          : 'Winner Announced!'}{' '}
        🎉
      </h2>
      <p
        className={`text-xl mb-4 ${
          isDark ? 'text-purple-300' : 'text-purple-700'
        }`}
      >
        {Array.isArray(results.winnerName)
          ? results.winnerName.join(', ')
          : results.winnerName}
      </p>
      <p
        className={`text-lg ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}
      >
        With {results.maxVotes} votes (
        {totalVotes > 0
          ? Math.round((results.maxVotes / totalVotes) * 100)
          : 0}
        % of total votes)
      </p>
    </motion.div>
  )}


      {/* E2E Verification Section - Only show for registered voters */}
      {voterStatus.registered && voterStatus.approved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl overflow-hidden ${isDark
            ? 'bg-gray-800/50 border border-gray-700'
            : 'bg-white/50 border border-gray-200'
            }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                <Shield className="w-5 h-5 text-green-500" />
                Verify Your Vote (E2E)
              </h3>
              <button
                onClick={() => setShowVerification(!showVerification)}
                className={`px-4 py-2 rounded-lg transition-colors ${isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
              >
                {showVerification ? 'Hide' : 'Verify Vote'}
              </button>
            </div>
            
            



            {voterStatus.hasRevealed ? (
              <div className={`p-4 rounded-lg border ${isDark ? 'border-green-600 bg-green-900/20' : 'border-green-500 bg-green-50'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Vote Successfully Revealed
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your vote has been revealed and counted in the final results.
                </p>
              </div>
            ) : (
              <div className={`p-4 rounded-lg border ${isDark ? 'border-yellow-600 bg-yellow-900/20' : 'border-yellow-500 bg-yellow-50'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-5 h-5 text-yellow-500" />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Vote Not Revealed
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your vote was committed but not revealed. It won't be counted in the final results.
                </p>
              </div>
            )}

            {showVerification && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                <div className={`p-4 rounded-lg border ${isDark ? 'border-blue-600 bg-blue-900/20' : 'border-blue-500 bg-blue-50'
                  }`}>
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Verification Instructions
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    To verify your vote was counted correctly, enter the candidate ID and secret you used when voting.
                    This will verify that your vote commitment matches what's stored on the blockchain.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Candidate ID
                    </label>
                    <select
                      value={verificationData.candidateId}
                      onChange={(e) => setVerificationData(prev => ({
                        ...prev,
                        candidateId: parseInt(e.target.value),
                        isValid: null
                      }))}
                      className={`w-full p-3 rounded-lg border ${isDark
                        ? 'border-gray-600 bg-gray-700 text-white'
                        : 'border-gray-300 bg-white text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    >
                      <option value={0}>Select the candidate you voted for</option>
                      {sortedCandidates.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.id} - {candidate.name} ({candidate.party})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Secret Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        value={verificationData.secret}
                        onChange={(e) => setVerificationData(prev => ({
                          ...prev,
                          secret: e.target.value,
                          isValid: null
                        }))}
                        placeholder="Enter your secret number"
                        className={`flex-1 p-3 rounded-lg border ${isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className={`p-3 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                          } transition-colors`}
                      >
                        {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={verifyVote}
                    disabled={verifying || !verificationData.candidateId || !verificationData.secret}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Shield className="w-5 h-5" />
                    {verifying ? 'Verifying...' : 'Verify Vote'}
                  </button>

                  <button
                    onClick={handleRevealVote}
                    disabled={
                      !!(
                        revealing ||
                        !verificationData.candidateId ||
                        !verificationData.secret ||
                        !isInRevealPeriod
                      )
                    } 
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-5 h-5" />
                    {revealing ? 'Revealing...' : 'Reveal Vote'}
                  </button>

                  <button
                    onClick={resetVerification}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                  >
                    Reset
                  </button>
                </div>

                {/* Verification Result */}
                {verificationData.isValid !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg border ${verificationData.isValid
                      ? isDark
                        ? 'border-green-600 bg-green-900/20'
                        : 'border-green-500 bg-green-50'
                      : isDark
                        ? 'border-red-600 bg-red-900/20'
                        : 'border-red-500 bg-red-50'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {verificationData.isValid ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`font-semibold ${verificationData.isValid
                        ? 'text-green-600'
                        : 'text-red-600'
                        }`}>
                        {verificationData.isValid ? 'Verification Successful' : 'Verification Failed'}
                      </span>
                    </div>
                    <p className={`text-sm ${verificationData.isValid
                      ? isDark ? 'text-green-300' : 'text-green-700'
                      : isDark ? 'text-red-300' : 'text-red-700'
                      }`}>
                      {verificationData.isValid
                        ? 'Your vote commitment matches the blockchain record. Your vote was counted correctly!'
                        : 'The candidate ID or secret doesn\'t match your vote commitment. Please check your inputs.'}
                    </p>

                    {verificationData.commitment && (
                      <div className="mt-2 p-2 bg-black/20 rounded font-mono text-xs break-all">
                        <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Vote Commitment: {verificationData.commitment}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Results Table */}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-xl overflow-hidden ${isDark
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-white/50 border border-gray-200'
          }`}
      >
        <div className="p-6">
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>
            <Award className="w-5 h-5" />
            Final Results
          </h3>

          <div className="space-y-4">
            {sortedCandidates.map((candidate, index) => {
              const percentage = totalVotes > 0 ? (Number(candidate.voteCount) / totalVotes) * 100 : 0;
              const isWinner = Array.isArray(results.winnerName)
                ? results.winnerName.includes(candidate.name)
                : results.winnerName === candidate.name;


              return (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`p-4 rounded-lg border ${isWinner
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0
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
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                          {candidate.name}
                          {isWinner && <Crown className="w-4 h-4 inline ml-2 text-yellow-500" />}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {candidate.party} • ID: {candidate.id}
                        </p>
                      </div>
                    </div>
                    {isOwner  && (
              
              <div className="text-center">
                <button
                  onClick={handleManualRevealStart}
                  className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  🚀 Start Reveal Phase
                </button>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  The voting period has ended. Start the reveal phase so voters can reveal their committed votes.
                </p>
              </div>
            )}
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        {candidate.voteCount}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className={`h-full ${isWinner
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
        <div className={`p-4 rounded-xl text-center ${isDark
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-white/50 border border-gray-200'
          }`}>
          <Users className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-500'
            }`} />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'
            }`}>
            {totalVotes}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Total Votes
          </p>
        </div>

        <div className={`p-4 rounded-xl text-center ${isDark
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-white/50 border border-gray-200'
          }`}>
          <Award className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-500'
            }`} />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'
            }`}>
            {sortedCandidates.length}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Candidates
          </p>
        </div>

        <div className={`p-4 rounded-xl text-center ${isDark
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-white/50 border border-gray-200'
          }`}>
          <Trophy className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-500'
            }`} />
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'
            }`}>
            {results.maxVotes}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Winning Votes
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ElectionResults;