// Create a peer connection
const peer = new Peer();

// DOM elements
const yourIdInput = document.getElementById('your-id');
const peerIdInput = document.getElementById('peer-id');
const connectBtn = document.getElementById('connect-btn');
const connectionStatus = document.getElementById('connection-status');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const copyBtn = document.getElementById('copy-id');
const themeToggle = document.querySelector('.theme-toggle');
const welcomeMessage = document.querySelector('.welcome-message');

let conn = null;
let myId = '';

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.setAttribute('data-theme', 
        document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    
    themeToggle.innerHTML = document.body.getAttribute('data-theme') === 'dark' ? 
        '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Copy ID button
copyBtn.addEventListener('click', () => {
    yourIdInput.select();
    document.execCommand('copy');
    
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
});

// When peer is open (ready)
peer.on('open', (id) => {
    myId = id;
    yourIdInput.value = id;
    updateConnectionStatus('Ready to connect', 'warning');
});

// Handle connection button
connectBtn.addEventListener('click', () => {
    const peerId = peerIdInput.value.trim();
    if (!peerId) return;
    
    updateConnectionStatus('Connecting...', 'connecting');
    conn = peer.connect(peerId);
    
    setupConnection();
});

// Set up connection handlers
function setupConnection() {
    conn.on('open', () => {
        updateConnectionStatus('Connected', 'connected');
        welcomeMessage.style.display = 'none';
    });
    
    conn.on('data', (data) => {
        displayMessage(data, 'received');
    });
    
    conn.on('close', () => {
        updateConnectionStatus('Disconnected', 'error');
    });
    
    conn.on('error', (err) => {
        updateConnectionStatus('Connection failed', 'error');
        console.error('Connection error:', err);
    });
}

// Handle incoming connections
peer.on('connection', (connection) => {
    conn = connection;
    updateConnectionStatus('Connected by peer!', 'connected');
    welcomeMessage.style.display = 'none';
    setupConnection();
});

// Update connection status UI
function updateConnectionStatus(text, status) {
    const statusDot = connectionStatus.querySelector('.status-dot');
    connectionStatus.querySelector('span').textContent = text;
    
    // Remove all status classes
    connectionStatus.classList.remove('connected', 'connecting', 'error');
    statusDot.style.backgroundColor = '#d63031'; // Default to error color
    
    if (status === 'connected') {
        connectionStatus.classList.add('connected');
        statusDot.style.backgroundColor = '#00b894';
    } else if (status === 'connecting') {
        connectionStatus.classList.add('connecting');
        statusDot.style.backgroundColor = '#fdcb6e';
    } else if (status === 'error') {
        connectionStatus.classList.add('error');
        statusDot.style.backgroundColor = '#d63031';
    } else if (status === 'warning') {
        statusDot.style.backgroundColor = '#fdcb6e';
    }
}

// Send message function
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !conn) return;
    
    const message = {
        text: text,
        sender: myId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    conn.send(message);
    displayMessage(message, 'sent');
    messageInput.value = '';
}

// Display message in chat
function displayMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    
    messageElement.innerHTML = `
        <div class="sender">${type === 'sent' ? 'You' : 'Friend'}</div>
        <div class="text">${message.text}</div>
        <div class="time">${message.timestamp}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Peer error handling
peer.on('error', (err) => {
    console.error('PeerJS error:', err);
    updateConnectionStatus('Connection error', 'error');
});