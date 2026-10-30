import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3, SUPPORTED_CHAINS, getNetworkInfo } from '../contexts/Web3Context';
import { Moon, Sun, Wallet, Power, Vote, ExternalLink } from 'lucide-react';

// Public BOT Chain links — shown on every page, with or without a connected wallet
export const BOT_CHAIN_LINKS = [
  { label: 'botchain.ai', href: 'https://botchain.ai/' },
  { label: 'scan.botchain.ai', href: 'https://scan.botchain.ai/' },
];

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const { account, isConnected, connectWallet, disconnectWallet, chainId } = useWeb3();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
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
              <a
                href="https://botchain.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  isDark
                    ? 'bg-emerald-900/40 border-emerald-700 text-emerald-300 hover:bg-emerald-900/70'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                on BOT Chain
              </a>
            </motion.div>

            <div className="flex items-center gap-4">
              {chainId && (() => {
                const networkInfo = getNetworkInfo(chainId);
                if (networkInfo) {
                  // Supported chain — show a branded network pill
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        chainId === 677
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        chainId === 677 ? 'bg-emerald-500' : 'bg-blue-500'
                      }`} />
                      {networkInfo.name}
                    </motion.div>
                  );
                } else {
                  // Unknown / unsupported chain — show warning
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold"
                    >
                      ⚠️ Unsupported network
                    </motion.div>
                  );
                }
              })()}

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

      <main className="container mx-auto px-4 py-8 flex-1">
        {children}
      </main>

      <footer className={`border-t transition-colors duration-300 ${
        isDark
          ? 'bg-gray-900/50 border-gray-700'
          : 'bg-white/50 border-gray-200'
      }`}>
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <span className={`flex items-center gap-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Powered by BOT Chain
          </span>
          <div className="flex items-center gap-4">
            {BOT_CHAIN_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 font-medium transition-colors ${
                  isDark
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                {link.label}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;