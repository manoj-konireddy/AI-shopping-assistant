const chatbox = document.getElementById("chatbox");
const input = document.getElementById("userInput");

const API_URL = "http://localhost:8000/chat";

// ✅ Markdown-compatible message display
function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;

  if (sender === "bot") {
    msg.innerHTML = marked.parse(text); // Use markdown parser
  } else {
    msg.textContent = text; // plain text for user input
  }

  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  const typingMessage = document.createElement("div");
  typingMessage.className = "message bot";
  typingMessage.textContent = "🤖 Typing...";
  chatbox.appendChild(typingMessage);
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    typingMessage.remove(); // remove "Typing..." message
    addMessage(data.reply, "bot");
  } catch (error) {
    typingMessage.textContent = "❌ Failed to get a response from AI.";
    console.error(error);
  }
}

function startVoice() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice input not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    sendMessage();
  };
  recognition.onerror = (err) => {
    alert("Voice input error: " + err.error);
  };
  recognition.start();
}

// Enable Enter key to send message
input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});
