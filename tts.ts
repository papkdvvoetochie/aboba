import gTTS from "gtts";
import { throwLog, throwErr } from "./tools.js";

export default function say(str: string, fileName: string) {
    const tts = new gTTS();
    throwLog(`To say - ${str}`);

    try {
        tts.save(fileName);
    } catch (cant_save_tts) {
        throwErr(cant_save_tts.message);
    }
}
