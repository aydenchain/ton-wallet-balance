const API_BASE = 'https://tonapi.io/v2';
let API_KEY = '';

async function checkWallet() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const address = document.getElementById('walletAddress').value.trim();
    const button = document.getElementById('checkButton');
    const result = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');

    if (!apiKey) {
        alert('Please enter your TON API KEY!');
        return;
    }
    if (!address) {
        alert('Please enter a wallet address!');
        return;
    }

    API_KEY = apiKey;

    setLoadingState(button, result, resultContent);

    try {
        const accountData = await fetchAccountData(address);
        const transactionsData = await fetchTransactions(address);
        displayResults(accountData, transactionsData.transactions);
    } catch (error) {
        console.error('Error:', error);
        displayError(result, resultContent, error.message || 'Unknown error');
    } finally {
        resetButtonState(button);
    }
}

async function fetchAccountData(address) {
    const headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    };

    const response = await fetch(`${API_BASE}/accounts/${address}`, { headers });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
}

async function fetchTransactions(address) {
    const headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    };

    const response = await fetch(`${API_BASE}/accounts/${address}/transactions?limit=5`, { headers });
    if (!response.ok) {
        console.warn('Could not fetch transactions');
        return { transactions: [] };
    }

    return await response.json();
}

function setLoadingState(button, result, resultContent) {
    button.disabled = true;
    button.textContent = 'Checking...';
    result.classList.add('show');
    result.classList.remove('error');
    resultContent.innerHTML = '<div class="loading">Fetching wallet data from TON API...</div>';
}

function resetButtonState(button) {
    button.disabled = false;
    button.textContent = 'Check Wallet Balance';
}

function displayError(result, resultContent, message) {
    result.classList.add('error');
    resultContent.innerHTML = `
        <div class="error">
            <h3>Error</h3>
            <p>Failed to fetch wallet data: ${message}</p>
            <p>Please check your API Key and address format.</p>
        </div>
    `;
}

function displayResults(accountData, transactions) {
    const resultContent = document.getElementById('resultContent');
    const balance = convertNanoTonToTon(accountData.balance);
    const status = accountData.status;

    let html = `
        <div class="balance">${balance} TON</div>
        <div class="address">${accountData.address}</div>

        <div class="info-item">
            <span class="info-label">Status:</span>
            <span class="info-value">${status}</span>
        </div>

        <div class="info-item">
            <span class="info-label">Last Activity:</span>
            <span class="info-value">${formatDate(accountData.last_activity)}</span>
        </div>

        <div class="info-item">
            <span class="info-label">Interfaces:</span>
            <span class="info-value">${accountData.interfaces ? accountData.interfaces.join(', ') : 'Standard wallet'}</span>
        </div>
    `;

    if (transactions && transactions.length > 0) {
        html += generateTransactionsHtml(transactions);
    }

    resultContent.innerHTML = html;
}

function generateTransactionsHtml(transactions) {
    let html = `
        <div class="transactions">
            <h3>Recent Transactions</h3>
    `;

    transactions.slice(0, 3).forEach(tx => {
        const date = formatDate(tx.utime);
        const hash = tx.hash.substring(0, 8) + '...';
        const amount = tx.in_msg?.value ? convertNanoTonToTon(tx.in_msg.value) + ' TON' : 'Internal';

        html += `
            <div class="transaction">
                <div class="tx-hash">Hash: ${hash}</div>
                <div class="tx-amount">Amount: ${amount}</div>
                <div style="font-size: 0.8em; color: #666;">${date}</div>
            </div>       
        `;
    });
    html += '</div>';
    return html;
}

function convertNanoTonToTon(nanotons) {
    return (nanotons / 1000000000).toFixed(2);
}

function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
}

function fillAddress(address) {
    document.getElementById('walletAddress').value = address;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('TON API Wallet Checker loaded');
    console.log('Enter your TON API key and wallet address to check balance');
    
    document.getElementById('walletAddress').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkWallet();
        }
    });
    
    document.getElementById('apiKey').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkWallet();
        }
    });
});

//Variable typo: apikey → apiKey
//DOM selector errors: .value.trim() dipanggil pada button/result elements (harusnya tanpa .value)
//Template literal syntax: $(variable) → ${variable}
//Function name typo: fetchAcccountData → fetchAccountData
//URL parameter typo: limt=5 → limit=5
//Missing quote: class="loading> → class="loading"
//HTML typo: <./p> → </p>
//CSS class typo: cconvertNanoTonToTon → convertNanoTonToTon
//Display function call: Parameter order salah di displayResults
//HTML typo: <dic class="transactions"> → <div class="transactions">
//CSS property typo: color #666 → color: #666