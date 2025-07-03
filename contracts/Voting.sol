// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    // Data for the candidates
    struct Candidate {
        uint id;
        string name;
        string party;
        address wallet;
        uint voteCount;
        bool approved;
    }
x`
    // Data for the voters
    struct Voter {
        uint id;
        string name;
        address wallet;
        bool hasVoted;
        bool approved;
    }

    // Data for the election
    struct Election {
        string name;
        string description;
        uint startTime;
        uint endTime;
        bool active;
    }

    address public owner;       // address of the contract owner
    Election public election;   // election details

    uint public candidateCount;   // total number of candidates
    uint public voterCount;       // total number of voters
    uint public totalVotes;       // total votes cast

    mapping(uint => Candidate) public candidates;           // mapping of candidate ID to Candidate struct(candidate details)
    mapping(address => Voter) public voters;                // mapping of voter address to Voter struct(voter details)
    mapping(address => bool) public isRegisteredVoter;      // mapping to check if an address is a registered voter
    mapping(address => bool) public isRegisteredCandidate;  // mapping to check if an address is a registered candidate
    mapping(address => uint) public candidateRequests;      // mapping to track candidate registration requests
    mapping(address => uint) public voterRequests;          // mapping to track voter registration requests

    address[] public pendingCandidateAddresses;             // list of addresses with pending candidate requests
    address[] public pendingVoterAddresses;                 // list of addresses with pending voter requests

    event CandidateRequested(address indexed user, string name, string party);          // event for candidate registration request
    event VoterRequested(address indexed user, string name);                            // event for voter registration request 
    event CandidateApproved(uint id, string name, string party, address wallet);        // event for candidate approval
    event VoterApproved(uint id, string name, address wallet);                          // event for voter approval
    event Voted(address indexed voter, uint candidateId);                               // event for voting action
    event ElectionEnded(string winnerName, uint winnerVotes);                           // event for election end with winner details

    // Modifier to restrict access to only owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // Modifier to check if voting is open
    modifier votingOpen() {
        require(block.timestamp >= election.startTime && block.timestamp <= election.endTime, "Voting not active");
        require(election.active, "Election not active");
        _;
    }

    // Modifier to check if voting is closed
    modifier votingClosed() {
        require(block.timestamp > election.endTime || !election.active, "Voting still active");
        _;
    }

    // Constructor to initialize the election and to set the contract owner
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

    // requests candidate registration
    // requires the user to not be registered as a candidate or voter and to not have a pending request
    // increments the candidate count and creates a new candidate request
    // adds the candidate to the pending list and emits an event for the registration request
    function requestCandidateRegistration(string memory name, string memory party) public {
        require(!isRegisteredCandidate[msg.sender], "Already registered as candidate");
        require(!isRegisteredVoter[msg.sender], "Already registered as voter");
        require(candidateRequests[msg.sender] == 0, "Request already pending");

        candidateCount++;
        candidateRequests[msg.sender] = candidateCount;
        candidates[candidateCount] = Candidate(candidateCount, name, party, msg.sender, 0, false);
        pendingCandidateAddresses.push(msg.sender);

        emit CandidateRequested(msg.sender, name, party);           // An event emission used to log information on the Ethereum blockchain
    }

    // requests voter registration
    // requires the user to not be registered as a voter or candidate and to not have a pending request
    // increments the voter count and creates a new voter request
    // adds the voter to the pending list and emits an event for the registration request
    function requestVoterRegistration(string memory name) public {
        require(!isRegisteredVoter[msg.sender], "Already registered as voter");
        require(!isRegisteredCandidate[msg.sender], "Already registered as candidate");
        require(voterRequests[msg.sender] == 0, "Request already pending");

        voterCount++;
        voterRequests[msg.sender] = voterCount;
        voters[msg.sender] = Voter(voterCount, name, msg.sender, false, false);
        pendingVoterAddresses.push(msg.sender);

        emit VoterRequested(msg.sender, name);
    }

    // Approves a candidate based on their address
    // requires the caller to be the owner of the contract
    // checks if the candidate has a pending request and if they are not already approved
    // sets the candidate as approved and updates the mapping for registered candidates
    function approveCandidate(address candidateAddress) public onlyOwner {
        uint candidateId = candidateRequests[candidateAddress];
        require(candidateId > 0, "No pending request");
        require(!candidates[candidateId].approved, "Already approved");

        candidates[candidateId].approved = true;
        isRegisteredCandidate[candidateAddress] = true;

        emit CandidateApproved(candidateId, candidates[candidateId].name, candidates[candidateId].party, candidateAddress);
    }

    // Approves a voter based on their address
    // requires the caller to be the owner of the contract
    // checks if the voter has a pending request and if they are not already approved
    // sets the voter as approved and updates the mapping for registered voters
    function approveVoter(address voterAddress) public onlyOwner {
        require(voterRequests[voterAddress] > 0, "No pending request");
        require(!voters[voterAddress].approved, "Already approved");

        voters[voterAddress].approved = true;
        isRegisteredVoter[voterAddress] = true;

        emit VoterApproved(voters[voterAddress].id, voters[voterAddress].name, voterAddress);
    }

    // Allows a registered and approved voter to cast their vote for a candidate
    // requires the voter to be registered, approved, and not have voted already
    // checks if the candidate ID is valid and if the candidate is approved
    // updates the voter's status and increments the candidate's vote count
    function vote(uint candidateId) public votingOpen {
        require(isRegisteredVoter[msg.sender], "Not a registered voter");
        require(voters[msg.sender].approved, "Voter not approved");
        require(!voters[msg.sender].hasVoted, "Already voted");
        require(candidateId > 0 && candidateId <= candidateCount, "Invalid candidate");
        require(candidates[candidateId].approved, "Candidate not approved");

        voters[msg.sender].hasVoted = true;
        candidates[candidateId].voteCount += 1;
        totalVotes++;

        emit Voted(msg.sender, candidateId);
    }

    // Returns the list of approved candidates
    // iterates through the candidates and counts the approved ones
    // creates a dynamic array to hold the approved candidates and returns it
    function getCandidates() public view returns (Candidate[] memory) {
        uint count = 0;
        for (uint i = 1; i <= candidateCount; i++) {
            if (candidates[i].approved) {
                count++;
            }
        }

        Candidate[] memory result = new Candidate[](count);
        uint index = 0;
        for (uint i = 1; i <= candidateCount; i++) {
            if (candidates[i].approved) {
                result[index++] = candidates[i];
            }
        }
        return result;
    }

    function getVoters() public view returns (Voter[] memory) {
        uint count = 0;
        for (uint i = 0; i < pendingVoterAddresses.length; i++) {
            address addr = pendingVoterAddresses[i];
            if (voters[addr].approved) {
                count++;
            }
        }

        Voter[] memory result = new Voter[](count);
        uint index = 0;
        for (uint i = 0; i < pendingVoterAddresses.length; i++) {
            address addr = pendingVoterAddresses[i];
            if (voters[addr].approved) {
                result[index++] = voters[addr];
            }
        }

        return result;
        
    }

    
    function getPendingCandidates() public view onlyOwner returns (Candidate[] memory) {
        uint count = 0;
        for (uint i = 0; i < pendingCandidateAddresses.length; i++) {
            address addr = pendingCandidateAddresses[i];
            uint id = candidateRequests[addr];
            if (!candidates[id].approved) {
                count++;
            }
        }

        Candidate[] memory result = new Candidate[](count);
        uint index = 0;
        for (uint i = 0; i < pendingCandidateAddresses.length; i++) {
            address addr = pendingCandidateAddresses[i];
            uint id = candidateRequests[addr];
            if (!candidates[id].approved) {
                result[index++] = candidates[id];
            }
        }

        return result;
    }

    // Returns the list of pending voters
    // iterates through the pending voter addresses and counts the unapproved ones
    // creates a dynamic array to hold the pending voters and returns it
    function getPendingVoters() public view onlyOwner returns (Voter[] memory) {
        uint count = 0;
        for (uint i = 0; i < pendingVoterAddresses.length; i++) {
            address addr = pendingVoterAddresses[i];
            if (!voters[addr].approved) {
                count++;
            }
        }

        Voter[] memory result = new Voter[](count);
        uint index = 0;
        for (uint i = 0; i < pendingVoterAddresses.length; i++) {
            address addr = pendingVoterAddresses[i];
            if (!voters[addr].approved) {
                result[index++] = voters[addr];
            }
        }

        return result;
    }


    // Returns the results of the election
    // checks if the voting is closed
    // iterates through the candidates to find the one with the highest vote count
    // returns the winner's name, vote count, and a list of all candidates
    // if no candidates have votes, returns an empty string and zero
    function getResults() public view votingClosed returns (string memory winnerName, uint maxVotes, Candidate[] memory allCandidates) {
        Candidate[] memory candidateList = getCandidates();

        string memory topName = "";
        uint highestVotes = 0;

        for (uint i = 0; i < candidateList.length; i++) {
            if (candidateList[i].voteCount > highestVotes) {
                highestVotes = candidateList[i].voteCount;
                topName = candidateList[i].name;
            }
        }

        return (topName, highestVotes, candidateList);
    }


    // Returns the election information
    // includes the name, description, start time, end time, and active status
    // this function is public and view, meaning it can be called externally and does not modify the state
    // returns the Election struct containing all relevant details
    function getElectionInfo() public view returns (Election memory) {
        return election;
    }


    // Ends the election
    // requires the caller to be the owner of the contract
    // sets the election as inactive
    // retrieves the results of the election and emits an event with the winner's details
    // this function can only be called after the election has ended or if it is already inactive
    function endElection() public onlyOwner {
        election.active = false;

        (string memory winnerName, uint winnerVotes,) = getResults();
        emit ElectionEnded(winnerName, winnerVotes);
    }


    // Returns the status of a voter and a candidate based on their address
    // checks if the voter is registered, approved, and if they have voted
    // checks if the candidate is registered and approved
    // returns a tuple with the voter's registration status, approval status, and voting status
    function getVoterStatus(address voterAddress) public view returns (bool registered, bool approved, bool hasVoted) {
        return (
            voterRequests[voterAddress] > 0,
            voters[voterAddress].approved,
            voters[voterAddress].hasVoted
        );
    }


    // Returns the status of a candidate based on their address
    // checks if the candidate has a pending request and if they are approved
    // returns a tuple with the candidate's registration status and approval status
    function getCandidateStatus(address candidateAddress) public view returns (bool registered, bool approved) {
        return (
            candidateRequests[candidateAddress] > 0,
            candidates[candidateRequests[candidateAddress]].approved
        );
    }

    // Returns the list of pending candidate addresses
    // this function is public and view, meaning it can be called externally and does not modify the state
    // returns an array of addresses that have pending candidate requests
    function getPendingVoterAddresses() public view returns (address[] memory) {
    return pendingVoterAddresses;
    }

}
