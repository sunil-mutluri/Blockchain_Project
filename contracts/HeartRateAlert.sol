// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./HeartRateStorage.sol";

contract HeartRateAlert is HeartRateStorage {

    mapping(address => uint256) private upperThreshold;
    mapping(address => uint256) private lowerThreshold;

    event AlertTriggered(address indexed user, uint256 rate, string alertType);
    event Suggestion(address indexed user, uint256 rate, string suggestion);

    // Set upper and lower thresholds for heart rate
    function setThresholds(uint256 _upper, uint256 _lower) public {
        require(_lower < _upper, "Lower threshold must be less than upper threshold");
        upperThreshold[msg.sender] = _upper;
        lowerThreshold[msg.sender] = _lower;
    }

    // Add heart rate data and trigger alerts or suggestions
    function addHeartRateWithAlert(uint256 _rate, bool isManual) public {
        addHeartRate(_rate);

        if (!isManual) {
            // Check for threshold breaches and trigger emergency alerts
            if (_rate > upperThreshold[msg.sender]) {
                emit AlertTriggered(msg.sender, _rate, "Heart rate too high");
            } else if (_rate < lowerThreshold[msg.sender]) {
                emit AlertTriggered(msg.sender, _rate, "Heart rate too low");
            }
        } else {
            // For manual input, suggest actions instead of alerts
            if (_rate > upperThreshold[msg.sender]) {
                emit Suggestion(msg.sender, _rate, "Consider consulting a doctor.");
            } else if (_rate < lowerThreshold[msg.sender]) {
                emit Suggestion(msg.sender, _rate, "Monitor for dizziness or contact a doctor.");
            }
        }
    }

    // Get user's thresholds
    function getThresholds(address _user) public view returns (uint256 upper, uint256 lower) {
        return (upperThreshold[_user], lowerThreshold[_user]);
    }
}
