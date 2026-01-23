import { fetch } from "undici";
globalThis.fetch = fetch;
import TelegramBot from "node-telegram-bot-api";
import gTTS from "gtts";
import fs from "fs";
import { spawn } from "child_process";
import { GoogleGenAI, Language } from "@google/genai";
import { exec, execFileSync } from "child_process";
import ytdl from "ytdl-core";
import OpenAI from "openai";
import LanguageDetect from "languagedetect";
import translatte from "translatte";
import qrterm from "qrcode-terminal";
import qrcode from "qrcode";
import Tesseract from "tesseract.js";
import Parser from "rss-parser"; // для униана
import { argv, constrainedMemory, exit, stdout } from "process";
import { match, rejects } from "assert";
import { resolve } from "path";
import { Chat } from "openai/resources/index.mjs";
import { VM } from "vm2"; // песочница для выполнения кода
import util from "util";
import { channel } from "diagnostics_channel";
import { HttpsProxyAgent } from "https-proxy-agent";
import * as cheerio from "cheerio";

/*
*ABOBA BOT
*@author dvvoetochie
*/

let TOKEN;
let API_KEY;
let API_KEY_OPENROUTER;

// import config from "./config.json" assert { type: "json" };

// try {
//     API_KEY = config.TOKEN_GEMINI;
//     API_KEY_OPENROUTER = config.TOKEN_OPENAI;
//     TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_TOKEN;
// } catch (cant_decode_token) {
//     console.error('ERROR - ' + cant_decode_token.message);
//     exit(0);
// }

let current_date = new Date().toString();
let chatid;
let chatname;
let content;
let file_name;
let has;

let pref = "!";
const log_info = 'INFO - ';
const log_error = 'ERROR - ';

const banned = [1499458036]; // те кто буянил (пока не используется)

const bot = new TelegramBot(TOKEN, {
    polling: true 
});

const openai = new OpenAI({
        apiKey: API_KEY_OPENROUTER 
});

const vm = new VM({
    timeout: 800,
    sandbox: {
        Math
    }
});

const d_lang = new LanguageDetect();

async function throw_log(text) {
    let current_date = new Date().toString();
    console.log(`[ ${current_date.replace("GMT+0300 (Москва, стандартное время)", "")}] ${log_info}${text}`);
}

async function throw_error(text) {
    let current_date = new Date().toString();
    console.error(`[ ${current_date.replace("GMT+0300 (Москва, стандартное время)", "")}] ${log_error}${text}`);
}

async function gen_photo(prompt) {
    throw_log("agent used - " + agent.options.host + ":" + agent.options.port);

    // раньше тут были прокси для обхода лимитов но сейчас они не нужны

    let p_response;
    let buffer;
    
    try {
        p_response = await fetch("https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt));
        buffer = await p_response.arrayBuffer();
    } catch (cant_fetch_image) {
        throw_error(cant_fetch_image.message);
    }

    if (!buffer) return false;
    else return Buffer.from(buffer);
}

async function say_n_save(say) {
    file_name = Math.floor(Math.random() * 1000000);
    let tts;

    let src_lang = d_lang.detect(say);
    const lang = src_lang.map(pair => pair[0].toLowerCase());
    throw_log(src_lang);
    throw_log("RAW:", JSON.stringify(src_lang));

    return new Promise((resolve, reject) => {
        try {
            tts.save("sounds/" + file_name + '.mp3', (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(file_name);
                }
            });
        } catch (cant_save_tts) {
            throw_error(cant_save_tts.message);
        }
    });
}

async function main(args) {
    bot.on('error', xe => throw_error(xe.message));
    bot.on('polling_error', xe => throw_error(xe.message));

    const help_pages = [
        "——— Приколы ———\n",
        "<pre>!картинка − Случайная картинки.\n!анекдот − Случайный анекдот.\n!оск [1..4]  − Генерация мата до 4 слов.\n!елшизм − Актуальные новости Шамана и Мизулины.\n!приколдня − Самый смешной прикол дня.\n!инфо / проц [] − Да или нет.\n</pre>",
        "——— ИИ ———\n",
        "<pre>!скажи [] − TTS от Гугл.\n!ии [] − Запрос нейросети.\n!иифото [] - Генерация картинок.\n</pre>",
        "——— Полезное ———\n",
        "<pre>!вbase64 [] − Текст в Base64.\n!duckduckgo [] − Поиск в DuckDuckGo.\n!прогноз [город] − Прогноз погоды.\n!реверс [] − Реверс текста.\n!изbase64 [] − Текст из Base64.\n!переведи [язык] [] − Перевод текста.\n!видео [] − Загрузка видео из Ютуба.\n!математика [] − Простая математика.\n!qrcode [] − Обычный qr-код.\n!ocr [картинка] − Читает текст с картинки.\n!qrterm [] − Текстовый qr-код.\n</pre>",
        "——— Остальное ———\n",
        "<pre>!юзер − Информация о Юзере.\n!статус − Статус бота.\n!инфо − Информация о боте.\n!повтори − Эхо текста (HTML).</pre>",
    ] // массив с страницами для инлайн кнопок (их пока нет)

    bot.on('message', async (msg) => {
        if (true) {
            chatid = msg.chat.id;
            chatname = msg.chat.title;
            content = msg.text || '';

            if (content.toLowerCase() == (pref + 'хелп').toLowerCase() || content.toLowerCase() == (pref + 'help').toLowerCase() || content.toLowerCase() == (pref + 'команды').toLowerCase()) {
                bot.sendPhoto(chatid, 'images/help.png', {
                    caption: '<b>ABOBA</b> Bot − Ремейк легендарного бота из 2021 в Телеграме.\n\nКоманды:\n<pre>' + help_pages[0] + help_pages[1] + help_pages[2] + help_pages[3] + help_pages[4] + help_pages[5] + help_pages[6] + help_pages[7] + "</pre>",
                    parse_mode: "HTML",
                    reply_to_message_id: msg.message_id,
                });
            }

            else if (content.toLowerCase() === (pref + 'картинка').toLowerCase() || content.toLowerCase() == (pref + 'прикол').toLowerCase() || content.toLowerCase() == (pref + 'picture').toLowerCase()) {
                try {
                    let num = Math.floor(Math.random() * 15);
                    throw_log('Random num = ' + num);

                    try {
                        bot.sendPhoto(chatid, 'images/' + num + '.png', {
                            reply_to_message_id: msg.message_id
                        });
                    } catch (not_png) {
                        bot.sendPhoto(chatid, 'images/' + num + '.jpg', {
                            reply_to_message_id: msg.message_id
                        });
                    }
                } catch (error) {
                    bot.sendMessage(chatid, "чё-то не так " + error.message, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'оск ') || content.startsWith(pref + 'оск')) {
                let count = content.slice((pref + 'оск ').length);
                let final_part;

                let part_1 = ["Гомосятский", "Лошпедский", "Пидорский", "Ниггерский", "Далдовский", "Сосущий", "Гейский", "Волосатый", "Лохматый", "Какашный", "Обоссаный", "Обосранный", "Залупный", "Ебланский", "Дрочильный"];
                let part_2 = ["Бурятский мультик", "сосатель", "олух", "гомосек", "нигга", "далдо", "член", "лошпед", "кака", "свеня", "свиник", "анус", "свин", "петух", "лохмач", "залупа", "клитор", "хуй", "еблан", "дрочила"];
                let part_3 = ["сосал", "дрочил", "лизал", "нюхал", "вылизал", "разбил", "сломал", "взорвал", "умер", "зажёг", "вынес", "ободрал", "обосрал", "обоссал", "отсосал", "отлизал", "отдрочил", "залупил", "залупался"];
                let part_4 = ["клитор", "хуй", "дадло", "залупу", "что-то", "ничего", "?", "ниггу", "себя", "Капи", "геев", "бурят мультику", "Абобу", "свиника", "[Секретно]", "анус", "петуха", "свина", "каку", "лохмача"];

                let x = Math.floor(Math.random() * part_1.length);
                let y = Math.floor(Math.random() * part_2.length);
                let z = Math.floor(Math.random() * part_3.length);
                let p = Math.floor(Math.random() * part_4.length);

                if (count <= 2 || count == 0) {
                    final_part = part_1[x] + ' ' + part_2[y];
                }
                else if (count == 3) {
                    final_part = part_1[x] + ' ' + part_2[y] + ' ' + part_3[z];
                }
                else if (count <= 4) {
                    if (p != 7) {
                        final_part = part_1[x] + ' ' + part_2[y] + ' ' + part_3[z] + ' ' + part_4[p];
                    } else if (p == 7) {
                        final_part = part_1[x] + ' ' + part_2[y] + ' ' + part_3[z] + part_4[p];
                    } // криво
                }
                else {
                    final_part = part_1[x] + ' ' + part_2[y];
                }

                bot.sendMessage(chatid, final_part, {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref + 'елшизм') {
                const reply = ["Пока нет информации", "Информации нет", "Спроси позже", "Агентство ЕЛШИЗМ сегодня молчит..."];
                let last_news = 'Заглушка...';
                let reply_var = Math.floor(Math.random() * 4);

                if (!has) {
                    bot.sendMessage(chatid, reply[reply_var] + '\n\nПоследняя новость:\n<blockquote>' + last_news + '</blockquote>', {
                        parse_mode: "HTML",
                        reply_to_message_id: msg.message_id
                    });
                } else {
                    bot.sendMessage(chatid, 'Да, ебались.\n\nПоследняя новость:\n<blockquote>' + last_news + '</blockquote>', {
                            parse_mode: "HTML",
                            reply_to_message_id: msg.message_id
                        }
                    );
                } // заглушка
            }

            else if (content.startsWith(pref + 'скажи ')) {
                const file_content = content.slice((pref + 'скажи ').length);
                let del = false;

                try {
                    try {
                        await say_n_save(file_content);
                    } catch (error) {
                        bot.sendMessage(chatid, 'Чё-то пошло не так ' + error.message, {
                            reply_to_message_id: msg.message_id
                        });
                    }
                    console.log(file_name);

                    await new Promise(ex => setTimeout(ex, 300));
                    if (fs.existsSync('sounds/' + file_name + '.mp3')) {
                        bot.sendVoice(chatid, 'sounds/' + file_name + '.mp3', {
                            caption: 'Провайдер: Google TTS',
                            reply_to_message_id: msg.message_id
                        });
                        throw_log('Временный файл ' + file_name + ' удалён');
                        try {
                            if (del)
                                fs.unlinkSync("sounds/" + file_name + '.mp3');
                        } catch (cant_delete) { 
                            throw_error(cant_delete.message);
                        }
                    } else {
                        throw_error('Файла несуществует');
                        bot.sendMessage(chatid, 'Чё-то не так... Файла не существует.', {
                            reply_to_message_id: msg.message_id
                        });
                    }
                } catch (cant_tts) {
                    throw_error(cant_tts.message);
                }
            }

            else if (content.startsWith(pref + "ии ")) {
                const parts = content.slice((pref + 'ии ').length);
                const allowed = false;

                if (allowed) {
                    try {
                        const stdout = await execFileSync( // снова питоновские мосты
                            "python",
                            ["-X", "utf8", "ai_bridge.py", parts],
                            { maxBuffer: 1024 * 1024, encoding: "utf-8" }
                        ); // мрази не делают для жс нормльные библиотеки

                        const answer = stdout.trim() || "...";
                    
                        bot.sendMessage(chatid, answer, {
                            parse_mode: "Markdown",
                            reply_to_message_id: msg.message_id
                        });
                    } catch (cant_generate) {   
                        bot.sendMessage(chatid, 'Чё-то не так... ' + cant_generate.message);
                    }
                } else {
                    bot.sendMessage(chatid, "ИИ ВРЕМЕННО ОТКЛЮЧЕН!!!", {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'иифото')) {
                const allowed = false;
                if (!allowed) {
                    let slice_parts = content.slice((pref + 'иифото ').length);
                    let file_name = 'images/' + Math.floor(Math.random() * 1000000) + '.png';
                    let is_nsfw = false;
                    let to_translate_parts;
                    let parts;

                    to_translate_parts = await translatte(slice_parts, {
                        to: 'en'
                    }); // чтобы нейронка лучше понимала промпт

                    let translated_parts = to_translate_parts.text;

                    throw_log(translated_parts);

                    if (translated_parts.includes("penis") || translated_parts.includes("boobs") || translated_parts.includes("sex") || translated_parts.includes("naked") || translated_parts.includes("vagina") || translated_parts.includes("penis") || translated_parts.includes("cock") || translated_parts.includes("porn")) {
                        is_nsfw = true;
                    } // банворды
                    if (translated_parts.includes("child") || translated_parts.includes("child porn") || translated_parts.includes("cp") || translated_parts.includes("child porn") || translated_parts.includes("minor") || translated_parts.includes("childs")) {
                        slice_parts = 'Большая и видная надпись \'IDI NAHUI\'';
                    } // банворды 2

                    if (is_nsfw && !(chatid === -1002737828895)) {
                        try {
                            bot.sendMessage(chatid, 'NSFW Разрешён только тут - https://t.me/+y6H620kqS1phNGFi', { // только в анархии
                                reply_to_message_id: msg.message_id
                            });
                        } catch (cant_send_nsfw_alert) {
                            console.log(`${log_error}${cant_send_nsfw_alert}`);
                            bot.sendMessage(chatid, 'NSFW Разрешён только тут - https://t.me/+y6H620kqS1phNGFi');
                        }
                    }

                    try {
                        parts = to_translate_parts.text;

                        throw_log('Промпт: ' + parts + ' Оригинал: ' + slice_parts);

                        if (slice_parts.includes("naked") || slice_parts.includes("big") || slice_parts.includes("boobs") || slice_parts.includes("penis")) { // старая проверка
                            is_nsfw = true;
                            if (chatid === -1002737828895) {
                                gen_photo(parts).then(img => {
                                    try {
                                        fs.writeFileSync(file_name, img);
                                    } catch (cant_write_file_ii) {
                                        throw_error(cant_write_file_ii.message);
                                    }
                                    try {
                                        let buffer = fs.readFileSync(file_name);

                                        if (!buffer.contains("Google Media Processing Services")) {
                                            bot.sendPhoto(chatid, file_name, {
                                                caption: 'Картинка Сгенерирована:',
                                                reply_to_message_id: msg.message_id
                                            });

                                            buffer = "";
                                        } else {
                                            bot.sendMessage(chatid, "Чё-то не так... Рейт лимит", {
                                                reply_to_message_id: msg.message_id
                                            });

                                            buffer = "";
                                        }
                                    } catch (cant_send_file_ii) {
                                        throw_error(cant_send_file_ii.message);
                                        bot.sendMessage(chatid, "Чё-то не так... " + cant_send_file_ii.message);
                                    }
                                });
                            } else if (is_nsfw && !(chatid === -1002737828895)) {
                                bot.sendMessage(chatid, 'NSFW Разрешён только тут - https://t.me/+y6H620kqS1phNGFi', {
                                    reply_to_message_id: msg.message_id
                                });
                            }
                        }
                        if (!is_nsfw) {
                            gen_photo(parts).then(img => {
                                try {
                                    fs.writeFileSync(file_name, img);
                                } catch (cant_write_file) {
                                    console.error(log_error + cant_write_file.message);
                                }
                                try {
                                    bot.sendPhoto(chatid, file_name, {
                                        caption: 'Картинка Сгенерирована:',
                                        reply_to_message_id: msg.message_id
                                    });
                                } catch (cant_send_file) {
                                    console.error(log_error + cant_send_file.message);
                                    bot.sendMessage(chatid, "Чё-то не так... " + cant_send_file.message);
                                }
                            });
                        }
                    } catch (cant_generate_photo) {
                        console.error(log_error + cant_generate_photo.message);
                        bot.sendMessage(chatid, 'Чё-то не так... ' + cant_generate_photo.message, {
                            reply_to_message_id: msg.message_id
                        });
                    }
                } else {
                    bot.sendMessage(chatid, "ГЕНЕРАЦИЯ КАРТИНОК ВРЕМЕННО ОТКЛЮЧЕНА!!!", { // если дрочеров слишком много
                        reply_to_message_id: msg.message_id
                    });
                }
            }
                
            
            else if (content.startsWith(pref + 'вbase64 ') || content.startsWith(pref + 'ibase64 ')) {
                const parts = content.slice((pref + 'вbase64 ').length);
                let to_b64;

                try {
                    to_b64 = btoa(parts);
                } catch (cant_encode) {
                    console.error(log_error + cant_encode.message + ', пробуем фаллбек...');
                    try {
                        to_b64 = Buffer.from(parts).toString("base64");
                    } catch (error) {
                        bot.sendMessage(chatid, 'Не удалось энкодировать в Base64. ' + error.message, {
                            reply_to_message_id: msg.message_id
                        });
                    }
                }

                if (/[абвгдеёжзийклмнАБВГДЕЁЖЗИЙКЛМН]/.test(parts)) {
                    try {
                        to_b64 = to_b64.replace(/[^A-Za-z0-9+/=]/g, "");
                    } catch (error) {
                        console.error(log_error + error.message);
                    }
                }

                bot.sendMessage(chatid, 'Энкодировано: ' + to_b64 + '\nОригинал: ' + parts + '', {
                    parse_mode: "Markdown",
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content.startsWith(pref + "изbase64 ") || content.startsWith(pref + 'frbase64 ')) {
                const parts = content.slice((pref + 'изbase64 ').length);
                let from_b64

                try {
                    from_b64 = atob(parts);
                } catch (cant_decode) {
                    console.error(log_error + cant_decode.message + ', пробуем фаллбек...');
                    from_b64 = Buffer.from(parts, "base64").toString("utf8");
                }

                bot.sendMessage(chatid, 'Декодировано: ' + from_b64 + '\nОригинал: ' + parts + '', {
                    parse_mode: "Markdown",
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content.startsWith(pref + 'переведи ')) {
                const parts = content.slice((pref + 'переведи ').length).trim();
                const space_idx = parts.indexOf(' ');
                let translated;

                let to_lang = parts.slice(0, space_idx).trim();

                let parts_2 = parts.slice(space_idx + 1).trim();

                try {
                    translated = await translatte(parts_2, {
                        to: to_lang,
                    });
                } catch (cant_fetch) {
                    bot.sendMessage(chatid, 'Чё-то не так... ' + cant_fetch.message, {
                        reply_to_message_id: msg.message_id
                    });
                }

                try {
                    if (translated.text.length < 1296) {
                        try {
                            bot.sendMessage(chatid, 'Переведено: ' + translated.text, {
                                reply_to_message_id: msg.message_id
                            });
                        } catch (cant_translate) {
                            bot.sendMessage(chatid, 'Чё-то не так... ' + cant_translate.message, {
                                reply_to_message_id: msg.message_id
                            });
                        
                            throw_error(cant_translate.message);
                        }
                    } else {
                        bot.sendMessage(chatid, 'Чё-то не так... Слишком большой текст для перевода.', {
                            reply_to_message_id: msg.message_id
                        });
                    }
                } catch (e) {
                    throw_error(e.message);
                }
            }

            else if (content.startsWith(pref + 'видео ')) {
                let parts_3 = content.slice((pref + 'видео ').length);
                let vid_name = Math.floor(Math.random() * 1000) + '.mp4';
                let downloaded = false;

                try {
                    await new Promise ((resolve, reject) => {
                            exec('python video_downloader.py ' + parts_3 +  ' ' + vid_name + ' ' + '\"18/best[height<=360]\"', // для жс нет нормальных довнлодеров видео 
                                { maxBuffer: 1024 * 1024 * 200 },
                                (err, stdout, stderr) => err ? reject(err) : resolve(stdout)
                            )
                        });
                    
                    await bot.sendVideo(chatid, vid_name, {
                        caption: 'Видео загружено:',
                        reply_to_message_id: msg.message_id
                    });
                    
                    downloaded = true;
                } catch (cant_download) {
                    bot.sendMessage(chatid, 'Чё-то не так... ' + cant_download.message, {
                        reply_to_message_id: msg.message_id
                    });
                    console.error(log_error + cant_download.message);
                }

                if (downloaded) {
                    try {
                        fs.unlinkSync(vid_name);
                    } catch (cant_delete_2) {
                        console.error(log_error + cant_delete_2.message);
                    }
                }
            }

            else if (content == pref + 'юзер') {
                const target = msg.from;

                if (msg.entities) {
                    const mention = msg.entities.find(entity => entity.type === 'mention');

                    if (mention) { // не работает
                        const uname = content.slice(mention.offset + 1, mention.offset + mention.length);
                        try {
                            const user_info = await bot.getChatMember(chatid, uname);
                            target = user_info.user;
                        } catch (cant_get_user) {
                            bot.sendMessage(chatid, 'Чё-то не так... ' + cant_get_user.message, {
                                reply_to_message_id: msg.message_id
                            });
                            return;
                        }
                    }
                }

                const user_id = target.id || '<b>Не указан</b>';
                const username = target.username || '<b>Не указан</b>';
                const last_name = target.last_name || '<b>Не указана</b>';
                const first_name = target.first_name || '<b>Не указано</b>';
                const is_bot = target.is_bot || "<b>Нет</b>";
                const premium = target.premium || "<b>Нет</b>";
                const lang = target.language_code || "<b>Неизвестно</b>";
                const pfp_list = await bot.getUserProfilePhotos(user_id, {
                    limit: 1
                });
                let pfp;

                if (pfp_list.total_count === 0) {
                    pfp = 'images/no_pfp.png';
                } else {
                    pfp = pfp_list.photos[0][0].file_id;
                }

                if (msg.from.id === 8313677056) pfp = 'images/gay.png';
                
                bot.sendPhoto(chatid, pfp, {
                    parse_mode: "HTML",
                    caption: 'Информация о юзере:\n' + '<blockquote>' + 'Юзернейм — <a href="t.me/' + username + '">@' + username + '</a>\nID — <a href="tg://openmessage?user_id=' + user_id + '">' + user_id + '</a>\n——————\nИмя — ' + first_name + '\nФамилия — ' + last_name + '\n——————\nБот — ' + is_bot + '\nПремиум — ' + premium + '\nЯзык — ' + lang + '</blockquote>',
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref + 'приколдня') {
                const motd = ["42 брат", "52", "свага", "танец покойного", "окак", "67", "Кролик с часиками", "чурка в анархии фурри кидает", "#попка", "22", "POZI"];

                const num = Math.floor(Math.random() * motd.length);
                bot.sendMessage(chatid, "ПРИКОЛ ДНЯ: " + motd[num], {
                    reply_to_message_id: msg.message_id
                });
            }
            
            else if (content.startsWith(pref + 'математика ')) {
                const plus = content.slice((pref + 'математика ').length);
                let result;
                let i = 0; // колхоз

                try {
                    if (!(plus.includes("process") || plus.includes("require") || plus.includes("import") || plus.includes("fs") || plus.includes("child_process") || plus.includes("exec") || plus.includes("execSync") || plus.includes("function") || plus.includes("constructor") || plus.includes("while") || plus.includes("for") || plus.includes("=>") || plus.includes("{") || plus.includes("}") || plus.includes(";") || plus.includes("repeat"))) { // защита от мразей которые пыюатся положить бота 
                        i = 1;
                        result = Function('return ' + plus)();
                    } else {
                        i = 0;
                        bot.sendMessage(chatid, 'Чё-то не так... Запрещённые символы', { 
                            reply_to_message_id: msg.message_id
                        });
                    }
                    if (i == 1) {
                        bot.sendMessage(chatid, 'Результат = ' + result, {
                            reply_to_message_id: msg.message_id
                        });
                    }
                } catch (cant_do) {
                    bot.sendMessage(chatid, 'Чё-то не так... ' + cant_do.message, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'инфо ') || content.startsWith(pref + 'проц ')) {
                let view_info;

                if (content.includes("инфо")) {
                    view_info = true;
                } else if (content.includes("проц")) {
                    view_info = false;
                }

                const info = content.slice((pref + 'инфо ').length);
                const num = Math.floor(Math.random() * 5);
                const proc = Math.floor(Math.random() * 100);
                const reply_var = ["Да", "Возможно частично", "Не знаю", "Скорее нет", "Нет"];

                if (view_info) {
                    bot.sendMessage(chatid, '<blockquote>«' + info + '»</blockquote>' + reply_var[num], {
                        parse_mode: "HTML",
                        reply_to_message_id: msg.message_id
                    });
                } else {
                    bot.sendMessage(chatid, '<blockquote>«' + info + '»</blockquote>' + proc + '%', {
                        parse_mode: "HTML",
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'qrterm ')) { // ради прикола
                const to_qrterm = content.slice((pref + 'qrterm ').length);

                const qr = qrterm.generate(to_qrterm, {
                    small: true
                }, (qr_string) => {
                    bot.sendMessage(chatid, qr_string, {
                        reply_to_message_id: msg.message_id
                    });
                });
            }

            else if (content.startsWith(pref + 'qrcode ')) {
                let buff;
                const to_qrcode = content.slice((pref + 'qrcode ').length);

                try {
                    buff = await qrcode.toBuffer(to_qrcode);
                    bot.sendPhoto(chatid, buff, {
                        reply_to_message_id: msg.message_id
                    });
                } catch (cant_qr) {
                    bot.sendMessage(chatid, 'Чё-то не так... ' + cant_qr.message);
                }
            }

            else if (content == pref + 'ocr') {
                try { // тоже не работает
                    const file_id = msg.photo[msg.photo.length - 1].file_id;
                    const file = await bot.getFile(file_id);
                    const file_name = Math.floor(Math.random() * 15);
                    const url = 'https://api.telegram.org/file/bot/' + token + file.file_path;

                    const response = await fetch(url);
                    const buff = await response.buff();
                    const temp = 'temp_' + file_name + '.png';
                    fs.writeFileSync(temp, buff);

                    const {
                        data: {
                            text
                        }
                    } = await Tesseract.recognize(temp, "eng+rus");

                    bot.sendMessage(chatid, "Текст на фото: " + text, {
                        reply_to_message_id: msg.message_id
                    });
                    fs.unlinkSync(temp);
                } catch (cant_recognize) {
                    bot.sendMessage(chatid, 'Чё-то не так... ' + cant_recognize.message, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'execrun ') || content.startsWith(pref + 'execrun')) {
                let to_file = content.slice(('!execrun ').length);
                let file_name = 'scripts/' + Math.floor(Math.random() * 99999999999999999999999999) + '.js'; // бешеное число
                let lang = 'JS'; // только жс пока что

                if (msg.from.id === 6533950587 && msg.from.username == 'Burnderd') { // для элиты
                    if (to_file.includes('import') && (!(msg.from.id === 6533950587) || to_file.includes('input'))) {
                        bot.sendMessage(chatid, 'Импорт или stdin не поддерживаются', {
                            reply_to_message_id: msg.message_id
                        });
                    } else {
                        try {
                            try {
                                fs.writeFileSync(file_name, to_file);
                            } catch (cant_write) {
                                console.error(log_error + cant_write.message);

                                let char = 'qwertyuiopasdfghjklzxcvbnm';
                                file_name = '';

                                for (let i = 0; i < char.length; i++) {
                                    if (lang == 'JS') {
                                        file_name += char[Math.floor(Math.random() * 10)] + '.js';
                                    }
                                }
                            }
                            if (lang == 'JS') {
                                    exec('node ' + file_name, (stdout, stderr) => {
                                    try {
                                        if (stdout || stderr) {
                                            bot.sendMessage(chatid, "stderr: " + stdout + "\nstdout: " + stderr, { // stdout и stderr перепутаны
                                                reply_to_message_id: msg.message_id,
                                                encoding: "utf-8"
                                            });
                                        }
                                    } catch (cant_run) {
                                        bot.sendMessage(chatid, 'Чё-то не так... ' + cant_run.message, {
                                            reply_to_message_id: msg.message_id,
                                            encoding: "utf-8"
                                        });
                                    }
                                });
                            }
                        } catch (cant_exec) {
                            bot.sendMessage(chatid, 'Чё-то не так... ' + cant_exec.message);
                        }
                    }
                } else {
                    // ограниченная версия для лохов
                    let risk = ["import", "require", "=>", "process", "ip", "remove", "eval", "constructor", "function", 
                        "system32", "token.txt", "token_b64.txt", "cd /", "fetch", 'C:', "32", "PS", "PowerShell", "CMD", 
                        "Terminal", "wsl", "xterm", "windir", "win32", "explorer", "openUrl:", "stdout", "stdin", "exec"];

                    let allowed = true;
                    let std_out;

                    for (const word of risk) {
                        if (to_file.includes(word)) {
                            bot.sendMessage(chatid, word + ' Не поддерживается', {
                                reply_to_message_id: msg.message_id
                            });
                            allowed = false;
                            return;
                        }
                    }

                    if (allowed) {
                        try {
                            std_out = vm.run(`(${to_file})`);
                            throw_log('Code to execute - ' + std_out);
                            bot.sendMessage(chatid, std_out, {
                                reply_to_message_id: msg.message_id
                            });
                        } catch (cant_exec) {
                            bot.sendMessage(chatid, "Чё-то не так... " + cant_exec.message, {
                                reply_to_message_id: msg.message_id
                            });
                        }
                    }
                }
            }

            else if (content == pref + 'униан') {
            } // плейсхолдер

            else if (content.startsWith(pref + 'повтори')) {
                let repeat = content.slice((pref + 'повтори').length); 

                repeat = repeat.replaceAll("@", "[@]")
                repeat = repeat.replaceAll("ㅤ", "");
                // защита от рейдеров и пингов
                repeat = repeat.replaceAll("<>", "&lt;&gt;")
                // чтобы не падало при парсинге
                
                if (repeat.length < 700) {
                    try {
                        if (repeat == '' || repeat == null) repeat = "Чё-то не так... Заебал писать пробелы"; // напоминание петуху о том что он петух
                        bot.sendMessage(chatid, repeat, {
                            reply_to_message_id: msg.message_id,
                            parse_mode: "HTML"
                        });
                    } catch (cant_send) {
                        throw_error(cant_send.message);
                        bot.sendMessage(chatid, "Чё-то не так... " + cant_send.message, {
                            reply_to_message_id: message_id
                        })
                    } 
                } else {
                    bot.sendMessage(chatid, "Чё-то не так... Сообщение слишком длинное", {
                        reply_to_message_id: msg.message_id
                    })
                }
            }

            else if (content.startsWith(pref + 'транслит ')) { // не работает
                let to_norm = content.slice((pref + 'транслит ').length);

                const char_map = {q:'й', w:'ц', e:'у', r:'к', t:'е', y:'н', u:'г', i:'ш', o:'щ', p:'з', '[':'х', ']':'ъ', a:'ф', s:'ы', d:'в', f:'а', g:'п', h:'р', j:'о', k:'л', l:'д', z:'я'};

                try {
                    to_norm = to_norm.replaceAll(/[a-z]/, c => char_map[c] || '\'?\'', {
                        encoding: "utf-8"
                    });
                    
                    to_norm = to_norm.replaceAll(/[A-Z]/, c => char_map[c] || '\'?\'', {
                        encoding: "utf-8"
                    });

                    bot.sendMessage(chatid, 'Нормальная версия: ' + to_norm, {
                        reply_to_message_id: msg.message_id
                    });
                } catch (cant_translit) {
                    bot.sendMessage(chatid, 'Чё-то не так... ' + cant_translit.message, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'длинна ')) {
                const msg_length = content.slice((pref + 'длинна ').length).length;

                bot.sendMessage(chatid, 'Длинна текста — ' + msg_length + ' символов', {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref + 'офвпышывпш' || content == pref + 'владизболгарии' || content == pref + 'владизбеларуси' || content == pref + 'владизнорильска' || content == pref + 'владотбългария') {
                bot.sendMessage(chatid, ' VLAD VLAD VLAD<a href="https://cdn.discordapp.com/attachments/1454075217012981954/1461260309951152315/VID_20251214_000401_805.mp4?ex=6969e836&is=696896b6&hm=4a66487aefbe563d3d5c713ce9570bc6ba8095ec1a08ca88ca93a1f138398f36&">: </a>', {
                    reply_to_message_id: msg.message_id,
                    parse_mode: "HTML"
                });
            }

            else if (content.startsWith(pref + 'реддит ')) {
                let search = content.slice((pref + 'поискфото ').length);
                search = search.replace(" ", "+");

                const response = await (await fetch("https://www.reddit.com/search.json?q=" + search + "&restrict_sr=off&sort=relevance&t=all")).json();
                try {
                    bot.sendMessage(chatid, response.data.children[0].data.url, {
                        parse_mode: "HTML",
                        reply_to_message_id: msg.message_id
                    });
                } catch (no_results) {
                    bot.sendMessage(chatid, `По запросу '${search}' не найдено результатов.`, {
                        parse_mode: "HTML",
                        reply_to_message_id: msg.message_id
                    })
                }
            }

            else if (content == pref + 'хуйня') { // надо
                bot.sendMessage(chatid, 'Сам хуйня', {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref + 'мазута') {
                const num = Math.floor(Math.random() * 3);

                bot.sendVideo(chatid, 'images/serov/' + num + '.mp4', {
                    reply_to_message_id: msg.message_id
                }); // мазута серов
            }

            // https://cdn.discordapp.com/attachments/1454075217012981954/1462023276593414142/VID_20251214_000401_805.mp4?ex=696caecc&is=696b5d4c&hm=1f3f5f3e1f3e4e1e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff&

            else if (content.startsWith(pref + 'донат ')) { // заглушка
                const blacklist = 1;
                
                if (msg.from.id != blacklist) {
                    const text = content.slice((pref + 'донат ').length);
                    let user_name;
                    if ((msg.from.first_name).length < 15) {
                        user_name = msg.from.first_name;
                    } else {
                        user_name = msg.from.username;
                    }

                    try {
                        say_n_save(`${user_name} сказал - ${text}`);
                        try {
                            fs.writeFileSync("donate.txt", text);
                        } catch (cant_write) {
                            throw_error(cant_write.message)
                        } finally {
                            spawn("ffplay", ["-nodisp", "-autoexit", "sounds/" + file_name + ".mp3"], {
                                detached: true,
                                stdio: "ignore"
                            }).unref();
                        }
                        bot.sendMessage(chatid, `Донат отправлен`, {
                            reply_to_message_id: msg.message_id
                        });
                    } catch (cant_save_tts) {
                        throw_error(cant_save_tts.message);
                    }
                } else {
                    bot.sendMessage(chatid, `Ты забанен малышара канализация`, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            // новое

            else if (content.startsWith(pref + 'анекдот')) {
                const response = await (await fetch("https://www.anekdot.ru/random/anekdot/")).text();
                const $ = cheerio.load(response);
                const joke = $('.text').first().text().trim();
                bot.sendMessage(chatid, 'АНЕКДОТ: ' + joke, {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content.startsWith(pref + 'реверс ')) {
                const parts = content.slice((pref + 'реверс ').length);
                const reversed = parts.split('').reverse().join('');

                bot.sendMessage(chatid, 'Реверс: ' + reversed, {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref + 'айди') { // фури айди
                const id = msg.from.id;

                bot.sendMessage(chatid, `Твой ID: <a href=\"tg://openmessage?user_id=${id}\">` + id + `</a>`, {
                    reply_to_message_id: msg.message_id,
                    parse_mode: "HTML"
                });
            }
            // без апи
            else if (content.startsWith(pref + 'прогноз ')) {
                try {
                    const city = content.slice((pref + 'прогноз ').length);
                    const weather_response = await (await fetch(`https://wttr.in/${city}?format=3`)).text();
                    bot.sendMessage(chatid, `Погода в ` + weather_response, {
                        reply_to_message_id: msg.message_id
                    });
                } catch (e) {
                    throw_error(e.message);
                }
            }

            else if (content.startsWith(pref + 'duckduckgo')) { // поиск в утке
                let query = content.slice((pref + 'duckduckgo').length).trim();
                const response = await (await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&skip_disambig=1`)).json();
                if (response.AbstractText) {
                    bot.sendMessage(chatid, `Результат поиска:\n\n<blockquote>${response.AbstractText}</blockquote>`, {
                        reply_to_message_id: msg.message_id,
                        parse_mode: "HTML"
                    });
                } else {
                    bot.sendMessage(chatid, `По запросу '${query}' не найдено результатов.`, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content == pref + 'инфо') {
                bot.sendMessage(chatid, "🅰️🅱️🅾️🅱️🅰️ Bot \n@tg_aboba_bot\n\nБот:<blockquote>Написан на — JavaScript\nСоздатель — <a href=\"t.me/burnderd\">@Burnderd</a>\nСтатус — работает</blockquote>\nБиблиотеки:<blockquote>Перевод — Translatte\nOCR — Tesseract.js\nTTS — gTTS\nЗагрузка видео — ytdl</blockquote>", {
                    parse_mode: "HTML",
                    reply_to_message_id: msg.message_id
                });
            }
            // import { fetch } from "undici";

            // /новое

            else if (content == pref + 'статус') {
                bot.sendMessage(chatid, 'Работает', {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref || content == '/start' || content == '@tg_aboba_bot') {
                bot.sendMessage(chatid, 'Список команд: <pre>!хелп</pre>', {
                    parse_mode: "HTML",
                    reply_to_message_id: msg.message_id
                });
            }

            else if (msg.from.id === 5226378684 || content == pref + 'ирис') {
                let send; // колхозный рандомайзер
                
                if (!(content == pref + 'ирис')) {
                    send = Math.floor(Math.random() * 100);
                } else {
                    send = 50;
                }

                if (send == 50) {
                    const prek = ["ирис дурак", "ирис чмо", "ирис педик", "ирис говноед", "ирис шлюха", "ирис лох", "ирис отстой", "ирис ублюдок", "ирис козёл", "ирис мудак", "ирис сасёт", "ирис слабак"];
                    const num = Math.floor(Math.random() * prek.length);

                    bot.sendMessage(chatid, 'СМЕШНОЙ АНЕКДОТ ПРО ИРИСА: ' + prek[num], {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content == "пиу" || content == "пинг") {
                bot.sendMessage(chatid, "ИРИС ШАЛАВА");
            }
        } else {
            bot.sendMessage('Бот в разработке...'); // осталось с времён альфы
        }
        
        try {
            let b64_log = btoa(content); // шифрует сообщения чтобы не подглядывать
            current_date = new Date().toString();
            current_date = current_date.replace("GMT+0300 (Москва, стандартное время)", ""); // колхоз для лога но работает
            // console.log('[' + current_date + '] ' + log_info + 'Message in ' + chatid + ' (' + chatname + ')' + ' - \'' + b64_log + '\'');
            throw_log('Message in ' + chatid + ' (' + chatname + ')' + ' - \'' + b64_log + '\'');
        } catch (error) {
            throw_error(error.message);
        }
    });

    throw_log('Бот запущен...');
}

main();


