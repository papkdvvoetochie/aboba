import sys
import time
import traceback
import concurrent.futures
import json
from openai import OpenAI
# ПИТОН ДЛЯ ДУРАКОВ ПРОБЕЛЫ НЕ СТАВИТЬ ИНАЧЕ ВСЁ БУДЕТ ПЛОХО

# всё дальше делала нейронка

# ===== НАСТРОЙКИ =====
with open ("config.json", "r") as j:
    config = json.load(j)
OPENROUTER_KEY = config["OPENROUTER_KEY"]
TIMEOUT_PER_MODEL = 30  # секунд на одну модель

MODELS = [
    "openai/gpt-oss-120b:free",
    "deepseek/deepseek-r1-0528:free"
]

with open("prompt.txt", "r", encoding="utf-8") as f:
    PROMPT_TEMPLATE = f.read()

SYSTEM_PROMPT = PROMPT_TEMPLATE
# ====================

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_KEY,
    default_headers={
        "HTTP-Referer": "http://localhost",
        "X-Title": "aboba-bot"
    }
)

def call_model(model, prompt):
    res = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500
    )
    return res.choices[0].message.content.strip()

def ask_ai(prompt):
    last_error = None

    for model in MODELS:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
            fut = ex.submit(call_model, model, prompt)
            try:
                return fut.result(timeout=TIMEOUT_PER_MODEL)
            except concurrent.futures.TimeoutError:
                last_error = f"{model}: timeout"
            except Exception as e:
                last_error = f"{model}: {e}"

    return f"ИИ сдох. Причина: {last_error}"

def main():
    if len(sys.argv) < 2:
        print("Нет запроса")
        return

    prompt = sys.argv[1]
    try:
        print(ask_ai(prompt))
    except Exception as e:
        print("Фатал:", e)
        traceback.print_exc()

if __name__ == "__main__":
    main()
