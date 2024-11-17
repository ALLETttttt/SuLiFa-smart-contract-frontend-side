// Contract configuration
const contractAddress = "0xEf8D438E6962fE9c65d837Cdd925dc5C2dD51cc7";
const contractABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "result",
				"type": "string"
			}
		],
		"name": "GamePlayed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "_choice",
				"type": "uint8"
			}
		],
		"name": "play",
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
		"name": "gameHistory",
		"outputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "enum RockPaperScissors.Choice",
				"name": "playerChoice",
				"type": "uint8"
			},
			{
				"internalType": "enum RockPaperScissors.Choice",
				"name": "computerChoice",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "result",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getGameHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "player",
						"type": "address"
					},
					{
						"internalType": "enum RockPaperScissors.Choice",
						"name": "playerChoice",
						"type": "uint8"
					},
					{
						"internalType": "enum RockPaperScissors.Choice",
						"name": "computerChoice",
						"type": "uint8"
					},
					{
						"internalType": "string",
						"name": "result",
						"type": "string"
					}
				],
				"internalType": "struct RockPaperScissors.Game[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let contract;
let signer;

// Initialize Web3 and contract
async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            // Listen for events
            contract.on("GamePlayed", (player, result) => {
                updateHistory();
            });
            
            // Initial history load
            updateHistory();
        } catch (error) {
            console.error("Error initializing Web3:", error);
            document.getElementById('result-text').textContent = "Error connecting to wallet. Please try again.";
        }
    } else {
        document.getElementById('result-text').textContent = "Please install MetaMask to play!";
    }
}

// Play game function
async function playGame(choice) {
    if (!contract) {
        await initWeb3();
    }
    
    const resultText = document.getElementById('result-text');
    resultText.textContent = "Processing move...";
    
    try {
        const tx = await contract.play(choice);
        await tx.wait();
        
        // Result will be updated via event listener
        resultText.textContent = "Move registered! See result below.";
		updateHistory();
    } catch (error) {
        console.error("Error playing game:", error);
        resultText.textContent = "Error processing move. Please try again.";
    }
}

// Update history function
async function updateHistory() {
    if (!contract) return;
    
    try {
        const history = await contract.getGameHistory();
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        // Get last 10 games in reverse order
        const recentGames = history.slice(-10).reverse();
        
        const choices = ["Rock", "Paper", "Scissors"];
        
        recentGames.forEach(game => {
            const li = document.createElement('li');
            li.textContent = `You played ${choices[game.playerChoice]} vs Computer's ${choices[game.computerChoice]} - ${game.result}`;
            historyList.appendChild(li);
        });
    } catch (error) {
        console.error("Error updating history:", error);
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    initWeb3();
});