// src/contractConfig.js
import HeartRateStorage from './abis/HeartRateStorage.json';
import HeartRateAlert from './abis/HeartRateAlert.json';
import HeartRateToken from './abis/HeartRateToken.json';

export const heartRateStorageAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your deployed address
export const heartRateAlertAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // Replace with your deployed address
export const heartRateTokenAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'; // Replace with your deployed address

export const HeartRateStorageABI = HeartRateStorage.abi;
export const HeartRateAlertABI = HeartRateAlert.abi;
export const HeartRateTokenABI = HeartRateToken.abi;
