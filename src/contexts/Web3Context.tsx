import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import toast from 'react-hot-toast';

// This defines the shape of the data and functions that will be shared via the Web3 context:
// provider: Interface to the Ethereum node (MetaMask).
// signer: Represents the current wallet's signing power.
// account: Current wallet address.
// chainId: Current network ID.
// isConnected: Connection status.
// connectWallet(): Connects MetaMask.
// disconnectWallet(): Clears connection info.
// switchToSepolia(): Forces switch to Sepolia Testnet.
// switchToBotChain(): Forces switch to BOT Chain Mainnet (677).
interface Web3ContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToSepolia: () => Promise<void>;
  switchToBotChain: () => Promise<void>;
}


// Web3Context is created with undefined as default.
const Web3Context = createContext<Web3ContextType | undefined>(undefined);


// useWeb3 is a custom hook that throws if used outside the provider (safety check).
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};


// --- Supported Network Configs ---
export const SUPPORTED_CHAINS: Record<number, {
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
}> = {
  11155111: {
    name: 'Sepolia Testnet',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/d8cu_4ZQnwo5G_j-l7xXLA0IgBwzrhp9',
    explorerUrl: 'https://sepolia.etherscan.io/',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  },
  677: {
    name: 'BOT Chain Mainnet',
    rpcUrl: 'https://rpc.botchain.ai',
    explorerUrl: 'https://explorer.botchain.ai/',
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  },
};

export const getNetworkInfo = (chainId: number | null) =>
  chainId ? SUPPORTED_CHAINS[chainId] ?? null : null;

// Chain ID constants
const SEPOLIA_CHAIN_ID = 11155111;
const BOT_CHAIN_ID = 677;



interface Web3ProviderProps {
  children: ReactNode;
}

// These hold the current connection state
export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);               // provider is the interface to the Ethereum node (like MetaMask)
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);                     // signer is the wallet's signing power, used to sign transactions
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);



  // --- Generic helper: switch MetaMask to any supported chain ---
  // If the chain is not already added, it attempts to add it automatically.
  const switchToNetwork = async (targetChainId: number) => {
    const chainConfig = SUPPORTED_CHAINS[targetChainId];
    if (!chainConfig) {
      toast.error('Unsupported network');
      return;
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added — try to add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: chainConfig.name,
                nativeCurrency: chainConfig.nativeCurrency,
                rpcUrls: [chainConfig.rpcUrl],
                blockExplorerUrls: [chainConfig.explorerUrl],
              },
            ],
          });
        } catch (addError) {
          toast.error(`Failed to add ${chainConfig.name} to MetaMask`);
        }
      } else {
        toast.error(`Failed to switch to ${chainConfig.name}`);
      }
    }
  };

  // Public switch helpers
  const switchToSepolia = () => switchToNetwork(SEPOLIA_CHAIN_ID);
  const switchToBotChain = () => switchToNetwork(BOT_CHAIN_ID);


  // This function connects to the wallet and sets the provider, signer, account, chainId, and connection status.
  // It checks if MetaMask is installed, requests accounts, and sets the provider and signer.
  // Both Sepolia and BOT Chain are valid — other chains get a soft warning but do NOT block connection.
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);

        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          const currentChainId = Number(network.chainId);

          if (!SUPPORTED_CHAINS[currentChainId]) {
            toast.error(
              'Unsupported network. Please switch to Sepolia Testnet or BOT Chain Mainnet (677).',
              { duration: 5000 }
            );
            // Still connect so the user can switch from the UI
          }

          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0]);
          setChainId(currentChainId);
          setIsConnected(true);

          if (SUPPORTED_CHAINS[currentChainId]) {
            toast.success(`Wallet connected on ${SUPPORTED_CHAINS[currentChainId].name}!`);
          } else {
            toast.success('Wallet connected (unsupported network)');
          }
        }
      } else {
        toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    }
  };


  // This function disconnects the wallet by clearing the provider, signer, account, chainId, and connection status.
  // It also shows a success message.
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };


  // This effect listens for changes in the user's accounts and chain, and updates state accordingly.
  // If the user switches to an unsupported chain, we warn but do NOT force-disconnect,
  // so they can still switch back from within the app.
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);

        if (!SUPPORTED_CHAINS[newChainId]) {
          toast.error(
            'Unsupported network detected. Please switch to Sepolia Testnet or BOT Chain (677).',
            { duration: 5000 }
          );
          // Soft disconnect — user remains connected so they can switch via the UI
          setIsConnected(false);
          setSigner(null);
        } else {
          // Re-establish signer on valid chain switch (provider auto-updates in MetaMask)
          if (provider) {
            provider.getSigner().then(setSigner).catch(console.error);
          }
          setIsConnected(true);
          toast.success(`Switched to ${SUPPORTED_CHAINS[newChainId].name}`);
        }
      };


      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider]);

  
  // This effect attempts to auto-connect the wallet when the component mounts.
  // It checks if MetaMask is installed and if there are any accounts available.
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          toast.loading('Attempting auto-connect...');
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Auto-connect failed:', error);
        }
      }
    };

    autoConnect();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        isConnected,
        connectWallet,
        disconnectWallet,
        switchToSepolia,
        switchToBotChain,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};