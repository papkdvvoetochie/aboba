with open("prompt.txt", "r", encoding="utf-8") as f:
    PROMPT_TEMPLATE = f.read()

SYSTEM_PROMPT = PROMPT_TEMPLATE
print(SYSTEM_PROMPT)