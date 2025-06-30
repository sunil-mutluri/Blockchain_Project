// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HeartRateStorage {

    struct HeartRate {
        uint256 rate;
        uint256 timestamp;
    }

    mapping(address => HeartRate[]) private heartRates;
    mapping(address => mapping(address => bool)) public permissions;

    event HeartRateAdded(address indexed user, uint256 rate, uint256 timestamp);
    event AccessGranted(address indexed user, address indexed grantedTo);
    event AccessRevoked(address indexed user, address indexed revokedFrom);

    // Add a new heart rate for the user
    function addHeartRate(uint256 _rate) public {
        heartRates[msg.sender].push(HeartRate(_rate, block.timestamp));
        emit HeartRateAdded(msg.sender, _rate, block.timestamp);
    }

    // Grant access to another address to view user's heart rate data
    function grantAccess(address _person) public {
        permissions[msg.sender][_person] = true;
        emit AccessGranted(msg.sender, _person);
    }

    // Revoke access for another address
    function revokeAccess(address _person) public {
        permissions[msg.sender][_person] = false;
        emit AccessRevoked(msg.sender, _person);
    }

    // View heart rate data of a user (if access is granted)
    function viewHeartRate(address _user) public view returns (HeartRate[] memory) {
        require(permissions[_user][msg.sender] || _user == msg.sender, "Access Denied");
        return heartRates[_user];
    }

    // Get the total number of heart rate entries for a user
    function getHeartRateCount(address _user) public view returns (uint256) {
        return heartRates[_user].length;
    }
}
