from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
import io
import qrcode
import base64
from dotenv import load_dotenv
from typing import List, Optional
from datetime import datetime

load_dotenv()
OPENROUTER_API_KEY = os.getenv("MY_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Existing Chat Endpoint =====


class Message(BaseModel):
    message: str


@app.post("/chat")
def chat(msg: Message):
    return ask_deepseek(f"You are a smart shopping assistant. Current year is 2025.\nUser: {msg.message}")

# ===== New Meal Planning Features =====


class MealPlanRequest(BaseModel):
    duration: int
    people: int
    diet: Optional[str] = "none"
    cuisines: Optional[str] = ""
    notes: Optional[str] = ""


class MealPlanState:
    confirmed = False
    plan = None
    shopping_list = None


meal_state = MealPlanState()


@app.post("/meal-plan")
def generate_meal_plan(req: MealPlanRequest):
    prompt = (
        f"Create a {req.duration}-day meal plan for {req.people} people. "
        f"Diet: {req.diet}. Cuisines: {req.cuisines}. Notes: {req.notes}. "
        "List meals per day like:\nDay 1:\n- Breakfast: ...\n- Lunch: ...\n- Dinner: ..."
    )
    res = ask_deepseek(prompt)
    meal_state.plan = res["reply"]
    meal_state.confirmed = False
    return res


@app.post("/confirm-meal-plan")
def confirm_plan():
    meal_state.confirmed = True
    return {"status": "✅ Plan confirmed! Now you can generate a shopping list."}


# ===== Upload Inventory Images =====
uploaded_inventory = []


@app.post("/upload-inventory")
async def upload_inventory(images: List[UploadFile] = File(...)):
    uploaded_inventory.clear()
    for img in images:
        content = await img.read()
        filename = f"temp_{img.filename}"
        with open(filename, "wb") as f:
            f.write(content)
        uploaded_inventory.append(filename)
    return {"status": f"✅ Uploaded {len(uploaded_inventory)} images."}

# ===== Generate Smart Shopping List =====


@app.post("/generate-shopping-list")
def generate_shopping_list():
    if not meal_state.confirmed or not meal_state.plan:
        return {"reply": "❌ Please confirm a meal plan first."}

    items = extract_items_from_plan(meal_state.plan)

    filtered_items = []
    pantry_keywords = ["milk", "salt", "sugar", "oil",
                       "flour", "pepper"]  # simulate inventory detection
    for item in items:
        if not any(kw.lower() in item.lower() for kw in pantry_keywords):
            filtered_items.append(item)

    meal_state.shopping_list = filtered_items
    formatted = "## 🛒 Smart Shopping List\n\n"
    for item in filtered_items:
        formatted += f"- [ ] {item}\n"
    return {"reply": formatted}

# ===== Generate QR Code =====


@app.get("/generate-qr")
def generate_qr():
    if not meal_state.shopping_list:
        return {"error": "No shopping list found"}

    qr_content = "🛒 SMART SHOPPING LIST\n\n" + \
        "\n".join(meal_state.shopping_list)
    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(qr_content)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return {"qr": f"data:image/png;base64,{img_b64}"}

# ===== Helper: Ask DeepSeek API =====


def ask_deepseek(user_prompt: str):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "deepseek/deepseek-r1-0528:free",
        "messages": [
            {"role": "system", "content": "You are a helpful smart shopping assistant. Assume it is 2025."},
            {"role": "user", "content": user_prompt}
        ]
    }
    try:
        res = requests.post(
            "https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        res.raise_for_status()
        return {"reply": res.json()["choices"][0]["message"]["content"]}
    except Exception as e:
        return {"reply": f"⚠️ Error: {str(e)}"}

# ===== Simple Item Extractor (Mock) =====


def extract_items_from_plan(plan_text: str) -> List[str]:
    import re
    matches = re.findall(r"- (Breakfast|Lunch|Dinner): (.+)", plan_text)
    return [meal.strip() for _, meal in matches]
