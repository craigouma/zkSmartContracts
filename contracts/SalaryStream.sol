// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SalaryStream is ReentrancyGuard, Ownable {
    struct Stream {
        uint256 streamId;
        address employee;
        address employer;
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        uint256 withdrawn;
        bool active;
        string zkProofHash; // Hash of the ZK proof for salary range
    }

    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public employeeStreams;
    mapping(address => uint256[]) public employerStreams;
    
    uint256 public nextStreamId = 1;
    uint256 public constant MIN_STREAM_DURATION = 1 days;
    uint256 public constant MAX_STREAM_DURATION = 365 days;
    
    event StreamCreated(
        uint256 indexed streamId,
        address indexed employee,
        address indexed employer,
        uint256 amount,
        uint256 duration,
        string zkProofHash
    );
    
    event Withdrawal(
        uint256 indexed streamId,
        address indexed employee,
        uint256 amount,
        uint256 timestamp
    );
    
    event StreamCancelled(uint256 indexed streamId);

    constructor() Ownable(msg.sender) {}

    function createStream(
        address _employee,
        uint256 _duration,
        string memory _zkProofHash
    ) external payable nonReentrant {
        require(_employee != address(0), "Invalid employee address");
        require(_employee != msg.sender, "Cannot stream to yourself");
        require(msg.value > 0, "Stream amount must be greater than 0");
        require(_duration >= MIN_STREAM_DURATION, "Duration too short");
        require(_duration <= MAX_STREAM_DURATION, "Duration too long");
        require(bytes(_zkProofHash).length > 0, "ZK proof hash required");

        uint256 streamId = nextStreamId++;
        
        streams[streamId] = Stream({
            streamId: streamId,
            employee: _employee,
            employer: msg.sender,
            amount: msg.value,
            startTime: block.timestamp,
            duration: _duration,
            withdrawn: 0,
            active: true,
            zkProofHash: _zkProofHash
        });

        employeeStreams[_employee].push(streamId);
        employerStreams[msg.sender].push(streamId);

        emit StreamCreated(
            streamId,
            _employee,
            msg.sender,
            msg.value,
            _duration,
            _zkProofHash
        );
    }

    function getAvailableAmount(uint256 _streamId) public view returns (uint256) {
        Stream memory stream = streams[_streamId];
        require(stream.active, "Stream not active");

        if (block.timestamp < stream.startTime) {
            return 0;
        }

        uint256 elapsed = block.timestamp - stream.startTime;
        if (elapsed >= stream.duration) {
            return stream.amount - stream.withdrawn;
        }

        uint256 totalAvailable = (stream.amount * elapsed) / stream.duration;
        return totalAvailable - stream.withdrawn;
    }

    function withdraw(uint256 _streamId, uint256 _amount) external nonReentrant {
        Stream storage stream = streams[_streamId];
        require(stream.active, "Stream not active");
        require(msg.sender == stream.employee, "Only employee can withdraw");
        require(_amount > 0, "Amount must be greater than 0");

        uint256 available = getAvailableAmount(_streamId);
        require(_amount <= available, "Insufficient available amount");

        stream.withdrawn += _amount;
        
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Transfer failed");

        emit Withdrawal(_streamId, msg.sender, _amount, block.timestamp);
    }

    function withdrawAll(uint256 _streamId) external nonReentrant {
        Stream storage stream = streams[_streamId];
        require(stream.active, "Stream not active");
        require(msg.sender == stream.employee, "Only employee can withdraw");
        
        uint256 available = getAvailableAmount(_streamId);
        require(available > 0, "No funds available");

        stream.withdrawn += available;
        
        (bool success, ) = payable(msg.sender).call{value: available}("");
        require(success, "Transfer failed");

        emit Withdrawal(_streamId, msg.sender, available, block.timestamp);
    }

    function cancelStream(uint256 _streamId) external nonReentrant {
        Stream storage stream = streams[_streamId];
        require(stream.active, "Stream not active");
        require(msg.sender == stream.employer, "Only employer can cancel");

        stream.active = false;
        
        uint256 available = getAvailableAmount(_streamId);
        uint256 remaining = stream.amount - stream.withdrawn - available;
        
        if (available > 0) {
            (bool successEmployee, ) = payable(stream.employee).call{value: available}("");
            require(successEmployee, "Employee transfer failed");
        }
        
        if (remaining > 0) {
            (bool successEmployer, ) = payable(stream.employer).call{value: remaining}("");
            require(successEmployer, "Employer refund failed");
        }

        emit StreamCancelled(_streamId);
    }

    function getStreamsByEmployee(address _employee) external view returns (uint256[] memory) {
        return employeeStreams[_employee];
    }

    function getStreamsByEmployer(address _employer) external view returns (uint256[] memory) {
        return employerStreams[_employer];
    }

    function getStreamDetails(uint256 _streamId) external view returns (Stream memory) {
        return streams[_streamId];
    }
} 