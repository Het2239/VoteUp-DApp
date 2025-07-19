// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Voting
 * @dev A smart contract for managing a voting system with candidates and voters.
 * @author Het Chavadiya
 * @notice this contract allows candidates to register, voters to register, and for votes to be cast and revealed with E2E verifiable voting.
 */

contract Voting {
    // structs for Candidates, Voters, and Election
    // These structs define the data structure for candidates, voters, and election details.
    struct Candidate {
        uint id;
        string name;
        string party;
        address wallet;
        uint voteCount;
        bool approved;
    }

    struct Voter {
        uint id;
        string name;
        address wallet;
        bool approved;
        bool hasVoted;
        bool hasRevealed;
    }

    struct Election {
        string name;
        string description;
        uint startTime;
        uint endTime;
        bool active;
    }

    address public owner; // Owner of the contract
    Election public election; // Election details

    uint public candidateCount; // Total number of candidates
    uint public voterCount; // Total number of voters
    uint public totalVotes; // Total votes cast
    

    mapping(uint => Candidate) public candidates; // Mapping of candidate ID to Candidate struct
    mapping(address => Voter) public voters; // Mapping of voter address to Voter struct
    mapping(address => bool) public isRegisteredVoter; // Mapping to check if an address is a registered voter
    mapping(address => bool) public isRegisteredCandidate; // Mapping to check if an address is a registered candidate
    mapping(address => uint) public candidateRequests; // Mapping of address to candidate request ID
    mapping(address => uint) public voterRequests; // Mapping of address to voter request ID

    address[] public pendingCandidateAddresses; // List of addresses with pending candidate requests
    address[] public pendingVoterAddresses; // List of addresses with pending voter requests

    // --- E2E-Vote data ---
    mapping(address => bytes32) public voteCommitments; // hash(vote, secret)
    mapping(uint => uint) public revealedVoteCounts; // candidateId => vote count

    

    // --- Events ---
    event CandidateRequested(address indexed user, string name, string party);
    event VoterRequested(address indexed user, string name);
    event CandidateApproved(uint id, string name, string party, address wallet);
    event VoterApproved(uint id, string name, address wallet);
    event VoteCommitted(address indexed voter);
    event VoteRevealed(address indexed voter, uint candidateId);
    event ElectionEnded(string winnerName, uint winnerVotes);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier votingOpen() {
        require(
            block.timestamp >= election.startTime &&
                block.timestamp <= election.endTime,
            "Voting not active"
        );
        require(election.active, "Election not active");
        _;
    }

    modifier votingClosed() {
        require(
            block.timestamp > election.endTime || !election.active,
            "Voting still active"
        );
        _;
    }

    modifier revealPhaseOpen() {
    require(
        block.timestamp > election.endTime &&
        block.timestamp <= election.endTime + 24 hours,
        "Reveal phase not active"
    );
    _;
}


    // constructor to initialize the election
    // This constructor sets the election details and ensures the start time is in the future.
    // It also sets the owner of the contract to the address that deploys it.
    constructor(
        string memory _name,
        string memory _description,
        uint _startTime,
        uint _endTime
    ) {
        require(_startTime < _endTime, "Invalid time range");
        require(_startTime > block.timestamp, "Start time must be in future");

        owner = msg.sender;
        election = Election(_name, _description, _startTime, _endTime, true);
    }

    // this function allows a candidate to request registration
    // It checks if the candidate is already registered or has a pending request.
    function requestCandidateRegistration(
        string memory name,
        string memory party
    ) public {
        require(
            !isRegisteredCandidate[msg.sender],
            "Already registered as candidate"
        );
        require(!isRegisteredVoter[msg.sender], "Already registered as voter");
        require(candidateRequests[msg.sender] == 0, "Request already pending");

        candidateCount++;
        candidateRequests[msg.sender] = candidateCount;
        candidates[candidateCount] = Candidate(
            candidateCount,
            name,
            party,
            msg.sender,
            0,
            false
        );
        pendingCandidateAddresses.push(msg.sender);

        emit CandidateRequested(msg.sender, name, party);
    }

    // this function allows a voter to request registration
    // It checks if the voter is already registered or has a pending request.
    function requestVoterRegistration(string memory name) public {
        require(!isRegisteredVoter[msg.sender], "Already registered as voter");
        require(
            !isRegisteredCandidate[msg.sender],
            "Already registered as candidate"
        );
        require(voterRequests[msg.sender] == 0, "Request already pending");

        voterCount++;
        voterRequests[msg.sender] = voterCount;
        voters[msg.sender] = Voter(voterCount, name, msg.sender, false, false, false);
        pendingVoterAddresses.push(msg.sender);

        emit VoterRequested(msg.sender, name);
    }

    // this is an Admin function to approve a candidate
    // It checks if the candidate has a pending request and if they are not already approved.
    // If approved, it updates the candidate's status and emits an event.
    // This function can only be called by the contract owner.
    function approveCandidate(address candidateAddress) public onlyOwner {
        uint candidateId = candidateRequests[candidateAddress];
        require(candidateId > 0, "No pending request");
        require(!candidates[candidateId].approved, "Already approved");

        candidates[candidateId].approved = true;
        isRegisteredCandidate[candidateAddress] = true;

        emit CandidateApproved(
            candidateId,
            candidates[candidateId].name,
            candidates[candidateId].party,
            candidateAddress
        );
    }

    // this is an Admin function to approve a voter
    // It checks if the voter has a pending request and if they are not already approved.
    // If approved, it updates the voter's status and emits an event.
    // This function can only be called by the contract owner.
    function approveVoter(address voterAddress) public onlyOwner {
        require(voterRequests[voterAddress] > 0, "No pending request");
        require(!voters[voterAddress].approved, "Already approved");

        voters[voterAddress].approved = true;
        isRegisteredVoter[voterAddress] = true;

        emit VoterApproved(
            voters[voterAddress].id,
            voters[voterAddress].name,
            voterAddress
        );
    }

    // --- E2E Voting ---

    // Commit a hashed vote: keccak256(abi.encodePacked(candidateId, secret))
    // This function allows a registered and approved voter to commit their vote by providing a hash of their vote.
    // The hash is generated off-chain and sent to the contract.
    function commitVote(bytes32 voteHash) public votingOpen {
        require(isRegisteredVoter[msg.sender], "Not registered");
        require(voters[msg.sender].approved, "Not approved");
        require(voteCommitments[msg.sender] == 0x0, "Already voted");

        voteCommitments[msg.sender] = voteHash;
        voters[msg.sender].hasVoted = true;

        emit VoteCommitted(msg.sender);
    }

    // This function starts the reveal phase of the election.
    // It can only be called after the voting period has ended.
    // Once started, voters can reveal their votes.
    // function startRevealPhase() public votingClosed {
    //     require(!revealPhaseStarted, "Reveal phase already started");

    //     revealPhaseStarted = true;
    //     revealDeadline = block.timestamp + 24 hours;
    // }

    // Reveal vote with original (candidateId, secret)
    // this function allows a registered and approved voter to reveal their vote with the original candidate ID and secret.
    function revealVote(uint candidateId, uint secret) public {
        require(isRegisteredVoter[msg.sender], "Not registered");
        require(voters[msg.sender].approved, "Not approved");
        require(!voters[msg.sender].hasRevealed, "Already revealed");
        require(candidates[candidateId].approved, "Invalid candidate");

        bytes32 computedHash = keccak256(abi.encodePacked(candidateId, secret));
        require(
            voteCommitments[msg.sender] == computedHash,
            "Invalid vote reveal"
        );

        revealedVoteCounts[candidateId]++;
        voters[msg.sender].hasRevealed = true;
        totalVotes++;

        emit VoteRevealed(msg.sender, candidateId);
    }

    // --- Getters for E2E Voting ---

    // this function returns the vote commitment for a specific voter.
    function getVoteCommitment(address voter) public view returns (bytes32) {
        return voteCommitments[voter];
    }

    // this function returns the number of votes revealed for a specific candidate.
    function getRevealedVotes(uint candidateId) public view returns (uint) {
        return revealedVoteCounts[candidateId];
    }

    // --- Results ---

    // this function allows the owner to end the election.
    // It sets the election as inactive and emits an event with the winner's name and vote count.
    function endElection() public onlyOwner {
        election.active = false;

        (string memory winnerName, uint winnerVotes, ) = getResults();
        emit ElectionEnded(winnerName, winnerVotes);
    }

    // this function returns the results of the election, including the winner's name, vote count, and all candidates.
    // It can only be called after the voting has closed.
    function getResults()
        public
        view
        votingClosed
        returns (
            string memory winnerName,
            uint maxVotes,
            Candidate[] memory allCandidates
        )
    {
        Candidate[] memory candidateList = getCandidates();

        string memory topName = "";
        uint highestVotes = 0;

        for (uint i = 0; i < candidateList.length; i++) {
            uint id = candidateList[i].id;
            uint count = revealedVoteCounts[id];
            if (count > highestVotes) {
                highestVotes = count;
                topName = candidateList[i].name;
            }
        }

        return (topName, highestVotes, candidateList);
    }

    // --- View Helpers  ---

    // this function returns the list of approved candidates.
    function getCandidates() public view returns (Candidate[] memory) {
        uint count = 0;
        for (uint i = 1; i <= candidateCount; i++) {
            if (candidates[i].approved) count++;
        }

        Candidate[] memory result = new Candidate[](count);
        uint index = 0;
        for (uint i = 1; i <= candidateCount; i++) {
            if (candidates[i].approved) result[index++] = candidates[i];
        }

        return result;
    }

    // this function returns the list of approved voters.
    function getVoters() public view returns (Voter[] memory) {
        uint count = 0;
        for (uint i = 0; i < pendingVoterAddresses.length; i++) {
            address addr = pendingVoterAddresses[i];
            if (voters[addr].approved) count++;
        }

        Voter[] memory result = new Voter[](count);
        uint index = 0;
        for (uint i = 0; i < pendingVoterAddresses.length; i++) {
            address addr = pendingVoterAddresses[i];
            if (voters[addr].approved) result[index++] = voters[addr];
        }

        return result;
    }

    // this function returns the election information.
    function getElectionInfo() public view returns (Election memory) {
        return election;
    }

    function getTotalVotes() public view returns (uint) {
        uint256 totalVoteCount = 0;
        for (uint i = 1; i <= candidateCount; i++) {
            totalVoteCount += revealedVoteCounts[i];
        }
        return totalVoteCount;
    }

    // this function returns the status of a voter.
    function getVoterStatus(
        address voterAddress
    ) public view returns (bool registered, bool approved, bool hasRevealed) {
        return (
            voterRequests[voterAddress] > 0,
            voters[voterAddress].approved,
            voters[voterAddress].hasRevealed
        );
    }

    // this function returns the status of a candidate.
    function getCandidateStatus(
        address candidateAddress
    ) public view returns (bool registered, bool approved) {
        return (
            candidateRequests[candidateAddress] > 0,
            candidates[candidateRequests[candidateAddress]].approved
        );
    }

    // this function returns the list of pending candidates.
    // It checks if the candidate is not approved and returns their details.
    // It can only be called by the contract owner.
    function getPendingCandidates()
        public
        view
        onlyOwner
        returns (Candidate[] memory)
    {
        uint count = 0;
        for (uint i = 0; i < pendingCandidateAddresses.length; i++) {
            address addr = pendingCandidateAddresses[i];
            uint id = candidateRequests[addr];
            if (!candidates[id].approved) count++;
        }

        Candidate[] memory result = new Candidate[](count);
        uint index = 0;
        for (uint i = 0; i < pendingCandidateAddresses.length; i++) {
            address addr = pendingCandidateAddresses[i];
            uint id = candidateRequests[addr];
            if (!candidates[id].approved) result[index++] = candidates[id];
        }

        return result;
    }

    // this function returns the list of pending voters.
    // It checks if the voter is not approved and returns their details.
    // It can only be called by the contract owner.
    function getPendingVoters() public view onlyOwner returns (Voter[] memory) {
        uint count = 0;
        for (uint i = 0; i < pendingVoterAddresses.length; i++) {
            address addr = pendingVoterAddresses[i];
            if (!voters[addr].approved) count++;
        }

        Voter[] memory result = new Voter[](count);
        uint index = 0;
        for (uint i = 0; i < pendingVoterAddresses.length; i++) {
            address addr = pendingVoterAddresses[i];
            if (!voters[addr].approved) result[index++] = voters[addr];
        }

        return result;
    }

    // this function returns the list of pending Voter addresses.
    function getPendingVoterAddresses() public view returns (address[] memory) {
        return pendingVoterAddresses;
    }
}
