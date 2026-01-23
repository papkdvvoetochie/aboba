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
*   ABOBA BOT
*   @author dvvoetochie
*   @version vh.z
*/

// import config from `./config.json` assert { type: `json` };

// try {
//     apiGemini = config.tgToken_GEMINI;
//     apiOpenrouter = config.tgToken_OPENAI;
// } catch (cant_decode_tgToken) {
//     console.error('ERROR - ' + cant_decode_tgToken.message);
//     exit(0);
// }


let tgToken = process.env.BOT_TOKEN || process.env.TELEGRAM_TOKEN;
let apiGemini;
let apiOpenrouter;
let currentDate;
let chatId;
let chatName;
let content;
let fileName;
let has;

let pref = `!`;
const logInfo = 'INFO - ';
const logError = 'ERROR - ';

const banned = [1499458036]; // те кто буянил (пока не используется)

const bot = new TelegramBot(tgToken, {
    polling: true 
});

const openai = new OpenAI({
    apiKey: `apiOpenrouter`
});

const vm = new VM({
    timeout: 800,
    sandbox: {
        Math
    }
});

const detectLang = new LanguageDetect();

async function throwLog(text) {
    let currentDate = new Date().toLocaleString();
    console.log(`[ ${currentDate.replace(`GMT+0300 (Москва, стандартное время)`, ``)}] ${logInfo}${text}`);
}

async function throwErr(text) {
    let currentDate = new Date().toLocaleString();
    console.error(`[ ${currentDate.replace(`GMT+0300 (Москва, стандартное время)`, ``)}] ${logError}${text}`);
}

async function genPhoto(prompt) {
    // раньше тут были прокси для обхода лимитов но сейчас они не нужны

    let pResponse;
    let buffer;
    
    try {
        pResponse = await fetch(`https://image.pollinations.ai/prompt/` + encodeURIComponent(prompt));
        buffer = await p_response.arrayBuffer();
    } catch (cant_fetch_image) {
        throwErr(cant_fetch_image.message);
    }

    if (!buffer) return false;
    else return Buffer.from(buffer);
}

async function sayNnave(say) {
    fileName = Math.floor(Math.random() * 1000000);
    let tts;

    const srcLang = detectLang.detect(say);
    throwLog(`RAW:`, JSON.stringify(srcLang));

    return new Promise((resolve, reject) => {
        try {
            tts.save(`sounds/` + fileName + '.mp3', (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(fileName);
                }
            });
        } catch (cant_save_tts) {
            throwErr(cant_save_tts.message);
        }
    });
}

async function main(args) {
    bot.on('error', xe => throwErr(xe.message));
    bot.on('polling_error', xe => throwErr(xe.message));

    const hArr = [
        `——— Приколы ———\n`,
        `!картинка − Случайная картинки.\n!анекдот − Случайный анекдот.\n!оск [1..4]  − Генерация мата до 4 слов.\n!елшизм − Актуальные новости Шамана и Мизулины.\n!приколдня − Самый смешной прикол дня.\n!инфо / проц [] − Да или нет.\n`,
        `——— ИИ ———\n`,
        `!скажи [] − TTS от Гугл.\n!ии [] − Запрос нейросети.\n!иифото [] - Генерация картинок.\n<`,
        `——— Полезное ———\n`,
        `!вbase64 [] − Текст в Base64.\n!duckduckgo [] − Поиск в DuckDuckGo.\n!прогноз [город] − Прогноз погоды.\n!реверс [] − Реверс текста.\n!изbase64 [] − Текст из Base64.\n!переведи [язык] [] − Перевод текста.\n!видео [] − Загрузка видео из Ютуба.\n!математика [] − Простая математика.\n!qrcode [] − Обычный qr-код.\n!ocr [картинка] − Читает текст с картинки.\n!qrterm [] − Текстовый qr-код.\n`,
        `——— Остальное ———\n`,
        `!юзер − Информация о Юзере.\n!статус − Статус бота.\n!инфо − Информация о боте.\n!повтори − Эхо текста (HTML).`,
    ]

    // массив с страницами для инлайн кнопок (их пока нет)

    bot.on('message', async (msg) => {
        if (true) {
            chatId = msg.chat.id;
            chatName = msg.chat.title;
            content = msg.text || '';

            if (content.toLowerCase() == (pref + 'хелп').toLowerCase() || content.toLowerCase() == (pref + 'help').toLowerCase() || content.toLowerCase() == (pref + 'команды').toLowerCase()) {
                bot.sendMessage(chatId, '📖<b>Помощь</b>\n   Страница 1\n\nКоманды<a href="https://files.catbox.moe/yxuuaz.png">: </a>\n<blockquote>' + hArr[0] + hArr[1] + hArr[2] + hArr[3] + hArr[4] + hArr[5] + hArr[6] + hArr[7] + "</blockquote>", {
                    parse_mode: `HTML`,
                    reply_to_message_id: msg.message_id,
                });
            }

            else if (content.toLowerCase() === (pref + 'картинка').toLowerCase() || content.toLowerCase() == (pref + 'прикол').toLowerCase() || content.toLowerCase() == (pref + 'picture').toLowerCase()) {
                try {
                    let num = Math.floor(Math.random() * 15);
                    throwLog('Random num = ' + num);

                    try {
                        bot.sendPhoto(chatId, 'images/' + num + '.png', {
                            reply_to_message_id: msg.message_id
                        });
                    } catch (not_png) {
                        bot.sendPhoto(chatId, 'images/' + num + '.jpg', {
                            reply_to_message_id: msg.message_id
                        });
                    }
                } catch (error) {
                    bot.sendMessage(chatId, `чё-то не так ` + error.message, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'оск ') || content.startsWith(pref + 'оск')) {
                let count = content.slice((pref + 'оск ').length);
                let finalStr;

                const msgArr = [`Гомосятский`, `Лошпедский`, `Пидорский`, `Ниггерский`, `Далдовский`, `Сосущий`, 
                            `Гейский`, `Волосатый`, `Лохматый`, `Какашный`, `Обоссаный`, `Обосранный`, `Залупный`, 
                            `Ебланский`, `Дрочильный`];
                
                const msgArr2 = [`Бурятский мультик`, `сосатель`, `олух`, `гомосек`, `нигга`, `далдо`, `член`,
                            `лошпед`, `кака`, `свеня`, `свиник`, `анус`, `свин`, `петух`, `лохмач`, `залупа`, `клитор`,
                            `хуй`, `еблан`, `дрочила`];
    
                const msgArr3 = [`сосал`, `дрочил`, `лизал`, `нюхал`, `вылизал`, `разбил`, `сломал`, `взорвал`, `умер`, 
                            `зажёг`, `вынес`, `ободрал`, `обосрал`, `обоссал`, `отсосал`, `отлизал`, `отдрочил`, `залупил`, `залупался`];
    
                const msgArr4 = [`клитор`, `хуй`, `дадло`, `залупу`, `что-то`, `ничего`, `?`, `ниггу`, `себя`, `Капи`, 
                            `геев`, `бурят мультику`, `Абобу`, `свиника`, `[Секретно]`, `анус`, `петуха`, `свина`, `каку`, 
                            `лохмача`];

                let x = Math.floor(Math.random() * msgArr.length);
                let y = Math.floor(Math.random() * msgArr2.length);
                let z = Math.floor(Math.random() * msgArr3.length);
                let p = Math.floor(Math.random() * msgArr4.length);

                if (count <= 2 || count == 0) finalStr = msgArr[x] + ' ' + msgArr2[y];

                else if (count == 3) finalStr = msgArr[x] + ' ' + msgArr2[y] + ' ' + msgArr3[z];

                else if (count <= 4) finalStr = msgArr[x] + ' ' + msgArr2[y] + ' ' + msgArr3[z] + ' ' + msgArr4[p];

                else finalStr = msgArr[x] + ' ' + msgArr2[y];

                bot.sendMessage(chatId, finalStr, {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref + 'елшизм') {
                const reply = [`Пока нет информации`, `Информации нет`, `Спроси позже`, `Агентство ЕЛШИЗМ сегодня молчит...`];
                let lastNews = 'Заглушка...';
                let replyVar = Math.floor(Math.random() * 4);

                if (!has) {
                    bot.sendMessage(chatId, reply[replyVar] + '\n\nПоследняя новость:\n<blockquote>' + lastNews + '</blockquote>', {
                        parse_mode: `HTML`,
                        reply_to_message_id: msg.message_id
                    });
                } else {
                    bot.sendMessage(chatId, 'Да, ебались.\n\nПоследняя новость:\n<blockquote>' + lastNews + '</blockquote>', {
                            parse_mode: `HTML`,
                            reply_to_message_id: msg.message_id
                        }
                    );
                } // заглушка
            }

            else if (content.startsWith(pref + 'скажи ')) {
                const srcFile = content.slice((pref + 'скажи ').length);
                let del = false;

                try {
                    try {
                        await sayNnave(srcFile);
                    } catch (error) {
                        bot.sendMessage(chatId, 'Чё-то пошло не так ' + error.message, {
                            reply_to_message_id: msg.message_id
                        });
                    }
                    console.log(fileName);

                    await new Promise(ex => setTimeout(ex, 300));
                    if (fs.existsSync('sounds/' + fileName + '.mp3')) {
                        bot.sendVoice(chatId, 'sounds/' + fileName + '.mp3', {
                            caption: 'Провайдер: Google TTS',
                            reply_to_message_id: msg.message_id
                        });
                        throwLog('Временный файл ' + fileName + ' удалён');
                        try {
                            if (del)
                                fs.unlinkSync(`sounds/` + fileName + '.mp3');
                        } catch (cant_delete) { 
                            throwErr(cant_delete.message);
                        }
                    } else {
                        throwErr('Файла несуществует');
                        bot.sendMessage(chatId, 'Чё-то не так... Файла не существует.', {
                            reply_to_message_id: msg.message_id
                        });
                    }
                } catch (cant_tts) {
                    throwErr(cant_tts.message);
                }
            }

            else if (content.startsWith(pref + `ии `)) {
                const parts = content.slice((pref + 'ии ').length);
                const allowed = false;

                if (allowed) {
                    try {
                        const stdout = await execFileSync( // снова питоновские мосты
                            `python`,
                            [`-X`, `utf8`, `ai_bridge.py`, parts],
                            { maxBuffer: 1024 * 1024, encoding: `utf-8` }
                        ); // мрази не делают для жс нормльные библиотеки

                        const answer = stdout.trim() || `...`;
                    
                        bot.sendMessage(chatId, answer, {
                            parse_mode: `Markdown`,
                            reply_to_message_id: msg.message_id
                        });
                    } catch (cant_generate) {   
                        bot.sendMessage(chatId, 'Чё-то не так... ' + cant_generate.message);
                    }
                } else {
                    bot.sendMessage(chatId, `ИИ ВРЕМЕННО ОТКЛЮЧЕН!!!`, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'иифото')) {
                const allowed = false;
                if (!allowed) {
                    let sliceParts = content.slice((pref + 'иифото ').length);
                    let fileName = 'images/' + Math.floor(Math.random() * 1000000) + '.png';
                    let isNsfw = false;
                    let toTranslateSrc;
                    let parts;

                    toTranslateSrc = await translatte(sliceParts, {
                        to: 'en'
                    }); // чтобы нейронка лучше понимала промпт

                    let translatedParts = toTranslateSrc.text;

                    throwLog(translatedParts);

                    switch (translatedParts.toLowerCase()) { // банворды
                        case `penis`:
                        case `boobs`:
                        case `sex`:
                        case `naked`:
                        case `vagina`:
                        case `vagine`:
                            isNsfw = true;
                            break;
                    }

                    switch (translatedParts) { // банворды 2
                        case `child`:
                        case `child porn`:
                        case `cp`:
                        case `minor`:
                        case `teen`:
                        case `childs`:
                            sliceParts = `Большая и видная надпись \`IDI NAHUI\``;
                    }

                    if (isNsfw && !(chatId === -1002737828895)) {
                        bot.sendMessage(chatId, `NSFW Разрешён только тут - https://t.me/+y6H620kqS1phNGFi`, { // только в анархии
                            reply_to_message_id: msg.message_id
                        });
                    }

                    try {
                        parts = toTranslateSrc.text;

                        throwLog('Промпт: ' + parts + ' Оригинал: ' + sliceParts);

                        if (sliceParts.includes(`naked`) || sliceParts.includes(`big`) || sliceParts.includes(`boobs`) || sliceParts.includes(`penis`)) { // старая проверка
                            isNsfw = true;
                            if (chatId === -1002737828895) {
                                genPhoto(parts).then(img => {
                                    try {
                                        fs.writeFileSync(fileName, img);
                                    } catch (cant_write_file_ii) {
                                        throwErr(cant_write_file_ii.message);
                                    }
                                    try {
                                        let buffer = fs.readFileSync(fileName);

                                        if (!buffer.contains(`Google Media Processing Services`)) {
                                            bot.sendPhoto(chatId, fileName, {
                                                caption: 'Картинка Сгенерирована:',
                                                reply_to_message_id: msg.message_id
                                            });

                                            buffer = ``;
                                        } else {
                                            bot.sendMessage(chatId, `Чё-то не так... Рейт лимит`, {
                                                reply_to_message_id: msg.message_id
                                            });

                                            buffer = ``;
                                        }
                                    } catch (cant_send_file_ii) {
                                        throwErr(cant_send_file_ii.message);
                                        bot.sendMessage(chatId, `Чё-то не так... ` + cant_send_file_ii.message);
                                    }
                                });
                            } else if (isNsfw && !(chatId === -1002737828895)) {
                                bot.sendMessage(chatId, 'NSFW Разрешён только тут - https://t.me/+y6H620kqS1phNGFi', {
                                    reply_to_message_id: msg.message_id
                                });
                            }
                        }
                        if (!isNsfw) {
                            genPhoto(parts).then(img => {
                                try {
                                    fs.writeFileSync(fileName, img);
                                } catch (cant_write_file) {
                                    console.error(logError + cant_write_file.message);
                                }
                                try {
                                    bot.sendPhoto(chatId, fileName, {
                                        caption: 'Картинка Сгенерирована:',
                                        reply_to_message_id: msg.message_id
                                    });
                                } catch (cant_send_file) {
                                    console.error(logError + cant_send_file.message);
                                    bot.sendMessage(chatId, `Чё-то не так... ` + cant_send_file.message);
                                }
                            });
                        }
                    } catch (cant_generate_photo) {
                        console.error(logError + cant_generate_photo.message);
                        bot.sendMessage(chatId, 'Чё-то не так... ' + cant_generate_photo.message, {
                            reply_to_message_id: msg.message_id
                        });
                    }
                } else {
                    bot.sendMessage(chatId, `ГЕНЕРАЦИЯ КАРТИНОК ВРЕМЕННО ОТКЛЮЧЕНА!!!`, { // если дрочеров слишком много
                        reply_to_message_id: msg.message_id
                    });
                }
            }
                
            
            else if (content.startsWith(pref + 'вbase64 ') || content.startsWith(pref + 'ibase64 ')) {
                const parts = content.slice((pref + 'вbase64 ').length);
                let toB64;

                try {
                    toB64 = btoa(parts);
                } catch (cant_encode) {
                    throwErr(cant_encode.message);
                    try {
                        toB64 = Buffer.from(parts).toString(`base64`);
                    } catch (error) {
                        bot.sendMessage(chatId, 'Не удалось энкодировать в Base64. ' + error.message, {
                            reply_to_message_id: msg.message_id
                        });
                    }
                }

                if (/[абвгдеёжзийклмнАБВГДЕЁЖЗИЙКЛМН]/.test(parts)) {
                    try {
                        toB64 = toB64.replace(/[^A-Za-z0-9+/=]/g, ``);
                    } catch (error) {
                        console.error(logError + error.message);
                    }
                }

                bot.sendMessage(chatId, 'Энкодировано: ' + toB64 + '\nОригинал: ' + parts + '', {
                    parse_mode: `Markdown`,
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content.startsWith(pref + `изbase64 `) || content.startsWith(pref + 'frbase64 ')) {
                const parts = content.slice((pref + 'изbase64 ').length);
                let fromB64

                try {
                    fromB64 = atob(parts);
                } catch (cant_decode) {
                    console.error(logError + cant_decode.message + ', пробуем фаллбек...');
                    fromB64 = Buffer.from(parts, `base64`).toString(`utf8`);
                }

                bot.sendMessage(chatId, 'Декодировано: ' + fromB64 + '\nОригинал: ' + parts + '', {
                    parse_mode: `Markdown`,
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content.startsWith(pref + 'переведи ')) {
                const parts = content.slice((pref + 'переведи ').length).trim();
                const spaceIdx = parts.indexOf(' ');
                let translated;

                let toLang = parts.slice(0, spaceIdx).trim();

                let srcLang = parts.slice(spaceIdx + 1).trim();

                try {
                    translated = await translatte(srcLang, {
                        to: toLang,
                    });
                } catch (cant_fetch) {
                    bot.sendMessage(chatId, 'Чё-то не так... ' + cant_fetch.message, {
                        reply_to_message_id: msg.message_id
                    });
                }

                try {
                    if (translated.text.length < 1296) {
                        try {
                            bot.sendMessage(chatId, 'Переведено: ' + translated.text, {
                                reply_to_message_id: msg.message_id
                            });
                        } catch (cant_translate) {
                            bot.sendMessage(chatId, 'Чё-то не так... ' + cant_translate.message, {
                                reply_to_message_id: msg.message_id
                            });
                        
                            throwErr(cant_translate.message);
                        }
                    } else {
                        bot.sendMessage(chatId, 'Чё-то не так... Слишком большой текст для перевода.', {
                            reply_to_message_id: msg.message_id
                        });
                    }
                } catch (e) {
                    throwErr(e.message);
                }
            }

            else if (content.startsWith(pref + 'видео ')) {
                let parts = content.slice((pref + 'видео ').length);
                let videoName = Math.floor(Math.random() * 1000) + '.mp4';
                let downloaded = false;

                try {
                    await new Promise ((resolve, reject) => {
                            exec('python video_downloader.py ' + parts +  ' ' + videoName + ' ' + '\`18/best[height<=360]\`', // для жс нет нормальных довнлодеров видео 
                                { maxBuffer: 1024 * 1024 * 200 },
                                (err, stdout, stderr) => err ? reject(err) : resolve(stdout)
                            )
                        });
                    
                    await bot.sendVideo(chatId, videoName, {
                        caption: 'Видео загружено:',
                        reply_to_message_id: msg.message_id
                    });
                    
                    downloaded = true;
                } catch (cant_download) {
                    bot.sendMessage(chatId, 'Чё-то не так... ' + cant_download.message, {
                        reply_to_message_id: msg.message_id
                    });
                    console.error(logError + cant_download.message);
                }

                if (downloaded) {
                    try {
                        fs.unlinkSync(videoName);
                    } catch (cant_delete_2) {
                        console.error(logError + cant_delete_2.message);
                    }
                }
            }

            else if (content == pref + 'юзер') {
                const target = msg.from;

                if (msg.entities) {
                    const mention = msg.entities.find(entity => entity.type === 'mention');

                    if (mention) { // не работает
                        const uName = content.slice(mention.offset + 1, mention.offset + mention.length);
                        try {
                            const userInfo = await bot.getChatMember(chatId, uName);
                            target = userInfo.user;
                        } catch (cant_get_user) {
                            bot.sendMessage(chatId, 'Чё-то не так... ' + cant_get_user.message, {
                                reply_to_message_id: msg.message_id
                            });
                            return;
                        }
                    }
                }

                const userId = target.id || '<b>Не указан</b>';
                const userName = target.userName || '<b>Не указан</b>';
                const lastName = target.lastName || '<b>Не указана</b>';
                const firstName = target.firstName || '<b>Не указано</b>';
                const isBot = target.isBot || `<b>Нет</b>`;
                const premium = target.premium || `<b>Нет</b>`;
                const lang = target.language_code || `<b>Неизвестно</b>`;
                const pfpList = await bot.getUserProfilePhotos(userId, {
                    limit: 1
                });
            
                let pfp;

                if (pfpList.total_count === 0) pfp = 'images/no_pfp.png';

                else pfp = pfpList.photos[0][0].fileId;
                
                bot.sendPhoto(chatId, pfp, {
                    parse_mode: `HTML`,
                    caption: 'Информация о юзере:\n' + '<blockquote>' + 'Юзернейм — <a href=`t.me/' + userName + '`>@' + userName + '</a>\nID — <a href=`tg://openmessage?userId=' + userId + '`>' + userId + '</a>\n——————\nИмя — ' + firstName + '\nФамилия — ' + lastName + '\n——————\nБот — ' + isBot + '\nПремиум — ' + premium + '\nЯзык — ' + lang + '</blockquote>',
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref + 'приколдня') {
                const strArr = [`42 брат`, `52`, `свага`, `танец покойного`, `окак`, `67`, `Кролик с часиками`, `чурка в анархии фурри кидает`, `#попка`, `22`, `POZI`];

                bot.sendMessage(chatId, `ПРИКОЛ ДНЯ: ` + strArr[Math.floor(Math.random() * strArr.length)], {
                    reply_to_message_id: msg.message_id
                });
            }
            
            else if (content.startsWith(pref + 'математика ')) {
                const plus = content.slice((pref + 'математика ').length);
                let result;
                let i = 0; // колхоз

                try {
                    if (!(plus.includes(`process`) || plus.includes(`require`) || plus.includes(`import`) || plus.includes(`fs`) || plus.includes(`child_process`) || plus.includes(`exec`) || plus.includes(`execSync`) || plus.includes(`function`) || plus.includes(`constructor`) || plus.includes(`while`) || plus.includes(`for`) || plus.includes(`=>`) || plus.includes(`{`) || plus.includes(`}`) || plus.includes(`;`) || plus.includes(`repeat`))) { // защита от мразей которые пыюатся положить бота 
                        i = 1;
                        result = Function('return ' + plus)();
                    } else {
                        i = 0;
                        bot.sendMessage(chatId, 'Чё-то не так... Запрещённые символы', { 
                            reply_to_message_id: msg.message_id
                        });
                    }
                    if (i == 1) {
                        bot.sendMessage(chatId, 'Результат = ' + result, {
                            reply_to_message_id: msg.message_id
                        });
                    }
                } catch (cant_do) {
                    bot.sendMessage(chatId, 'Чё-то не так... ' + cant_do.message, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'инфо ') || content.startsWith(pref + 'проц ')) {
                let viewInfo;

                if (content.includes(`инфо`)) viewInfo = true;

                else if (content.includes(`проц`)) viewInfo = false;

                const info = content.slice((pref + 'инфо ').length);
                const num = Math.floor(Math.random() * 5);
                const proc = Math.floor(Math.random() * 100);
                const replyVar = [`Да`, `Возможно частично`, `Не знаю`, `Скорее нет`, `Нет`];

                if (viewInfo) {
                    bot.sendMessage(chatId, '<blockquote>«' + info + '»</blockquote>' + replyVar[num], {
                        parse_mode: `HTML`,
                        reply_to_message_id: msg.message_id
                    });
                } else {
                    bot.sendMessage(chatId, '<blockquote>«' + info + '»</blockquote>' + proc + '%', {
                        parse_mode: `HTML`,
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'qrterm ')) { // ради прикола
                const toQrTerm = content.slice((pref + 'qrterm ').length);

                const qr = qrterm.generate(toQrTerm, {
                    small: true
                }, (qr_string) => {
                    bot.sendMessage(chatId, qr_string, {
                        reply_to_message_id: msg.message_id
                    });
                });
            }

            else if (content.startsWith(pref + 'qrcode ')) {
                let buff;
                const toQrCode = content.slice((pref + 'qrcode ').length);

                try {
                    buff = await qrcode.toBuffer(toQrCode);
                    bot.sendPhoto(chatId, buff, {
                        reply_to_message_id: msg.message_id
                    });
                } catch (cant_qr) {
                    bot.sendMessage(chatId, 'Чё-то не так... ' + cant_qr.message);
                }
            }

            else if (content == pref + 'ocr') {
                try { // тоже не работает
                    const fileId = msg.photo[msg.photo.length - 1].fileId;
                    const file = await bot.getFile(fileId);
                    const fileName = Math.floor(Math.random() * 15);
                    const url = 'https://api.telegram.org/file/bot/' + tgToken + file.file_path;

                    const response = await fetch(url);
                    const buff = await response.buff();
                    const temp = 'temp_' + fileName + '.png';
                    fs.writeFileSync(temp, buff);

                    const {
                        data: {
                            text
                        }
                    } = await Tesseract.recognize(temp, `eng+rus`);

                    bot.sendMessage(chatId, `Текст на фото: ` + text, {
                        reply_to_message_id: msg.message_id
                    });
                    fs.unlinkSync(temp);
                } catch (cant_recognize) {
                    bot.sendMessage(chatId, 'Чё-то не так... ' + cant_recognize.message, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'execrun ') || content.startsWith(pref + 'execrun')) {
                let toFile = content.slice(('!execrun ').length);
                let fileName = 'scripts/' + Math.floor(Math.random() * 99999999999999999999999999) + '.js'; // бешеное число
                let lang = 'JS'; // только жс пока что

                if (msg.from.id === 6533950587 && msg.from.userName == 'Burnderd') { // для элиты
                    if (toFile.includes('import') && (!(msg.from.id === 6533950587) || toFile.includes('input'))) {
                        bot.sendMessage(chatId, 'Импорт или stdin не поддерживаются', {
                            reply_to_message_id: msg.message_id
                        });
                    } else {
                        try {
                            try {
                                fs.writeFileSync(fileName, toFile);
                            } catch (cant_write) {
                                console.error(logError + cant_write.message);

                                const char = 'qwertyuiopasdfghjklzxcvbnm';
                                fileName = '';

                                for (let i = 0; i < char.length; i++) {
                                    if (lang == 'JS') {
                                        fileName += char[Math.floor(Math.random() * 10)] + '.js';
                                    }
                                }
                            }
                            if (lang == 'JS') {
                                    exec('node ' + fileName, (stdout, stderr) => {
                                    try {
                                        if (stdout || stderr) {
                                            bot.sendMessage(chatId, `stderr: ` + stdout + `\nstdout: ` + stderr, { // stdout и stderr перепутаны
                                                reply_to_message_id: msg.message_id,
                                                encoding: `utf-8`
                                            });
                                        }
                                    } catch (cant_run) {
                                        bot.sendMessage(chatId, 'Чё-то не так... ' + cant_run.message, {
                                            reply_to_message_id: msg.message_id,
                                            encoding: `utf-8`
                                        });
                                    }
                                });
                            }
                        } catch (cant_exec) {
                            bot.sendMessage(chatId, 'Чё-то не так... ' + cant_exec.message);
                        }
                    }
                } else {
                    // ограниченная версия для лохов
                    let risk = [`import`, `require`, `=>`, `process`, `ip`, `remove`, `eval`, `constructor`, `function`, 
                        `system32`, `tgToken.txt`, `tgToken_b64.txt`, `cd /`, `fetch`, 'C:', `32`, `PS`, `PowerShell`, `CMD`, 
                        `Terminal`, `wsl`, `xterm`, `windir`, `win32`, `explorer`, `openUrl:`, `stdout`, `stdin`, `exec`];

                    let allowed = true;
                    let stdOut;

                    for (const word of risk) {
                        if (toFile.includes(word)) {
                            bot.sendMessage(chatId, word + ' Не поддерживается', {
                                reply_to_message_id: msg.message_id
                            });
                            allowed = false;
                            return;
                        }
                    }

                    if (allowed) {
                        try {
                            stdOut = vm.run(`(${toFile})`);
                            throwLog('Code to execute - ' + stdOut);
                            bot.sendMessage(chatId, stdOut, {
                                reply_to_message_id: msg.message_id
                            });
                        } catch (cant_exec) {
                            bot.sendMessage(chatId, `Чё-то не так... ` + cant_exec.message, {
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

                repeat = repeat.replaceAll(`@`, `[@]`)
                repeat = repeat.replaceAll(`ㅤ`, ``);
                // защита от рейдеров и пингов
                repeat = repeat.replaceAll(`<>`, `&lt;&gt;`)
                // чтобы не падало при парсинге
                
                if (repeat.length < 700) {
                    try {
                        if (repeat == '' || repeat == null) repeat = `Чё-то не так... Заебал писать пробелы`; // напоминание петуху о том что он петух
                        bot.sendMessage(chatId, repeat, {
                            reply_to_message_id: msg.message_id,
                            parse_mode: `HTML`
                        });
                    } catch (cant_send) {
                        throwErr(cant_send.message);
                        bot.sendMessage(chatId, `Чё-то не так... ` + cant_send.message, {
                            reply_to_message_id: message_id
                        })
                    } 
                } else {
                    bot.sendMessage(chatId, `Чё-то не так... Сообщение слишком длинное`, {
                        reply_to_message_id: msg.message_id
                    })
                }
            }

            else if (content.startsWith(pref + 'транслит ')) { // не работает
                let toSrc = content.slice((pref + 'транслит ').length);

                const charMap = {q:'й', w:'ц', e:'у', r:'к', t:'е', y:'н', u:'г', i:'ш', o:'щ', p:'з', '[':'х', ']':'ъ', a:'ф', s:'ы', d:'в', f:'а', g:'п', h:'р', j:'о', k:'л', l:'д', z:'я'};

                try {
                    toSrc = toSrc.replaceAll(/[a-z]/, c => charMap[c] || '\'?\'', {
                        encoding: `utf-8`
                    });
                    
                    toSrc = toSrc.replaceAll(/[A-Z]/, c => charMap[c] || '\'?\'', {
                        encoding: `utf-8`
                    });

                    bot.sendMessage(chatId, 'Нормальная версия: ' + toSrc, {
                        reply_to_message_id: msg.message_id
                    });
                } catch (cant_translit) {
                    bot.sendMessage(chatId, 'Чё-то не так... ' + cant_translit.message, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content.startsWith(pref + 'длинна ')) {
                const msgLength = content.slice((pref + 'длинна ').length).length;

                bot.sendMessage(chatId, 'Длинна текста — ' + msgLength + ' символов', {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref + 'офвпышывпш' || content == pref + 'владизболгарии' || content == pref + 'владизбеларуси' || content == pref + 'владизнорильска' || content == pref + 'владотбългария') {
                bot.sendMessage(chatId, ' VLAD VLAD VLAD<a href=`https://files.catbox.moe/apr2h1.mp4`>: </a>', {
                    reply_to_message_id: msg.message_id,
                    parse_mode: `HTML`
                });
            }

            else if (content.startsWith(pref + 'реддит ')) {
                let search = content.slice((pref + 'поискфото ').length);
                search = search.replace(` `, `+`);

                const response = await (await fetch(`https://www.reddit.com/search.json?q=` + search + `&restrict_sr=off&sort=relevance&t=all`)).json();
                try {
                    bot.sendMessage(chatId, response.data.children[0].data.url, {
                        parse_mode: `HTML`,
                        reply_to_message_id: msg.message_id
                    });
                } catch (no_results) {
                    bot.sendMessage(chatId, `По запросу '${search}' не найдено результатов.`, {
                        parse_mode: `HTML`,
                        reply_to_message_id: msg.message_id
                    })
                }
            }

            else if (content == pref + 'хуйня') { // надо
                bot.sendMessage(chatId, 'Сам хуйня', {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref + 'мазута') {
                const num = Math.floor(Math.random() * 3);

                bot.sendVideo(chatId, 'images/serov/' + num + '.mp4', {
                    reply_to_message_id: msg.message_id
                }); // мазута серов
            }

            // https://cdn.discordapp.com/attachments/1454075217012981954/1462023276593414142/VID_20251214_000401_805.mp4?ex=696caecc&is=696b5d4c&hm=1f3f5f3e1f3e4e1e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff&

            else if (content.startsWith(pref + 'донат ')) { // заглушка
                const blacklist = 1;
                
                if (msg.from.id != blacklist) {
                    const text = content.slice((pref + 'донат ').length);
                    let user_name;
                    if ((msg.from.firstName).length < 15) {
                        user_name = msg.from.firstName;
                    } else {
                        user_name = msg.from.userName;
                    }

                    try {
                        sayNnave(`${user_name} сказал - ${text}`);
                        try {
                            fs.writeFileSync(`donate.txt`, text);
                        } catch (cant_write) {
                            throwErr(cant_write.message)
                        } finally {
                            spawn(`ffplay`, [`-nodisp`, `-autoexit`, `sounds/` + fileName + `.mp3`], {
                                detached: true,
                                stdio: `ignore`
                            }).unref();
                        }
                        bot.sendMessage(chatId, `Донат отправлен`, {
                            reply_to_message_id: msg.message_id
                        });
                    } catch (cant_save_tts) {
                        throwErr(cant_save_tts.message);
                    }
                } else {
                    bot.sendMessage(chatId, `Ты забанен малышара канализация`, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            // новое

            else if (content.startsWith(pref + 'анекдот')) {
                const response = await (await fetch(`https://www.anekdot.ru/random/anekdot/`)).text();
                const $ = cheerio.load(response);
                const joke = $('.text').first().text().trim();
                bot.sendMessage(chatId, 'АНЕКДОТ: ' + joke, {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content.startsWith(pref + 'реверс ')) {
                const parts = content.slice((pref + 'реверс ').length);
                const reversed = parts.split('').reverse().join('');

                bot.sendMessage(chatId, 'Реверс: ' + reversed, {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref + 'айди') { // фури айди
                const id = msg.from.id;

                bot.sendMessage(chatId, `Твой ID: <a href=\`tg://openmessage?userId=${id}\`>` + id + `</a>`, {
                    reply_to_message_id: msg.message_id,
                    parse_mode: `HTML`
                });
            }
            // без апи
            else if (content.startsWith(pref + 'прогноз ')) {
                try {
                    const city = content.slice((pref + 'прогноз ').length);
                    const weatherResponse = await (await fetch(`https://wttr.in/${city}?format=3`)).text();
                    bot.sendMessage(chatId, `Погода в ` + weatherResponse, {
                        reply_to_message_id: msg.message_id
                    });
                } catch (e) {
                    throwErr(e.message);
                }
            }

            else if (content.startsWith(pref + 'duckduckgo')) { // поиск в утке
                let query = content.slice((pref + 'duckduckgo').length).trim();
                const response = await (await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&skip_disambig=1`)).json();
                if (response.AbstractText) {
                    bot.sendMessage(chatId, `Результат поиска:\n\n<blockquote>${response.AbstractText}</blockquote>`, {
                        reply_to_message_id: msg.message_id,
                        parse_mode: `HTML`
                    });
                } else {
                    bot.sendMessage(chatId, `По запросу '${query}' не найдено результатов.`, {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content == pref + 'инфо') {
                bot.sendMessage(chatId, `<b>ABOBA</b> Bot − Ремейк легендарного бота из 2021 в Телеграме.\n@tg_aboba_bot\n\nБот:<blockquote>⚙️Написан на — JavaScript\n💫Создатель — <a href=\`t.me/burnderd\`>@Burnderd</a>\n📈Статус — работает</blockquote>\nБиблиотеки:<blockquote>💭Перевод — Translatte\n👁️OCR — Tesseract.js\n🎙️TTS — gTTS\n🎥Загрузка видео — ytdl</blockquote>`, {
                    parse_mode: `HTML`,
                    reply_to_message_id: msg.message_id
                });
            }
            // import { fetch } from `undici`;

            // /новое

            else if (content == pref + 'статус') {
                bot.sendMessage(chatId, 'Работает', {
                    reply_to_message_id: msg.message_id
                });
            }

            else if (content == pref || content == '/start' || content == '@tg_aboba_bot') {
                bot.sendMessage(chatId, 'Список команд: <pre>!хелп</pre>', {
                    parse_mode: `HTML`,
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
                    const prek = [`ирис дурак`, `ирис чмо`, `ирис педик`, `ирис говноед`, `ирис шлюха`, `ирис лох`, `ирис отстой`, `ирис ублюдок`, `ирис козёл`, `ирис мудак`, `ирис сасёт`, `ирис слабак`];
                    const num = Math.floor(Math.random() * prek.length);

                    bot.sendMessage(chatId, 'СМЕШНОЙ АНЕКДОТ ПРО ИРИСА: ' + prek[num], {
                        reply_to_message_id: msg.message_id
                    });
                }
            }

            else if (content == `пиу` || content == `пинг`) {
                bot.sendMessage(chatId, `ИРИС ШАЛАВА`);
            }
        } else {
            bot.sendMessage('Бот в разработке...'); // осталось с времён альфы
        }
        
        try {
            let b64Log = btoa(content); // шифрует сообщения чтобы не подглядывать
            currentDate = new Date().toLocaleString();
            currentDate = currentDate.replace(`GMT+0300 (Москва, стандартное время)`, ``); // колхоз для лога но работает
            // console.log('[' + currentDate + '] ' + logInfo + 'Message in ' + chatId + ' (' + chatName + ')' + ' - \'' + b64Log + '\'');
            throwLog('Message in ' + chatId + ' (' + chatName + ')' + ' - \'' + b64Log + '\'');
        } catch (error) {
            throwErr(error.message);
        }
    });

    throwLog('Бот запущен...');
}

main();
