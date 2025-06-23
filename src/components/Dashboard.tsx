import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Clock, Users, Trophy, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Election, electionService } from '../utils/database';
import CreateElectionModal from './CreateElectionModal';
import JoinElectionModal from './JoinElectionModal';
import ElectionCard from './ElectionCard';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const { isConnected } = useWeb3();
  const [elections, setElections] = useState<Election[]>([]);
  const [filteredElections, setFilteredElections] = useState<Election[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'active' | 'ended'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [elections, searchTerm, filterStatus]);

  const loadElections = async () => {
    try {
      const data = await electionService.getElections();
      setElections(data);
    } catch (error) {
      console.error('Error loading elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = elections;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(election =>
        election.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        election.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    const now = Date.now() / 1000;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(election => {
        switch (filterStatus) {
          case 'upcoming':
            return election.startTime > now;
          case 'active':
            return election.startTime <= now && election.endTime > now && election.active;
          case 'ended':
            return election.endTime <= now || !election.active;
          default:
            return true;
        }
      });
    }

    setFilteredElections(filtered);
  };

  const handleElectionCreated = (election: Election) => {
    setElections(prev => [election, ...prev]);
    setShowCreateModal(false);
    toast.success('Election created successfully!');
  };

  const getStatusCounts = () => {
    const now = Date.now() / 1000;
    return {
      total: elections.length,
      upcoming: elections.filter(e => e.startTime > now).length,
      active: elections.filter(e => e.startTime <= now && e.endTime > now && e.active).length,
      ended: elections.filter(e => e.endTime <= now || !e.active).length
    };
  };

  const statusCounts = getStatusCounts();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center p-8 rounded-2xl ${
            isDark 
              ? 'bg-gray-800/50 border border-gray-700' 
              : 'bg-white/50 border border-gray-200'
          }`}
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isDark 
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600' 
              : 'bg-gradient-to-r from-purple-500 to-cyan-500'
          }`}>
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Connect Your Wallet
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Please connect your wallet to access the voting dashboard
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className={`text-4xl font-bold bg-gradient-to-r ${
          isDark 
            ? 'from-purple-400 to-cyan-400' 
            : 'from-purple-600 to-cyan-600'
        } bg-clip-text text-transparent`}>
          Voting Dashboard
        </h1>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Create, join, and participate in decentralized elections
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Elections', value: statusCounts.total, icon: Calendar, color: 'blue' },
          { label: 'Upcoming', value: statusCounts.upcoming, icon: Clock, color: 'yellow' },
          { label: 'Active', value: statusCounts.active, icon: Users, color: 'green' },
          { label: 'Ended', value: statusCounts.ended, icon: Trophy, color: 'purple' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl backdrop-blur-sm border ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-white/50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" />
          Create Election
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowJoinModal(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-colors ${
            isDark 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Users className="w-5 h-5" />
          Join Election
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search elections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className={`px-4 py-3 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700 text-white' 
                : 'bg-white/50 border-gray-200 text-gray-900'
            }`}
          >
            <option value="all">All Elections</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      {/* Elections Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredElections.map((election, index) => (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <ElectionCard election={election} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredElections.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isDark 
              ? 'bg-gray-800/50 text-gray-400' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            No elections found
          </h3>
          <p className={`${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Create your first election to get started'
            }
          </p>
        </motion.div>
      )}

      {/* Modals */}
      <CreateElectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onElectionCreated={handleElectionCreated}
      />
      <JoinElectionModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
};

export default Dashboard;