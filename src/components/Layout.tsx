import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Moon, Sun, Wallet, Power, Vote } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const { account, isConnected, connectWallet, disconnectWallet, chainId } = useWeb3();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <nav className={`backdrop-blur-md border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900/50 border-gray-700' 
          : 'bg-white/50 border-gray-200'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className={`p-2 rounded-xl ${
                isDark 
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600' 
                  : 'bg-gradient-to-r from-purple-500 to-cyan-500'
              }`}>
                <Vote className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r ${
                isDark 
                  ? 'from-purple-400 to-cyan-400' 
                  : 'from-purple-600 to-cyan-600'
              } bg-clip-text text-transparent`}>
                VoteUp
              </h1>
            </motion.div>

            <div className="flex items-center gap-4">
              {chainId && chainId !== 11155111 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                >
                  ⚠️ Switch to Sepolia
                </motion.div>
              )}

              {isConnected ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
                    isDark 
                      ? 'bg-gray-800/50 border border-gray-700' 
                      : 'bg-white/50 border border-gray-200'
                  }`}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className={`p-1 rounded-lg transition-colors ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                        : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connectWallet}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-colors ${
                  isDark 
                    ? 'bg-gray-800/50 hover:bg-gray-700/50 text-yellow-400' 
                    : 'bg-white/50 hover:bg-gray-100/50 text-gray-700'
                }`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;