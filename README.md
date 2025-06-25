# 🛍️ AI Smart Shopping Assistant

An intelligent shopping assistant with both **voice and text input**, built using **FastAPI** and powered by **DeepSeek R1** via OpenRouter.  
It provides natural, ChatGPT-style conversation with clean formatting, and helps users get product suggestions, comparisons, and shopping tips.

---

## ✨ Features

- 🧠 Smart replies using `deepseek/deepseek-r1-0528:free`
- 💬 Text input with Enter key support
- 🎤 Voice input using browser mic (Chrome only)
- 📄 ChatGPT-style markdown output (headings, lists, code blocks)
- ⚙️ Backend: FastAPI | Frontend: HTML + CSS + JS
- 🌐 Fully separated frontend and backend for flexibility

---

## 📁 Project Structure

smart-shopping-assistant/
├── backend/
│ ├── main.py # FastAPI backend
│ ├── .env # API key for OpenRouter
│ └── requirements.txt # Python dependencies
├── frontend/
│ ├── index.html # UI with voice + text input
│ ├── script.js # Chat + markdown + voice logic
│ └── style.css # ChatGPT-style styling

