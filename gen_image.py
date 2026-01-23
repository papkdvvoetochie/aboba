import sys
import requests
import random

if len(sys.argv) < 2:
    print("Используй: python pollinations.py \"твой промпт\"")
    sys.exit(1)

prompt = sys.argv[1]
url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}"
name = (random.randint(0, 1000000))

try:
    response = requests.get(url)
    response.raise_for_status()
    with open(f"{name}.png", "wb") as f:
        f.write(response.content)
    print("INFO - Картинка сохранена как output.png")
except Exception as e:
    print(f"ERROR - Ошибка при генерации: {e}")