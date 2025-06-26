const chatbox = document.getElementById("chatbox");
const input = document.getElementById("userInput");
const API_URL = "http://localhost:8000/chat";

// Message renderer
function addMessage(text, sender, container = chatbox) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerHTML = sender === "bot" ? marked.parse(text) : text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
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

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    typingMessage.remove();
    addMessage(data.reply, "bot");
  } catch (error) {
    typingMessage.textContent = "❌ Failed to get response.";
  }
}

function startVoice() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice input not supported.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    sendMessage();
  };
  recognition.start();
}

// 🟦 New: Tabs switcher
function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.style.display = "none");
  document.getElementById(tabId).style.display = "block";
}

// 🟩 New: Image Analyzer
async function analyzeImage() {
  const imageInput = document.getElementById("imageInput").files[0];
  const question = document.getElementById("imageQuestion").value;
  const resultDiv = document.getElementById("imageResult");
  resultDiv.innerHTML = "🔍 Analyzing...";

  const formData = new FormData();
  formData.append("image", imageInput);
  formData.append("question", question);

  const res = await fetch("http://localhost:8000/image-analyze", {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  resultDiv.innerHTML = marked.parse(data.reply);
}

// 🟧 New: Nutrition Tracker
async function trackNutrition() {
  const food = document.getElementById("foodItem").value;
  const qty = document.getElementById("quantity").value;
  const meal = document.getElementById("mealType").value;
  const result = document.getElementById("nutritionResult");
  result.innerHTML = "📊 Calculating...";
  const response = await fetch("http://localhost:8000/nutrition", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ food, qty, meal })
  });
  const data = await response.json();
  result.innerHTML = marked.parse(data.reply);
}

// 🟨 New: Smart Shopping List
async function createShoppingList() {
  const items = document.getElementById("shoppingItems").value;
  const cat = document.getElementById("shoppingCategory").value;
  const result = document.getElementById("shoppingResult");
  result.innerHTML = "🛒 Generating list...";
  const response = await fetch("http://localhost:8000/shopping-list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, cat })
  });
  const data = await response.json();
  result.innerHTML = marked.parse(data.reply);
}

async function generateMealPlan() {
  const body = {
    duration: parseInt(document.getElementById("duration").value),
    people: parseInt(document.getElementById("people").value),
    diet: document.getElementById("diet").value,
    cuisines: document.getElementById("cuisines").value,
    notes: document.getElementById("notes").value,
  };
  document.getElementById("mealPlanResult").innerHTML = "⏳ Generating meal plan...";
  const res = await fetch("http://localhost:8000/meal-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  document.getElementById("mealPlanResult").innerHTML = marked.parse(data.reply);
}

async function confirmMealPlan() {
  const res = await fetch("http://localhost:8000/confirm-meal-plan", {
    method: "POST"
  });
  const data = await res.json();
  alert(data.status);
}

async function uploadInventory() {
  const input = document.getElementById("inventoryImages");
  const formData = new FormData();
  for (const file of input.files) {
    formData.append("images", file);
  }
  const res = await fetch("http://localhost:8000/upload-inventory", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  alert(data.status);
}

async function generateSmartList() {
  document.getElementById("shoppingListResult").innerHTML = "⏳ Generating shopping list...";
  const res = await fetch("http://localhost:8000/generate-shopping-list", {
    method: "POST"
  });
  const data = await res.json();
  document.getElementById("shoppingListResult").innerHTML = marked.parse(data.reply);
}

async function generateQR() {
  const res = await fetch("http://localhost:8000/generate-qr");
  const data = await res.json();
  if (data.qr) {
    document.getElementById("qrImage").src = data.qr;
  } else {
    alert(data.error || "❌ Could not generate QR.");
  }
}

// Enable Enter key to send message
input.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

// 🌙 Dark/Light Theme Toggle
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const current = localStorage.getItem("theme") || "light";
  const next = current === "light" ? "dark" : "light";
  setTheme(next);
}

// Apply saved or preferred theme on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (prefersDark ? "dark" : "light");
  setTheme(theme);
});




