import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, CheckCircle, XCircle, Settings, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getVotingContract, getPendingCandidates, getPendingVoters } from '../utils/contract';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface AdminPanelProps {
  contractAddress: string;
  onDataChange: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ contractAddress, onDataChange }) => {
  const { isDark } = useTheme();
  const { provider, signer } = useWeb3();
  const [pendingCandidates, setPendingCandidates] = useState<any[]>([]);
  const [pendingVoters, setPendingVoters] = useState<any[]>([]);
  const [approvedCandidates, setApprovedCandidates] = useState<any[]>([]);
  const [approvedVoters, setApprovedVoters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [contractAddress, provider]);

  // Helper function to safely convert BigNumber to number
  const safeToNumber = (value: any): number => {
    if (!value) return 0;
    
    try {
      // For ethers.js v5 BigNumber
      if (typeof value.toNumber === 'function') {
        return value.toNumber();
      }
      // For ethers.js v6 BigInt
      if (typeof value === 'bigint') {
        return Number(value);
      }
      // For web3.js or other libraries
      if (typeof value.toString === 'function') {
        return parseInt(value.toString(), 10);
      }
      // Direct number conversion
      return Number(value);
    } catch (error) {
      console.warn('Error converting value to number:', error);
      return 0;
    }
  };

const loadAllData = async () => {
  if (!provider || !signer) return;

  try {
    const contract = getVotingContract(contractAddress, provider, signer);

    const [pendingCands, pendingVots, approvedCands, approvedVots] = await Promise.all([
      getPendingCandidates(contract),
      getPendingVoters(contract),
      contract.getCandidates(),
      contract.getVoters(),
    ]);

    // Fetch revealed vote counts for each candidate
    const revealedVoteCounts = await Promise.all(
      approvedCands.map(async (cand) => {
        const count = await contract.getRevealedVotes(cand.id);
        return safeToNumber(count);
      })
    );

    setPendingCandidates(pendingCands);
    setPendingVoters(pendingVots);

    setApprovedCandidates(
      approvedCands.map((cand, idx) => ({
        id: safeToNumber(cand.id),
        name: cand.name,
        party: cand.party,
        wallet: cand.wallet,
        voteCount: revealedVoteCounts[idx], // Use revealed vote count
        approved: cand.approved,
      }))
    );

    setApprovedVoters(
      approvedVots.map((voter) => ({
        id: safeToNumber(voter.id),
        name: voter.name,
        wallet: voter.wallet,
        hasVoted: voter.hasVoted ?? false,
        hasRevealed: voter.hasRevealed ?? false,
        approved: voter.approved,
      }))
    );
  } catch (error) {
    console.error("Error loading data:", error);
    toast.error("Failed to load data: " + (error.message || "Unknown error"));
  } finally {
    setLoading(false);
  }
};

const exportToExcel = async () => {
  setExportLoading(true);
  toast.loading('Preparing Excel export...', { id: 'export' });

  try {
    // Prepare candidate data
    const candidateData = [
      ...approvedCandidates.map(candidate => ({
        'Type': 'Approved Candidate',
        'ID': candidate.id,
        'Name': candidate.name,
        'Party': candidate.party || 'N/A',
        'Wallet Address': candidate.wallet,
        'Vote Count': candidate.voteCount, // Now correct
        'Status': 'Approved',
        'Has Voted': 'N/A',
        'Has Revealed': 'N/A'
      })),
      ...pendingCandidates.map(candidate => ({
        'Type': 'Pending Candidate',
        'ID': candidate.id || 'Pending',
        'Name': candidate.name,
        'Party': candidate.party || 'N/A',
        'Wallet Address': candidate.wallet,
        'Vote Count': 0,
        'Status': 'Pending Approval',
        'Has Voted': 'N/A',
        'Has Revealed': 'N/A'
      }))
    ];

    // Prepare voter data
    const voterData = [
      ...approvedVoters.map(voter => ({
        'Type': 'Approved Voter',
        'ID': voter.id,
        'Name': voter.name,
        'Party': 'N/A',
        'Wallet Address': voter.wallet,
        'Vote Count': 'N/A',
        'Status': 'Approved',
        'Has Voted': voter.hasVoted ? 'Yes' : 'No',
        'Has Revealed': voter.hasRevealed ? 'Yes' : 'No'
      })),
      ...pendingVoters.map(voter => ({
        'Type': 'Pending Voter',
        'ID': voter.id || 'Pending',
        'Name': voter.name,
        'Party': 'N/A',
        'Wallet Address': voter.wallet,
        'Vote Count': 'N/A',
        'Status': 'Pending Approval',
        'Has Voted': 'No',
        'Has Revealed': 'No'
      }))
    ];

    // Combine all data
    const allData = [...candidateData, ...voterData];

    // Create separate sheets for better organization
    const candidateSheet = XLSX.utils.json_to_sheet(candidateData);
    const voterSheet = XLSX.utils.json_to_sheet(voterData);
    const combinedSheet = XLSX.utils.json_to_sheet(allData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, combinedSheet, 'All Data');
    XLSX.utils.book_append_sheet(workbook, candidateSheet, 'Candidates');
    XLSX.utils.book_append_sheet(workbook, voterSheet, 'Voters');

    // Auto-size columns
    const sheets = ['All Data', 'Candidates', 'Voters'];
    sheets.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
      const columnWidths = [];
      
      for (let col = range.s.c; col <= range.e.c; col++) {
        let maxWidth = 10;
        for (let row = range.s.r; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = sheet[cellAddress];
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length;
            maxWidth = Math.max(maxWidth, cellLength);
          }
        }
        columnWidths.push({ wch: Math.min(maxWidth + 2, 50) });
      }
      
      sheet['!cols'] = columnWidths;
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `voting-data-${timestamp}.xlsx`;

    // Write and download file
    XLSX.writeFile(workbook, filename);

    toast.success(`Excel file exported successfully: ${filename}`, { id: 'export' });
    
  } catch (error: any) {
    console.error('Error exporting to Excel:', error);
    toast.error('Failed to export to Excel', { id: 'export' });
  } finally {
    setExportLoading(false);
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
      loadAllData(); // Reload all data instead of just pending
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
      loadAllData(); // Reload all data instead of just pending
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
      <div className="flex items-center justify-between">
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
        
        {/* Export Button */}
        <button
          onClick={exportToExcel}
          disabled={exportLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isDark
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-100 hover:bg-green-200 text-green-800'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Download className="w-4 h-4" />
          {exportLoading ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      {/* Statistics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${
          isDark 
            ? 'bg-gray-800/50 border border-gray-700' 
            : 'bg-white/50 border border-gray-200'
        }`}
      >
        <h4 className={`text-lg font-semibold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Overview
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {approvedCandidates.length}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Approved Candidates
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDark ? 'text-orange-400' : 'text-orange-600'
            }`}>
              {pendingCandidates.length}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Pending Candidates
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {approvedVoters.length}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Approved Voters
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`}>
              {pendingVoters.length}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Pending Voters
            </div>
          </div>
        </div>
      </motion.div>

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