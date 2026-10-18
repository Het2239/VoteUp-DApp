import Dexie, { Table } from 'dexie';

export interface Election {
  id?: number;
  name: string;
  description: string;
  contractAddress: string;
  deployedBy: string;
  startTime: number;
  endTime: number;
  createdAt: number;
  active: boolean;
  chainId: number;          // Network chain ID (e.g. 11155111 = Sepolia, 677 = BOT Chain)
  revealDeadline?: number;  // endTime + 24 hours (86400 seconds)
}

export interface CandidateRequest {
  id?: number;
  electionAddress: string;
  walletAddress: string;
  name: string;
  party: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface VoterRequest {
  id?: number;
  electionAddress: string;
  walletAddress: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export class VotingDatabase extends Dexie {
  elections!: Table<Election>;
  candidateRequests!: Table<CandidateRequest>;
  voterRequests!: Table<VoterRequest>;

  constructor() {
    super('VotingDatabase');
    // Version 2: original schema (Sepolia only, no chainId)
    this.version(2).stores({
      elections: '++id, contractAddress, deployedBy, startTime, endTime, active, createdAt',
      candidateRequests: '++id, electionAddress, walletAddress, status, createdAt',
      voterRequests: '++id, electionAddress, walletAddress, status, createdAt'
    });
    // Version 3: added chainId index for multi-network support
    this.version(3).stores({
      elections: '++id, contractAddress, deployedBy, startTime, endTime, active, createdAt, chainId',
      candidateRequests: '++id, electionAddress, walletAddress, status, createdAt',
      voterRequests: '++id, electionAddress, walletAddress, status, createdAt'
    }).upgrade(tx => {
      // Migrate existing elections without chainId to Sepolia (11155111)
      return tx.table('elections').toCollection().modify((election: any) => {
        if (election.chainId === undefined) {
          election.chainId = 11155111;
        }
      });
    });
  }
}

export const db = new VotingDatabase();

// Database operations
export const electionService = {
  async addElection(election: Omit<Election, 'id'>) {
    return await db.elections.add(election);
  },

  async getElections() {
    return await db.elections.orderBy('createdAt').reverse().toArray();
  },

  async getElectionsByChain(chainId: number) {
    return await db.elections.where('chainId').equals(chainId).reverse().sortBy('createdAt');
  },

  async getElectionByAddress(contractAddress: string) {
    return await db.elections.where('contractAddress').equals(contractAddress).first();
  },

  async updateElection(id: number, changes: Partial<Election>) {
    return await db.elections.update(id, changes);
  },

  async deleteElection(id: number) {
    return await db.elections.delete(id);
  }
};

export const candidateService = {
  async addCandidateRequest(request: Omit<CandidateRequest, 'id'>) {
    return await db.candidateRequests.add(request);
  },

  async getCandidateRequests(electionAddress?: string) {
    if (electionAddress) {
      return await db.candidateRequests.where('electionAddress').equals(electionAddress).toArray();
    }
    return await db.candidateRequests.toArray();
  },

  async updateCandidateRequest(id: number, changes: Partial<CandidateRequest>) {
    return await db.candidateRequests.update(id, changes);
  },

  async getCandidateRequestByWallet(electionAddress: string, walletAddress: string) {
    return await db.candidateRequests
      .where('electionAddress').equals(electionAddress)
      .and(req => req.walletAddress.toLowerCase() === walletAddress.toLowerCase())
      .first();
  }
};

export const voterService = {
  async addVoterRequest(request: Omit<VoterRequest, 'id'>) {
    return await db.voterRequests.add(request);
  },

  async getVoterRequests(electionAddress?: string) {
    if (electionAddress) {
      return await db.voterRequests.where('electionAddress').equals(electionAddress).toArray();
    }
    return await db.voterRequests.toArray();
  },

  async updateVoterRequest(id: number, changes: Partial<VoterRequest>) {
    return await db.voterRequests.update(id, changes);
  },

  async getVoterRequestByWallet(electionAddress: string, walletAddress: string) {
    return await db.voterRequests
      .where('electionAddress').equals(electionAddress)
      .and(req => req.walletAddress.toLowerCase() === walletAddress.toLowerCase())
      .first();
  }
};