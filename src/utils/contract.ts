import { Contract, ContractFactory } from 'ethers';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { keccak256, solidityPackedKeccak256 } from 'ethers';
// import VotingArtifact from '../artifacts/contracts/Voting.sol/Voting.json';


export const VOTING_CONTRACT_ABI =[
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_endTime",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "party",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			}
		],
		"name": "CandidateApproved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "party",
				"type": "string"
			}
		],
		"name": "CandidateRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "winnerName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "winnerVotes",
				"type": "uint256"
			}
		],
		"name": "ElectionEnded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			}
		],
		"name": "VoteCommitted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "candidateId",
				"type": "uint256"
			}
		],
		"name": "VoteRevealed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			}
		],
		"name": "VoterApproved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "VoterRequested",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "candidateAddress",
				"type": "address"
			}
		],
		"name": "approveCandidate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "voterAddress",
				"type": "address"
			}
		],
		"name": "approveVoter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "candidateCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "candidateRequests",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "candidates",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "party",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "voteCount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "voteHash",
				"type": "bytes32"
			}
		],
		"name": "commitVote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "election",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "endElection",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "candidateAddress",
				"type": "address"
			}
		],
		"name": "getCandidateStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "registered",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCandidates",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "party",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "wallet",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "voteCount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					}
				],
				"internalType": "struct Voting.Candidate[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getElectionInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "startTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "endTime",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "active",
						"type": "bool"
					}
				],
				"internalType": "struct Voting.Election",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPendingCandidates",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "party",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "wallet",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "voteCount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					}
				],
				"internalType": "struct Voting.Candidate[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPendingVoterAddresses",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPendingVoters",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "wallet",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "hasVoted",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "hasRevealed",
						"type": "bool"
					}
				],
				"internalType": "struct Voting.Voter[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getResults",
		"outputs": [
			{
				"internalType": "string",
				"name": "winnerName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "maxVotes",
				"type": "uint256"
			},
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "party",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "wallet",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "voteCount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					}
				],
				"internalType": "struct Voting.Candidate[]",
				"name": "allCandidates",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "candidateId",
				"type": "uint256"
			}
		],
		"name": "getRevealedVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTotalVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "voter",
				"type": "address"
			}
		],
		"name": "getVoteCommitment",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "voterAddress",
				"type": "address"
			}
		],
		"name": "getVoterStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "registered",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "hasRevealed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getVoters",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "wallet",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "hasVoted",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "hasRevealed",
						"type": "bool"
					}
				],
				"internalType": "struct Voting.Voter[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isRegisteredCandidate",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isRegisteredVoter",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "pendingCandidateAddresses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "pendingVoterAddresses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "party",
				"type": "string"
			}
		],
		"name": "requestCandidateRegistration",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "requestVoterRegistration",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "candidateId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "secret",
				"type": "uint256"
			}
		],
		"name": "revealVote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "revealedVoteCounts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "voteCommitments",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "voterCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "voterRequests",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "voters",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "wallet",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "hasVoted",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "hasRevealed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export const VOTING_CONTRACT_BYTECODE ="608060405234801561000f575f5ffd5b506040516153e43803806153e483398181016040528101906100319190610309565b808210610073576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161006a906103ff565b60405180910390fd5b4282116100b5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100ac90610467565b60405180910390fd5b335f5f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506040518060a001604052808581526020018481526020018381526020018281526020016001151581525060015f820151815f019081610133919061068c565b506020820151816001019081610149919061068c565b5060408201518160020155606082015181600301556080820151816004015f6101000a81548160ff0219169083151502179055509050505050505061075b565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6101e8826101a2565b810181811067ffffffffffffffff82111715610207576102066101b2565b5b80604052505050565b5f610219610189565b905061022582826101df565b919050565b5f67ffffffffffffffff821115610244576102436101b2565b5b61024d826101a2565b9050602081019050919050565b8281835e5f83830152505050565b5f61027a6102758461022a565b610210565b9050828152602081018484840111156102965761029561019e565b5b6102a184828561025a565b509392505050565b5f82601f8301126102bd576102bc61019a565b5b81516102cd848260208601610268565b91505092915050565b5f819050919050565b6102e8816102d6565b81146102f2575f5ffd5b50565b5f81519050610303816102df565b92915050565b5f5f5f5f6080858703121561032157610320610192565b5b5f85015167ffffffffffffffff81111561033e5761033d610196565b5b61034a878288016102a9565b945050602085015167ffffffffffffffff81111561036b5761036a610196565b5b610377878288016102a9565b9350506040610388878288016102f5565b9250506060610399878288016102f5565b91505092959194509250565b5f82825260208201905092915050565b7f496e76616c69642074696d652072616e676500000000000000000000000000005f82015250565b5f6103e96012836103a5565b91506103f4826103b5565b602082019050919050565b5f6020820190508181035f830152610416816103dd565b9050919050565b7f53746172742074696d65206d75737420626520696e20667574757265000000005f82015250565b5f610451601c836103a5565b915061045c8261041d565b602082019050919050565b5f6020820190508181035f83015261047e81610445565b9050919050565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806104d357607f821691505b6020821081036104e6576104e561048f565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026105487fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261050d565b610552868361050d565b95508019841693508086168417925050509392505050565b5f819050919050565b5f61058d610588610583846102d6565b61056a565b6102d6565b9050919050565b5f819050919050565b6105a683610573565b6105ba6105b282610594565b848454610519565b825550505050565b5f5f905090565b6105d16105c2565b6105dc81848461059d565b505050565b5b818110156105ff576105f45f826105c9565b6001810190506105e2565b5050565b601f82111561064457610615816104ec565b61061e846104fe565b8101602085101561062d578190505b610641610639856104fe565b8301826105e1565b50505b505050565b5f82821c905092915050565b5f6106645f1984600802610649565b1980831691505092915050565b5f61067c8383610655565b9150826002028217905092915050565b61069582610485565b67ffffffffffffffff8111156106ae576106ad6101b2565b5b6106b882546104bc565b6106c3828285610603565b5f60209050601f8311600181146106f4575f84156106e2578287015190505b6106ec8582610671565b865550610753565b601f198416610702866104ec565b5f5b8281101561072957848901518255600182019150602085019450602081019050610704565b868310156107465784890151610742601f891682610655565b8355505b6001600288020188555050505b505050505050565b614c7c806107685f395ff3fe608060405234801561000f575f5ffd5b5060043610610204575f3560e01c8063859661d611610118578063c40584b1116100ab578063d6f1694f1161007a578063d6f1694f14610616578063da36cffe14610647578063ece5f30014610677578063ee2128f2146106a7578063f2f7c934146106c357610204565b8063c40584b11461057a578063c4f337fc146105aa578063cdd72253146105c8578063d08597b9146105e657610204565b80639a70b327116100e75780639a70b327146104eb578063a3ec138d14610509578063a9a981a31461053e578063c3322d091461055c57610204565b8063859661d61461046157806386852dca146104915780638da5cb5b146104af5780639a0e7d66146104cd57610204565b806342169e481161019b5780635ef16fa91161016a5780635ef16fa91461036f5780635f067a961461039f57806360b46467146103cf5780636d5712d9146103ff57806378e3ef201461042f57610204565b806342169e48146103055780634717f97c146103235780634b1d3ede1461034357806359f784681461036557610204565b8063119d4ddb116101d7578063119d4ddb1461027c57806327846c8d146102985780633477ee2e146102b45780633e858923146102e957610204565b806302c7538a1461020857806306a49fce1461022457806307be7e91146102425780630d15fd771461025e575b5f5ffd5b610222600480360381019061021d91906136fa565b6106f3565b005b61022c610ae1565b604051610239919061395a565b60405180910390f35b61025c600480360381019061025791906139a4565b610dd5565b005b61026661102f565b60405161027391906139de565b60405180910390f35b610296600480360381019061029191906139a4565b611035565b005b6102b260048036038101906102ad9190613a21565b61133a565b005b6102ce60048036038101906102c99190613a5f565b6116d2565b6040516102e096959493929190613af0565b60405180910390f35b61030360048036038101906102fe9190613b90565b611841565b005b61030d611b63565b60405161031a91906139de565b60405180910390f35b61032b611b69565b60405161033a93929190613bbb565b60405180910390f35b61034b611c82565b60405161035c959493929190613bfe565b60405180910390f35b61036d611dbd565b005b610389600480360381019061038491906139a4565b611eb3565b6040516103969190613c5d565b60405180910390f35b6103b960048036038101906103b49190613a5f565b611ed0565b6040516103c691906139de565b60405180910390f35b6103e960048036038101906103e49190613a5f565b611eea565b6040516103f691906139de565b60405180910390f35b610419600480360381019061041491906139a4565b611eff565b6040516104269190613c85565b60405180910390f35b610449600480360381019061044491906139a4565b611f14565b60405161045893929190613c9e565b60405180910390f35b61047b600480360381019061047691906139a4565b612000565b6040516104889190613c85565b60405180910390f35b610499612046565b6040516104a69190613d4d565b60405180910390f35b6104b76121ad565b6040516104c49190613d6d565b60405180910390f35b6104d56121d1565b6040516104e291906139de565b60405180910390f35b6104f361221f565b604051610500919061395a565b60405180910390f35b610523600480360381019061051e91906139a4565b61269d565b60405161053596959493929190613d86565b60405180910390f35b6105466127a1565b60405161055391906139de565b60405180910390f35b6105646127a7565b6040516105719190613f2d565b60405180910390f35b610594600480360381019061058f91906139a4565b612bc4565b6040516105a191906139de565b60405180910390f35b6105b2612bd9565b6040516105bf9190613ff5565b60405180910390f35b6105d0612c64565b6040516105dd9190613f2d565b60405180910390f35b61060060048036038101906105fb91906139a4565b612ff5565b60405161060d91906139de565b60405180910390f35b610630600480360381019061062b91906139a4565b61300a565b60405161063e929190614015565b60405180910390f35b610661600480360381019061065c91906139a4565b6130b3565b60405161066e9190613c5d565b60405180910390f35b610691600480360381019061068c9190613a5f565b6130d0565b60405161069e9190613d6d565b60405180910390f35b6106c160048036038101906106bc919061403c565b61310b565b005b6106dd60048036038101906106d89190613a5f565b6134ad565b6040516106ea9190613d6d565b60405180910390f35b600b5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f9054906101000a900460ff161561077d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610774906140fc565b60405180910390fd5b600c5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f9054906101000a900460ff1615610807576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107fe90614164565b60405180910390fd5b5f600e5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205414610886576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161087d906141cc565b60405180910390fd5b60075f81548092919061089890614217565b9190505550600754600e5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055506040518060c0016040528060075481526020018281526020013373ffffffffffffffffffffffffffffffffffffffff1681526020015f151581526020015f151581526020015f1515815250600a5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f820151815f01556020820151816001019081610986919061445b565b506040820151816002015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060608201518160020160146101000a81548160ff02191690831515021790555060808201518160020160156101000a81548160ff02191690831515021790555060a08201518160020160166101000a81548160ff021916908315150217905550905050601033908060018154018082558091505060019003905f5260205f20015f9091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff167f9ce429b3729c51a5c1c92849e7088bf7955d17c5510bf84ac6ed5513a289d11382604051610ad6919061452a565b60405180910390a250565b60605f5f90505f600190505b6006548111610b3e5760095f8281526020019081526020015f206005015f9054906101000a900460ff1615610b2b578180610b2790614217565b9250505b8080610b3690614217565b915050610aed565b505f8167ffffffffffffffff811115610b5a57610b596135d6565b5b604051908082528060200260200182016040528015610b9357816020015b610b806134e8565b815260200190600190039081610b785790505b5090505f5f90505f600190505b6006548111610dcb5760095f8281526020019081526020015f206005015f9054906101000a900460ff1615610db85760095f8281526020019081526020015f206040518060c00160405290815f8201548152602001600182018054610c049061428b565b80601f0160208091040260200160405190810160405280929190818152602001828054610c309061428b565b8015610c7b5780601f10610c5257610100808354040283529160200191610c7b565b820191905f5260205f20905b815481529060010190602001808311610c5e57829003601f168201915b50505050508152602001600282018054610c949061428b565b80601f0160208091040260200160405190810160405280929190818152602001828054610cc09061428b565b8015610d0b5780601f10610ce257610100808354040283529160200191610d0b565b820191905f5260205f20905b815481529060010190602001808311610cee57829003601f168201915b50505050508152602001600382015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200160048201548152602001600582015f9054906101000a900460ff161515151581525050838380610d9990614217565b945081518110610dac57610dab61454a565b5b60200260200101819052505b8080610dc390614217565b915050610ba0565b5081935050505090565b5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610e63576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e5a906145c1565b60405180910390fd5b5f600d5f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205490505f8111610ee6576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610edd90614629565b60405180910390fd5b60095f8281526020019081526020015f206005015f9054906101000a900460ff1615610f47576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f3e90614691565b60405180910390fd5b600160095f8381526020019081526020015f206005015f6101000a81548160ff0219169083151502179055506001600c5f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f6101000a81548160ff0219169083151502179055507f2ca28526ca2825de0ff39bb564fe7a42fe236f8a86df7bfa0d1c9114e90091eb8160095f8481526020019081526020015f2060010160095f8581526020019081526020015f20600201856040516110239493929190614730565b60405180910390a15050565b60085481565b5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146110c3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016110ba906145c1565b60405180910390fd5b5f600e5f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205411611142576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161113990614629565b60405180910390fd5b600a5f8273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160149054906101000a900460ff16156111d0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016111c790614691565b60405180910390fd5b6001600a5f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160146101000a81548160ff0219169083151502179055506001600b5f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f6101000a81548160ff0219169083151502179055507f18263abf741210021f1b52ef33c4e8b0981f0a6919c7ee358805a3a53d2e2d9b600a5f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f0154600a5f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f206001018360405161132f93929190614781565b60405180910390a150565b600b5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f9054906101000a900460ff166113c3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113ba90614807565b60405180910390fd5b600a5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160149054906101000a900460ff16611450576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114479061486f565b60405180910390fd5b600a5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160169054906101000a900460ff16156114de576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114d5906148d7565b60405180910390fd5b60095f8381526020019081526020015f206005015f9054906101000a900460ff1661153e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115359061493f565b60405180910390fd5b5f828260405160200161155292919061497d565b6040516020818303038152906040528051906020012090508060115f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054146115e9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115e0906149f2565b60405180910390fd5b60125f8481526020019081526020015f205f81548092919061160a90614217565b91905055506001600a5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160166101000a81548160ff02191690831515021790555060085f81548092919061167a90614217565b91905055503373ffffffffffffffffffffffffffffffffffffffff167f522b45c661375abb939dc17b4b600412c93af64fcbe24859a73539d01bb4eec8846040516116c591906139de565b60405180910390a2505050565b6009602052805f5260405f205f91509050805f0154908060010180546116f79061428b565b80601f01602080910402602001604051908101604052809291908181526020018280546117239061428b565b801561176e5780601f106117455761010080835404028352916020019161176e565b820191905f5260205f20905b81548152906001019060200180831161175157829003601f168201915b5050505050908060020180546117839061428b565b80601f01602080910402602001604051908101604052809291908181526020018280546117af9061428b565b80156117fa5780601f106117d1576101008083540402835291602001916117fa565b820191905f5260205f20905b8154815290600101906020018083116117dd57829003601f168201915b505050505090806003015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690806004015490806005015f9054906101000a900460ff16905086565b600160020154421015801561185b57506001600301544211155b61189a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161189190614a5a565b60405180910390fd5b60016004015f9054906101000a900460ff166118eb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016118e290614ac2565b60405180910390fd5b600b5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f9054906101000a900460ff16611974576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161196b90614807565b60405180910390fd5b600a5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160149054906101000a900460ff16611a01576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016119f89061486f565b60405180910390fd5b5f5f1b60115f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205414611a82576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611a7990614b2a565b60405180910390fd5b8060115f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055506001600a5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160156101000a81548160ff0219169083151502179055503373ffffffffffffffffffffffffffffffffffffffff167fd8333eeb60b5f1fb9e6e2c3c665fb5ec81dee6d37fcd17dda27d169009d6c7eb60405160405180910390a250565b60075481565b60605f6060600160030154421180611b90575060016004015f9054906101000a900460ff16155b611bcf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611bc690614b92565b60405180910390fd5b5f611bd8610ae1565b90505f60405180602001604052805f81525090505f5f90505f5f90505b8351811015611c70575f848281518110611c1257611c1161454a565b5b60200260200101515f015190505f60125f8381526020019081526020015f2054905083811115611c6157809350858381518110611c5257611c5161454a565b5b60200260200101516020015194505b50508080600101915050611bf5565b50818184955095509550505050909192565b6001805f018054611c929061428b565b80601f0160208091040260200160405190810160405280929190818152602001828054611cbe9061428b565b8015611d095780601f10611ce057610100808354040283529160200191611d09565b820191905f5260205f20905b815481529060010190602001808311611cec57829003601f168201915b505050505090806001018054611d1e9061428b565b80601f0160208091040260200160405190810160405280929190818152602001828054611d4a9061428b565b8015611d955780601f10611d6c57610100808354040283529160200191611d95565b820191905f5260205f20905b815481529060010190602001808311611d7857829003601f168201915b505050505090806002015490806003015490806004015f9054906101000a900460ff16905085565b5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611e4b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611e42906145c1565b60405180910390fd5b5f60016004015f6101000a81548160ff0219169083151502179055505f5f611e71611b69565b50915091507f4d31db6748edbbd9e5b81d507a6477be9bddc93567dc5e6fac4e6bae81f27fa58282604051611ea7929190614bb0565b60405180910390a15050565b600c602052805f5260405f205f915054906101000a900460ff1681565b5f60125f8381526020019081526020015f20549050919050565b6012602052805f5260405f205f915090505481565b6011602052805f5260405f205f915090505481565b5f5f5f5f600e5f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205411600a5f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160149054906101000a900460ff16600a5f8773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160169054906101000a900460ff169250925092509193909250565b5f60115f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20549050919050565b61204e613532565b60016040518060a00160405290815f8201805461206a9061428b565b80601f01602080910402602001604051908101604052809291908181526020018280546120969061428b565b80156120e15780601f106120b8576101008083540402835291602001916120e1565b820191905f5260205f20905b8154815290600101906020018083116120c457829003601f168201915b505050505081526020016001820180546120fa9061428b565b80601f01602080910402602001604051908101604052809291908181526020018280546121269061428b565b80156121715780601f1061214857610100808354040283529160200191612171565b820191905f5260205f20905b81548152906001019060200180831161215457829003601f168201915b505050505081526020016002820154815260200160038201548152602001600482015f9054906101000a900460ff161515151581525050905090565b5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b5f5f5f90505f600190505b60065481116122175760125f8281526020019081526020015f2054826122029190614bde565b9150808061220f90614217565b9150506121dc565b508091505090565b60605f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146122af576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016122a6906145c1565b60405180910390fd5b5f5f90505f5f90505b600f80549050811015612388575f600f82815481106122da576122d961454a565b5b905f5260205f20015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690505f600d5f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905060095f8281526020019081526020015f206005015f9054906101000a900460ff1661237957838061237590614217565b9450505b505080806001019150506122b8565b505f8167ffffffffffffffff8111156123a4576123a36135d6565b5b6040519080825280602002602001820160405280156123dd57816020015b6123ca6134e8565b8152602001906001900390816123c25790505b5090505f5f90505f5f90505b600f80549050811015612693575f600f828154811061240b5761240a61454a565b5b905f5260205f20015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690505f600d5f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905060095f8281526020019081526020015f206005015f9054906101000a900460ff166126845760095f8281526020019081526020015f206040518060c00160405290815f82015481526020016001820180546124d09061428b565b80601f01602080910402602001604051908101604052809291908181526020018280546124fc9061428b565b80156125475780601f1061251e57610100808354040283529160200191612547565b820191905f5260205f20905b81548152906001019060200180831161252a57829003601f168201915b505050505081526020016002820180546125609061428b565b80601f016020809104026020016040519081016040528092919081815260200182805461258c9061428b565b80156125d75780601f106125ae576101008083540402835291602001916125d7565b820191905f5260205f20905b8154815290600101906020018083116125ba57829003601f168201915b50505050508152602001600382015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200160048201548152602001600582015f9054906101000a900460ff16151515158152505085858061266590614217565b9650815181106126785761267761454a565b5b60200260200101819052505b505080806001019150506123e9565b5081935050505090565b600a602052805f5260405f205f91509050805f0154908060010180546126c29061428b565b80601f01602080910402602001604051908101604052809291908181526020018280546126ee9061428b565b80156127395780601f1061271057610100808354040283529160200191612739565b820191905f5260205f20905b81548152906001019060200180831161271c57829003601f168201915b505050505090806002015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060020160149054906101000a900460ff16908060020160159054906101000a900460ff16908060020160169054906101000a900460ff16905086565b60065481565b60605f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614612837576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161282e906145c1565b60405180910390fd5b5f5f90505f5f90505b6010805490508110156128fb575f601082815481106128625761286161454a565b5b905f5260205f20015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600a5f8273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160149054906101000a900460ff166128ed5782806128e990614217565b9350505b508080600101915050612840565b505f8167ffffffffffffffff811115612917576129166135d6565b5b60405190808252806020026020018201604052801561295057816020015b61293d613560565b8152602001906001900390816129355790505b5090505f5f90505f5f90505b601080549050811015612bba575f6010828154811061297e5761297d61454a565b5b905f5260205f20015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600a5f8273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160149054906101000a900460ff16612bac57600a5f8273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f206040518060c00160405290815f8201548152602001600182018054612a5b9061428b565b80601f0160208091040260200160405190810160405280929190818152602001828054612a879061428b565b8015612ad25780601f10612aa957610100808354040283529160200191612ad2565b820191905f5260205f20905b815481529060010190602001808311612ab557829003601f168201915b50505050508152602001600282015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016002820160149054906101000a900460ff161515151581526020016002820160159054906101000a900460ff161515151581526020016002820160169054906101000a900460ff161515151581525050848480612b8d90614217565b955081518110612ba057612b9f61454a565b5b60200260200101819052505b50808060010191505061295c565b5081935050505090565b600e602052805f5260405f205f915090505481565b60606010805480602002602001604051908101604052809291908181526020018280548015612c5a57602002820191905f5260205f20905b815f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019060010190808311612c11575b5050505050905090565b60605f5f90505f5f90505b601080549050811015612d2b575f60108281548110612c9157612c9061454a565b5b905f5260205f20015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600a5f8273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160149054906101000a900460ff1615612d1d578280612d1990614217565b9350505b508080600101915050612c6f565b505f8167ffffffffffffffff811115612d4757612d466135d6565b5b604051908082528060200260200182016040528015612d8057816020015b612d6d613560565b815260200190600190039081612d655790505b5090505f5f90505f5f90505b601080549050811015612feb575f60108281548110612dae57612dad61454a565b5b905f5260205f20015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600a5f8273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2060020160149054906101000a900460ff1615612fdd57600a5f8273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f206040518060c00160405290815f8201548152602001600182018054612e8c9061428b565b80601f0160208091040260200160405190810160405280929190818152602001828054612eb89061428b565b8015612f035780601f10612eda57610100808354040283529160200191612f03565b820191905f5260205f20905b815481529060010190602001808311612ee657829003601f168201915b50505050508152602001600282015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016002820160149054906101000a900460ff161515151581526020016002820160159054906101000a900460ff161515151581526020016002820160169054906101000a900460ff161515151581525050848480612fbe90614217565b955081518110612fd157612fd061454a565b5b60200260200101819052505b508080600101915050612d8c565b5081935050505090565b600d602052805f5260405f205f915090505481565b5f5f5f600d5f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20541160095f600d5f8773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205481526020019081526020015f206005015f9054906101000a900460ff1691509150915091565b600b602052805f5260405f205f915054906101000a900460ff1681565b600f81815481106130df575f80fd5b905f5260205f20015f915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600c5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f9054906101000a900460ff1615613195576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161318c90614164565b60405180910390fd5b600b5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f9054906101000a900460ff161561321f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401613216906140fc565b60405180910390fd5b5f600d5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20541461329e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401613295906141cc565b60405180910390fd5b60065f8154809291906132b090614217565b9190505550600654600d5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055506040518060c0016040528060065481526020018381526020018281526020013373ffffffffffffffffffffffffffffffffffffffff1681526020015f81526020015f151581525060095f60065481526020019081526020015f205f820151815f01556020820151816001019081613370919061445b565b506040820151816002019081613386919061445b565b506060820151816003015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506080820151816004015560a0820151816005015f6101000a81548160ff021916908315150217905550905050600f33908060018154018082558091505060019003905f5260205f20015f9091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503373ffffffffffffffffffffffffffffffffffffffff167f2c1806f9c994a02f7cb39705d06fd4dc4a7d8639fe220638bbc8bb4a60fb6b8d83836040516134a1929190614c11565b60405180910390a25050565b601081815481106134bc575f80fd5b905f5260205f20015f915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6040518060c001604052805f815260200160608152602001606081526020015f73ffffffffffffffffffffffffffffffffffffffff1681526020015f81526020015f151581525090565b6040518060a0016040528060608152602001606081526020015f81526020015f81526020015f151581525090565b6040518060c001604052805f8152602001606081526020015f73ffffffffffffffffffffffffffffffffffffffff1681526020015f151581526020015f151581526020015f151581525090565b5f604051905090565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b61360c826135c6565b810181811067ffffffffffffffff8211171561362b5761362a6135d6565b5b80604052505050565b5f61363d6135ad565b90506136498282613603565b919050565b5f67ffffffffffffffff821115613668576136676135d6565b5b613671826135c6565b9050602081019050919050565b828183375f83830152505050565b5f61369e6136998461364e565b613634565b9050828152602081018484840111156136ba576136b96135c2565b5b6136c584828561367e565b509392505050565b5f82601f8301126136e1576136e06135be565b5b81356136f184826020860161368c565b91505092915050565b5f6020828403121561370f5761370e6135b6565b5b5f82013567ffffffffffffffff81111561372c5761372b6135ba565b5b613738848285016136cd565b91505092915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b5f819050919050565b61377c8161376a565b82525050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f6137b482613782565b6137be818561378c565b93506137ce81856020860161379c565b6137d7816135c6565b840191505092915050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61380b826137e2565b9050919050565b61381b81613801565b82525050565b5f8115159050919050565b61383581613821565b82525050565b5f60c083015f8301516138505f860182613773565b506020830151848203602086015261386882826137aa565b9150506040830151848203604086015261388282826137aa565b91505060608301516138976060860182613812565b5060808301516138aa6080860182613773565b5060a08301516138bd60a086018261382c565b508091505092915050565b5f6138d3838361383b565b905092915050565b5f602082019050919050565b5f6138f182613741565b6138fb818561374b565b93508360208202850161390d8561375b565b805f5b85811015613948578484038952815161392985826138c8565b9450613934836138db565b925060208a01995050600181019050613910565b50829750879550505050505092915050565b5f6020820190508181035f83015261397281846138e7565b905092915050565b61398381613801565b811461398d575f5ffd5b50565b5f8135905061399e8161397a565b92915050565b5f602082840312156139b9576139b86135b6565b5b5f6139c684828501613990565b91505092915050565b6139d88161376a565b82525050565b5f6020820190506139f15f8301846139cf565b92915050565b613a008161376a565b8114613a0a575f5ffd5b50565b5f81359050613a1b816139f7565b92915050565b5f5f60408385031215613a3757613a366135b6565b5b5f613a4485828601613a0d565b9250506020613a5585828601613a0d565b9150509250929050565b5f60208284031215613a7457613a736135b6565b5b5f613a8184828501613a0d565b91505092915050565b5f82825260208201905092915050565b5f613aa482613782565b613aae8185613a8a565b9350613abe81856020860161379c565b613ac7816135c6565b840191505092915050565b613adb81613801565b82525050565b613aea81613821565b82525050565b5f60c082019050613b035f8301896139cf565b8181036020830152613b158188613a9a565b90508181036040830152613b298187613a9a565b9050613b386060830186613ad2565b613b4560808301856139cf565b613b5260a0830184613ae1565b979650505050505050565b5f819050919050565b613b6f81613b5d565b8114613b79575f5ffd5b50565b5f81359050613b8a81613b66565b92915050565b5f60208284031215613ba557613ba46135b6565b5b5f613bb284828501613b7c565b91505092915050565b5f6060820190508181035f830152613bd38186613a9a565b9050613be260208301856139cf565b8181036040830152613bf481846138e7565b9050949350505050565b5f60a0820190508181035f830152613c168188613a9a565b90508181036020830152613c2a8187613a9a565b9050613c3960408301866139cf565b613c4660608301856139cf565b613c536080830184613ae1565b9695505050505050565b5f602082019050613c705f830184613ae1565b92915050565b613c7f81613b5d565b82525050565b5f602082019050613c985f830184613c76565b92915050565b5f606082019050613cb15f830186613ae1565b613cbe6020830185613ae1565b613ccb6040830184613ae1565b949350505050565b5f60a083015f8301518482035f860152613ced82826137aa565b91505060208301518482036020860152613d0782826137aa565b9150506040830151613d1c6040860182613773565b506060830151613d2f6060860182613773565b506080830151613d42608086018261382c565b508091505092915050565b5f6020820190508181035f830152613d658184613cd3565b905092915050565b5f602082019050613d805f830184613ad2565b92915050565b5f60c082019050613d995f8301896139cf565b8181036020830152613dab8188613a9a565b9050613dba6040830187613ad2565b613dc76060830186613ae1565b613dd46080830185613ae1565b613de160a0830184613ae1565b979650505050505050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b5f60c083015f830151613e2a5f860182613773565b5060208301518482036020860152613e4282826137aa565b9150506040830151613e576040860182613812565b506060830151613e6a606086018261382c565b506080830151613e7d608086018261382c565b5060a0830151613e9060a086018261382c565b508091505092915050565b5f613ea68383613e15565b905092915050565b5f602082019050919050565b5f613ec482613dec565b613ece8185613df6565b935083602082028501613ee085613e06565b805f5b85811015613f1b5784840389528151613efc8582613e9b565b9450613f0783613eae565b925060208a01995050600181019050613ee3565b50829750879550505050505092915050565b5f6020820190508181035f830152613f458184613eba565b905092915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b5f613f818383613812565b60208301905092915050565b5f602082019050919050565b5f613fa382613f4d565b613fad8185613f57565b9350613fb883613f67565b805f5b83811015613fe8578151613fcf8882613f76565b9750613fda83613f8d565b925050600181019050613fbb565b5085935050505092915050565b5f6020820190508181035f83015261400d8184613f99565b905092915050565b5f6040820190506140285f830185613ae1565b6140356020830184613ae1565b9392505050565b5f5f60408385031215614052576140516135b6565b5b5f83013567ffffffffffffffff81111561406f5761406e6135ba565b5b61407b858286016136cd565b925050602083013567ffffffffffffffff81111561409c5761409b6135ba565b5b6140a8858286016136cd565b9150509250929050565b7f416c7265616479207265676973746572656420617320766f74657200000000005f82015250565b5f6140e6601b83613a8a565b91506140f1826140b2565b602082019050919050565b5f6020820190508181035f830152614113816140da565b9050919050565b7f416c726561647920726567697374657265642061732063616e646964617465005f82015250565b5f61414e601f83613a8a565b91506141598261411a565b602082019050919050565b5f6020820190508181035f83015261417b81614142565b9050919050565b7f5265717565737420616c72656164792070656e64696e670000000000000000005f82015250565b5f6141b6601783613a8a565b91506141c182614182565b602082019050919050565b5f6020820190508181035f8301526141e3816141aa565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f6142218261376a565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203614253576142526141ea565b5b600182019050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806142a257607f821691505b6020821081036142b5576142b461425e565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026143177fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826142dc565b61432186836142dc565b95508019841693508086168417925050509392505050565b5f819050919050565b5f61435c6143576143528461376a565b614339565b61376a565b9050919050565b5f819050919050565b61437583614342565b61438961438182614363565b8484546142e8565b825550505050565b5f5f905090565b6143a0614391565b6143ab81848461436c565b505050565b5b818110156143ce576143c35f82614398565b6001810190506143b1565b5050565b601f821115614413576143e4816142bb565b6143ed846142cd565b810160208510156143fc578190505b614410614408856142cd565b8301826143b0565b50505b505050565b5f82821c905092915050565b5f6144335f1984600802614418565b1980831691505092915050565b5f61444b8383614424565b9150826002028217905092915050565b61446482613782565b67ffffffffffffffff81111561447d5761447c6135d6565b5b614487825461428b565b6144928282856143d2565b5f60209050601f8311600181146144c3575f84156144b1578287015190505b6144bb8582614440565b865550614522565b601f1984166144d1866142bb565b5f5b828110156144f8578489015182556001820191506020850194506020810190506144d3565b868310156145155784890151614511601f891682614424565b8355505b6001600288020188555050505b505050505050565b5f6020820190508181035f8301526145428184613a9a565b905092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b7f4e6f7420617574686f72697a65640000000000000000000000000000000000005f82015250565b5f6145ab600e83613a8a565b91506145b682614577565b602082019050919050565b5f6020820190508181035f8301526145d88161459f565b9050919050565b7f4e6f2070656e64696e67207265717565737400000000000000000000000000005f82015250565b5f614613601283613a8a565b915061461e826145df565b602082019050919050565b5f6020820190508181035f83015261464081614607565b9050919050565b7f416c726561647920617070726f766564000000000000000000000000000000005f82015250565b5f61467b601083613a8a565b915061468682614647565b602082019050919050565b5f6020820190508181035f8301526146a88161466f565b9050919050565b5f81546146bb8161428b565b6146c58186613a8a565b9450600182165f81146146df57600181146146f557614727565b60ff198316865281151560200286019350614727565b6146fe856142bb565b5f5b8381101561471f57815481890152600182019150602081019050614700565b808801955050505b50505092915050565b5f6080820190506147435f8301876139cf565b818103602083015261475581866146af565b9050818103604083015261476981856146af565b90506147786060830184613ad2565b95945050505050565b5f6060820190506147945f8301866139cf565b81810360208301526147a681856146af565b90506147b56040830184613ad2565b949350505050565b7f4e6f7420726567697374657265640000000000000000000000000000000000005f82015250565b5f6147f1600e83613a8a565b91506147fc826147bd565b602082019050919050565b5f6020820190508181035f83015261481e816147e5565b9050919050565b7f4e6f7420617070726f76656400000000000000000000000000000000000000005f82015250565b5f614859600c83613a8a565b915061486482614825565b602082019050919050565b5f6020820190508181035f8301526148868161484d565b9050919050565b7f416c72656164792072657665616c6564000000000000000000000000000000005f82015250565b5f6148c1601083613a8a565b91506148cc8261488d565b602082019050919050565b5f6020820190508181035f8301526148ee816148b5565b9050919050565b7f496e76616c69642063616e6469646174650000000000000000000000000000005f82015250565b5f614929601183613a8a565b9150614934826148f5565b602082019050919050565b5f6020820190508181035f8301526149568161491d565b9050919050565b5f819050919050565b6149776149728261376a565b61495d565b82525050565b5f6149888285614966565b6020820191506149988284614966565b6020820191508190509392505050565b7f496e76616c696420766f74652072657665616c000000000000000000000000005f82015250565b5f6149dc601383613a8a565b91506149e7826149a8565b602082019050919050565b5f6020820190508181035f830152614a09816149d0565b9050919050565b7f566f74696e67206e6f74206163746976650000000000000000000000000000005f82015250565b5f614a44601183613a8a565b9150614a4f82614a10565b602082019050919050565b5f6020820190508181035f830152614a7181614a38565b9050919050565b7f456c656374696f6e206e6f7420616374697665000000000000000000000000005f82015250565b5f614aac601383613a8a565b9150614ab782614a78565b602082019050919050565b5f6020820190508181035f830152614ad981614aa0565b9050919050565b7f416c726561647920766f746564000000000000000000000000000000000000005f82015250565b5f614b14600d83613a8a565b9150614b1f82614ae0565b602082019050919050565b5f6020820190508181035f830152614b4181614b08565b9050919050565b7f566f74696e67207374696c6c20616374697665000000000000000000000000005f82015250565b5f614b7c601383613a8a565b9150614b8782614b48565b602082019050919050565b5f6020820190508181035f830152614ba981614b70565b9050919050565b5f6040820190508181035f830152614bc88185613a9a565b9050614bd760208301846139cf565b9392505050565b5f614be88261376a565b9150614bf38361376a565b9250828201905080821115614c0b57614c0a6141ea565b5b92915050565b5f6040820190508181035f830152614c298185613a9a565b90508181036020830152614c3d8184613a9a565b9050939250505056fea2646970667358221220646e43a19b07f8f54e2a20404d765f2fb8093cc9deb93f4b331ad709e09e7af164736f6c634300081e0033";


// function for deploying a contract
// it requires the election name,description and starting and ending time stamp of the election process
export async function deployVotingContract(
  signer: JsonRpcSigner,
  name: string,
  description: string,
  startTime: number,
  endTime: number
): Promise<Contract> {
  const factory = new ContractFactory(VOTING_CONTRACT_ABI, VOTING_CONTRACT_BYTECODE, signer);
  const contract = await factory.deploy(name, description, startTime, endTime);
  await contract.waitForDeployment();
  return contract as unknown as Contract;
}

// this function returns an ethers.Contract instance for the smart contract using the given address, ABI, and either a signer 
// (for sending transactions) or a provider (for reading data).
export function getVotingContract(
  contractAddress: string,
  provider: BrowserProvider,
  signer?: JsonRpcSigner
): Contract {
  return new Contract(contractAddress, VOTING_CONTRACT_ABI, signer || provider);
}


// this function retrieves the election information from the contract
// it returns an object containing the election name, description, start time, end time, and active status

export async function getElectionInfo(contract: Contract) {
  const election = await contract.getElectionInfo();
  return {
    name: election.name,
    description: election.description,
    startTime: Number(election.startTime),
    endTime: Number(election.endTime),
    active: election.active
  };
}


// this function retrieves the list of candidates from the contract
// it returns an array of candidate objects, each containing id, name, party, wallet address vote count, and approval status

export async function getCandidates(contract: Contract) {
  const candidates = await contract.getCandidates();
  return candidates.map((candidate: any) => ({
    id: Number(candidate.id),
    name: candidate.name,
    party: candidate.party,
    wallet: candidate.wallet,
    voteCount: Number(candidate.voteCount),
    approved: candidate.approved
  }));
}


// 
export async function getPendingCandidates(contract: Contract) {
  const candidates = await contract.getPendingCandidates();
  return candidates.map((candidate: any) => ({
    id: Number(candidate.id),
    name: candidate.name,
    party: candidate.party,
    wallet: candidate.wallet,
    voteCount: Number(candidate.voteCount),
    approved: candidate.approved
  }));
}

export async function getPendingVoters(contract: Contract) {
  const voters = await contract.getPendingVoters();
  return voters.map((voter: any) => ({
    id: Number(voter.id),
    name: voter.name,
    wallet: voter.wallet,
    hasVoted: voter.hasVoted,
    approved: voter.approved
  }));
}

export async function getResults(contract: Contract) {
  const results = await contract.getResults();
  return {
    winnerName: results.winnerName,
    maxVotes: Number(results.maxVotes),
    allCandidates: results.allCandidates.map((candidate: any) => ({
      id: Number(candidate.id),
      name: candidate.name,
      party: candidate.party,
      wallet: candidate.wallet,
      voteCount: Number(candidate.voteCount),
      approved: candidate.approved
    }))
  };
}

export async function getVoterStatus(contract: Contract, voterAddress: string) {
  const status = await contract.getVoterStatus(voterAddress);
  return {
    registered: status.registered,
    approved: status.approved,
    hasVoted: status.hasVoted
  };
}

export async function getCandidateStatus(contract: Contract, candidateAddress: string) {
  const status = await contract.getCandidateStatus(candidateAddress);
  return {
    registered: status.registered,
    approved: status.approved
  };
}

export function generateVoteCommitment(candidateId: number, secret: number): string {
  return solidityPackedKeccak256(['uint256', 'uint256'], [candidateId, secret]);
}

// Utility function to generate a random secret for vote commitment
export function generateRandomSecret(): number {
  return Math.floor(Math.random() * 1000000000); // Random 9-digit number
}

// this function allows a voter to commit their vote by submitting a hash
// The hash is generated using candidateId and a secret number
export async function commitVote(contract: Contract, voteHash: string) {
  const tx = await contract.commitVote(voteHash);
  await tx.wait();
  return tx;
}

// this function allows the owner to start the reveal phase after voting ends
export async function startRevealPhase(contract: Contract) {
  const tx = await contract.startRevealPhase();
  await tx.wait();
  return tx;
}

// this function allows a voter to reveal their vote by providing the original candidateId and secret
export async function revealVote(contract: Contract, candidateId: number, secret: number) {
  const tx = await contract.revealVote(candidateId, secret);
  await tx.wait();
  return tx;
}

// this function retrieves the vote commitment hash for a specific voter
export async function getVoteCommitment(contract: Contract, voterAddress: string): Promise<string> {
  return await contract.getVoteCommitment(voterAddress);
}

// this function retrieves the number of revealed votes for a specific candidate
export async function getRevealedVotes(contract: Contract, candidateId: number): Promise<number> {
  const votes = await contract.getRevealedVotes(candidateId);
  return Number(votes);
}

// this function checks if the reveal phase has started
export async function isRevealPhaseStarted(contract: Contract): Promise<boolean> {
  return await contract.revealPhaseStarted();
}

// this function gets the total number of votes cast (revealed votes)
export async function getTotalVotes(contract: Contract): Promise<number> {
  const totalVotes = await contract.totalVotes();
  return Number(totalVotes);
}

// Utility function to verify a vote commitment locally
// This can be used to verify that a commitment matches the candidateId and secret
export function verifyVoteCommitment(candidateId: number, secret: number, expectedHash: string): boolean {
  const computedHash = generateVoteCommitment(candidateId, secret);
  return computedHash === expectedHash;
}

// this function retrieves all vote commitments for verification purposes
// Returns an array of objects with voter addresses and their commitments
export async function getAllVoteCommitments(contract: Contract, voterAddresses: string[]) {
  const commitments = [];
  for (const address of voterAddresses) {
    const commitment = await getVoteCommitment(contract, address);
    if (commitment !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      commitments.push({
        voter: address,
        commitment: commitment
      });
    }
  }
  return commitments;
}

// this function retrieves the revealed vote counts for all candidates
export async function getAllRevealedVotes(contract: Contract) {
  const candidates = await getCandidates(contract);
  const revealedVotes = [];
  
  for (const candidate of candidates) {
    const votes = await getRevealedVotes(contract, candidate.id);
    revealedVotes.push({
      candidateId: candidate.id,
      candidateName: candidate.name,
      party: candidate.party,
      votes: votes
    });
  }
  
  return revealedVotes;
}

// Helper function to get voters who have committed but not revealed
export async function getVotersWithUnrevealedCommitments(contract: Contract, voterAddresses: string[]) {
  const unrevealedVoters = [];
  
  for (const address of voterAddresses) {
    const commitment = await getVoteCommitment(contract, address);
    const voterStatus = await getVoterStatus(contract, address);
    
    if (commitment !== '0x0000000000000000000000000000000000000000000000000000000000000000' && 
        !voterStatus.hasVoted) {
      unrevealedVoters.push({
        address: address,
        commitment: commitment
      });
    }
  }
  
  return unrevealedVoters;
}

// ===== EXISTING FUNCTIONS (Registration, Approval, etc.) =====

// this function allows a user to request candidate registration
export async function requestCandidateRegistration(contract: Contract, name: string, party: string) {
  const tx = await contract.requestCandidateRegistration(name, party);
  await tx.wait();
  return tx;
}

// this function allows a user to request voter registration
export async function requestVoterRegistration(contract: Contract, name: string) {
  const tx = await contract.requestVoterRegistration(name);
  await tx.wait();
  return tx;
}

// this function allows the owner to approve a candidate
export async function approveCandidate(contract: Contract, candidateAddress: string) {
  const tx = await contract.approveCandidate(candidateAddress);
  await tx.wait();
  return tx;
}

// this function allows the owner to approve a voter
export async function approveVoter(contract: Contract, voterAddress: string) {
  const tx = await contract.approveVoter(voterAddress);
  await tx.wait();
  return tx;
}

// this function allows the owner to end the election
export async function endElection(contract: Contract) {
  const tx = await contract.endElection();
  await tx.wait();
  return tx;
}