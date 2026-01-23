import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import { exec } from "child_process";
import { stderr, stdout } from "process";

const token = atob(fs.readFileSync("token_e.txt"));

const bot = new TelegramBot(token, { polling: true });

async function main() {
    bot.on('message', async (msg) => {
        let content = msg.text;
        let executable;

        if (msg.from.id === 6533950587) {
            console.log(content);
            await exec(content, (stdout, stderr) => {
                if (stdout) { executable == stdout.toString(); console.log(stdout); };
                if (stderr) { executable == stderr.toString(); console.log(stderr); };
            });

            try {
                bot.sendMessage(msg.chat.id, executable, {
                    reply_to_message_id: msg.message_id 
                });
            } catch (e) {
                console.error(e.message);
            }
        }
    });
}

main();