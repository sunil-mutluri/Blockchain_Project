// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HeartRateToken is ERC20, Ownable {

    // Mapping to track users' reward status
    mapping(address => bool) public hasClaimedReward;

    // Token distribution threshold (users maintaining a healthy heart rate get rewarded)
    uint256 public rewardRate = 10 * 10 ** 18; // 10 tokens

    constructor() ERC20("HeartRateToken", "HRT") Ownable(msg.sender) {
        // Mint 1,000,000 tokens to the contract owner
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    // Reward users for maintaining healthy heart rate
    function rewardUser(address user) external onlyOwner {
        require(!hasClaimedReward[user], "User has already claimed the reward");
        _transfer(owner(), user, rewardRate); // Transfer 10 tokens to the user
        hasClaimedReward[user] = true; // Mark as rewarded
    }

    // Check if the user has already been rewarded
    function hasUserClaimed(address user) external view returns (bool) {
        return hasClaimedReward[user];
    }

    // Optional: Function to mint more tokens if needed
    function mintTokens(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
