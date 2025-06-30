// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { heartRateStorageAddress, heartRateAlertAddress, heartRateTokenAddress, HeartRateStorageABI, HeartRateAlertABI, HeartRateTokenABI } from './contractConfig';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import axios from 'axios';
import './App.css';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [walletBalance, setWalletBalance] = useState('0');
  const [heartRate, setHeartRate] = useState('');
  const [thresholds, setThresholds] = useState({ upper: '', lower: '' });
  const [isManual, setIsManual] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const [healthcareContact, setHealthcareContact] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const providerRef = useRef(null);
  const signerRef = useRef(null);
  const heartRateStorageContractRef = useRef(null);
  const heartRateAlertContractRef = useRef(null);
  const heartRateTokenContractRef = useRef(null);

  const setupContracts = async () => {
    try {
      if (!window.ethereum) {
        console.error('MetaMask is not installed!');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      providerRef.current = provider;
      const signer = await provider.getSigner();
      signerRef.current = signer;

      const heartRateStorageContract = new ethers.Contract(heartRateStorageAddress, HeartRateStorageABI, signer);
      heartRateStorageContractRef.current = heartRateStorageContract;

      const heartRateAlertContract = new ethers.Contract(heartRateAlertAddress, HeartRateAlertABI, signer);
      heartRateAlertContractRef.current = heartRateAlertContract;

      const heartRateTokenContract = new ethers.Contract(heartRateTokenAddress, HeartRateTokenABI, signer);
      heartRateTokenContractRef.current = heartRateTokenContract;

      // Listen for AlertTriggered events
      heartRateAlertContract.on('AlertTriggered', (user, rate, alertType) => {
        if (user.toLowerCase() === currentAccount.toLowerCase()) {
          if (alertType === "Heart rate too high") {
            alert(`⚠️ Warning! Your heart rate is too high: ${rate} bpm`);
          } else if (alertType === "Heart rate too low") {
            alert(`⚠️ Warning! Your heart rate is too low: ${rate} bpm`);
          }
        }
      });

      // Listen for Suggestion events
      heartRateAlertContract.on('Suggestion', (user, rate, suggestion) => {
        if (user.toLowerCase() === currentAccount.toLowerCase()) {
          alert(`💡 Suggestion: ${suggestion}`);
        }
      });

    } catch (error) {
      console.error('Error setting up contracts:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);

      // Fetch token balance for the user
      if (heartRateTokenContractRef.current) {
        const balance = await heartRateTokenContractRef.current.balanceOf(accounts[0]);
        setTokenBalance(parseInt(balance.toString(), 10) / 10 ** 18);

        // Fetch if user has already claimed reward
        const hasClaimed = await heartRateTokenContractRef.current.hasUserClaimed(accounts[0]);
        setRewardClaimed(hasClaimed);
      } else {
        console.error('Token contract not initialized');
      }

      // Fetch wallet balance
      if (providerRef.current) {
        const balance = await providerRef.current.getBalance(accounts[0]);
        const etherString = ethers.formatEther(balance);
        setWalletBalance(etherString);
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const addHeartRate = async () => {
    try {
      if (!heartRate) {
        alert('Please enter a valid heart rate.');
        return;
      }

      if (heartRateAlertContractRef.current) {
        const tx = await heartRateAlertContractRef.current.addHeartRateWithAlert(heartRate, isManual);
        await tx.wait();
        alert('Heart rate added successfully!');
      } else {
        console.error('HeartRateAlert contract not initialized.');
      }

    } catch (error) {
      console.error('Error adding heart rate:', error);
    }
  };

  const setHeartRateThresholds = async () => {
    try {
      if (!thresholds.upper || !thresholds.lower) {
        alert('Please set both upper and lower thresholds.');
        return;
      }

      const upper = parseInt(thresholds.upper);
      const lower = parseInt(thresholds.lower);

      if (lower >= upper) {
        alert('Lower threshold must be less than upper threshold.');
        return;
      }

      if (heartRateAlertContractRef.current) {
        const tx = await heartRateAlertContractRef.current.setThresholds(upper, lower);
        await tx.wait();
        alert('Thresholds set successfully!');
      } else {
        console.error('HeartRateAlert contract not initialized.');
      }
    } catch (error) {
      console.error('Error setting thresholds:', error);
    }
  };

  const fetchHeartRateHistory = async () => {
    try {
      if (heartRateStorageContractRef.current) {
        const history = await heartRateStorageContractRef.current.viewHeartRate(currentAccount);
        setHeartRateHistory(history.map(hr => ({ rate: hr.rate.toString(), timestamp: new Date(hr.timestamp.toNumber() * 1000).toLocaleString() })));
      } else {
        console.error('HeartRateStorage contract not initialized.');
      }
    } catch (error) {
      console.error('Error fetching heart rate history:', error);
    }
  };

  const shareWithHealthcareProvider = () => {
    if (!healthcareContact) {
      alert('Please provide a healthcare provider contact.');
      return;
    }
    // Implement actual data sharing via email/SMS API or similar service
    alert(`Heart rate data shared with ${healthcareContact}`);
  };

  const fetchAPIHeartRate = async () => {
    try {
      const response = await axios.get('https://6717431fb910c6a6e0273223.mockapi.io/api/v1/heartrate/1'); // Replace with your MockAPI URL
      const fetchedHeartRate = response.data.heartRate; // Adjust based on actual API response structure
      setHeartRate(fetchedHeartRate);
      alert(`Heart rate fetched from API: ${fetchedHeartRate} bpm`);

      // Submit the heart rate to the contract
      if (heartRateAlertContractRef.current) {
        const tx = await heartRateAlertContractRef.current.addHeartRateWithAlert(fetchedHeartRate, false);
        await tx.wait();
        alert('Heart rate submitted to contract.');
      } else {
        console.error('HeartRateAlert contract not initialized.');
      }
    } catch (error) {
      console.error('Error fetching heart rate from API:', error);
    }
  };

  const setReminder = (interval) => {
    const reminder = setInterval(() => {
      alert('⏰ Reminder: Please check your heart rate.');
    }, interval);
    setReminders([...reminders, reminder]);
  };

  const claimReward = async () => {
    try {
      if (rewardClaimed) {
        alert('You have already claimed your reward.');
        return;
      }

      // Check if user is eligible
      if (heartRateTokenContractRef.current && heartRateAlertContractRef.current) {
        const [upperThreshold, lowerThreshold] = await heartRateAlertContractRef.current.getThresholds(currentAccount);
        if (heartRate >= lowerThreshold && heartRate <= upperThreshold) {
          const tx = await heartRateTokenContractRef.current.rewardUser(currentAccount);
          await tx.wait();
          setRewardClaimed(true);
          alert('🎉 Tokens rewarded for maintaining a healthy heart rate!');

          // Update token balance
          const balance = await heartRateTokenContractRef.current.balanceOf(currentAccount);
          setTokenBalance(parseInt(balance.toString(), 10) / 10 ** 18);
        } else {
          alert('Your heart rate is not within the healthy range. No rewards to claim.');
        }
      } else {
        console.error('Contracts not initialized.');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  useEffect(() => {
    setupContracts(); // Initialize contracts
  }, []);

  useEffect(() => {
    if (currentAccount) {
      fetchHeartRateHistory(); // Fetch history when connected
    }
  }, [currentAccount]);

  const chartData = {
    labels: heartRateHistory.map(hr => hr.timestamp),
    datasets: [
      {
        label: 'Heart Rate (bpm)',
        data: heartRateHistory.map(hr => hr.rate),
        fill: false,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  return (
    <div className="app-container">
      <h1>EthereumPulse: Heart Rate Monitoring DApp </h1>
      {!currentAccount ? (
        <button className="connect-button" onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p><strong>Connected account:</strong> {currentAccount}</p>
          <p><strong>Wallet Balance:</strong> {walletBalance} ETH</p>
          <p><strong>Token Balance:</strong> {tokenBalance} HRT</p>

          {/* Heart Rate Entry */}
          <div className="section">
            <h3>📊 Enter Heart Rate</h3>
            <input
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              placeholder="Enter heart rate (bpm)"
            />
            <div className="entry-options">
              <label>
                <input
                  type="radio"
                  value={true}
                  checked={isManual === true}
                  onChange={() => setIsManual(true)}
                />
                Manual Entry
              </label>
              <label>
                <input
                  type="radio"
                  value={false}
                  checked={isManual === false}
                  onChange={() => setIsManual(false)}
                />
                API Data Entry
              </label>
            </div>
            <button onClick={addHeartRate}>Submit Heart Rate</button>
            {!isManual && (
              <button onClick={fetchAPIHeartRate}>Fetch from API</button>
            )}
          </div>

          {/* Set Thresholds */}
          <div className="section">
            <h3>⚠️ Set Heart Rate Thresholds</h3>
            <input
              type="number"
              value={thresholds.upper}
              onChange={(e) => setThresholds({ ...thresholds, upper: e.target.value })}
              placeholder="Upper threshold (bpm)"
            />
            <input
              type="number"
              value={thresholds.lower}
              onChange={(e) => setThresholds({ ...thresholds, lower: e.target.value })}
              placeholder="Lower threshold (bpm)"
            />
            <button onClick={setHeartRateThresholds}>Set Thresholds</button>
          </div>

          {/* Heart Rate History */}
          <div className="section">
            <h3>📈 Heart Rate History</h3>
            <button onClick={fetchHeartRateHistory}>Fetch Heart Rate History</button>
            {heartRateHistory.length > 0 && (
              <div className="chart-container">
                <Line data={chartData} />
              </div>
            )}
          </div>

          {/* Data Sharing */}
          <div className="section">
            <h3>📤 Share with Healthcare Provider</h3>
            <input
              type="email"
              value={healthcareContact}
              onChange={(e) => setHealthcareContact(e.target.value)}
              placeholder="Enter healthcare provider's email"
            />
            <button onClick={shareWithHealthcareProvider}>Share Heart Rate Data</button>
          </div>

          {/* Periodic Reminders */}
          <div className="section">
            <h3>⏰ Set Periodic Reminders</h3>
            <button onClick={() => setReminder(10000)}>Set Reminder (10 sec)</button>
            <button onClick={() => setReminder(60000)}>Set Reminder (1 min)</button>
          </div>

          {/* Claim Token Reward */}
          <div className="section">
            <h3>🎁 Claim Your Reward</h3>
            <button onClick={claimReward} disabled={rewardClaimed}>Claim Reward</button>
            {rewardClaimed && <p>✅ You have already claimed your reward.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
