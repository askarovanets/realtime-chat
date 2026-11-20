const socket = io();

const statusText = document.getElementById('status');
const countText = document.getElementById('count');
const login = document.getElementById('login');
const chatArea = document.getElementById('chatArea');
const usernameInput = document.getElementById('username');
const joinButton = document.getElementById('join');
const messages = document.getElementById('messages');
const form = document.getElementById('messageForm');
const messageInput = document.getElementById('message');
const messageCountText = document.getElementById('messageCount');
const typingStatus = document.getElementById('typingStatus');

let joinedName = '';

// Track received chat messages.
let messageCount = 0;

function addMessage(text, isNotice = false) {
  const item = document.createElement('li');
  item.textContent = text;
  if (isNotice) item.classList.add('notice');
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

joinButton.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (!name) { alert('Please enter a name.'); return; }
  joinedName = name;
  socket.emit('join', name);
  login.hidden = true;
  chatArea.hidden = false;
  messageInput.focus();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('chat message', text);
  messageInput.value = '';
  messageInput.focus();
});

messageInput.addEventListener('input', () => {
  if (messageInput.value.trim()) {
    socket.emit('typing');
  }
});

socket.on('connect', () => {
  statusText.textContent = 'Connected';
  if (joinedName) socket.emit('join', joinedName);
});

socket.on('disconnect', () => {
  statusText.textContent = 'Disconnected. Reconnecting...';
});

socket.on('chat message', (data) => {
  addMessage(`${data.name} (${data.time}): ${data.text}`);

  messageCount = messageCount + 1;
  messageCountText.textContent = messageCount;
});

socket.on('notice', (text) => {
  addMessage(text, true);
});

socket.on('online count', (count) => {
  countText.textContent = count;
});

socket.on('typing', (name) => {
  typingStatus.textContent = `${name} is typing...`;
});