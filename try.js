let TOKEN;
let API_KEY;
let API_KEY_OPENROUTER;

import config from "./config.json" assert { type: "json" };

try {
    API_KEY = config.TOKEN_GEMINI;
    API_KEY_OPENROUTER = config.TOKEN_OPENAI;
    TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_TOKEN;

    console.log(API_KEY + " " + API_KEY_OPENROUTER + " " + TOKEN);
} catch (cant_decode_token) {
    console.error('ERROR - ' + cant_decode_token.message);
    exit(0);
}