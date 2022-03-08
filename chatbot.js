"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var TelegramBot = require("node-telegram-bot-api");
var dotenv = require("dotenv");
var Twitter = require("twitter");
var cron = require("cron");
dotenv.config();
var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY || '',
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET || '',
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY || '',
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
});
var generateNewUsername = function (num, done) { return "Aiden \uD83E\uDDD8\uD83C\uDFFB\u200D\u2642\uFE0F ".concat(done ? num + 1 : num, "/7"); };
var generateNewLocation = function (location, done) {
    var day = new Date().getDay();
    var startChar = location.indexOf('⚪️⚪️⚪️⚪️⚪️⚪️⚪️');
    var newLocation = location.substring(0, startChar + day * 2) + (done ? '🟢' : '⚪️') + location.substring(startChar + day * 2 + 1);
    return newLocation;
};
var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
var getUserProfileInfo = function () {
    return new Promise(function (resolve, reject) {
        client.get('https://api.twitter.com/1.1/account/verify_credentials.json', {}, function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
};
var updateProfile = function (profile) {
    return new Promise(function (resolve, reject) {
        client.post('https://api.twitter.com/1.1/account/update_profile.json', profile, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
};
var changeUsername = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, location, endOfWeekCharPos, habitCount, newUsername, newLocation;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4, getUserProfileInfo()];
            case 1:
                _a = _b.sent(), name = _a.name, location = _a.location;
                endOfWeekCharPos = name.indexOf('/7');
                habitCount = parseInt(name.substring(endOfWeekCharPos - 1, endOfWeekCharPos));
                if (isNaN(habitCount))
                    return [2];
                newUsername = generateNewUsername(habitCount, true);
                newLocation = generateNewLocation(location, true);
                updateProfile({ name: newUsername, location: newLocation });
                return [2];
        }
    });
}); };
var initTelegramBot = function (options) {
    if (options === void 0) { options = {}; }
    var token = process.env.TELEGRAM_TOKEN;
    if (!token)
        return;
    var bot = new TelegramBot(token, __assign({ polling: false }, options));
    return bot;
};
var initDailyCheck = function () {
    var chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId || !bot)
        return;
    bot.sendMessage(chatId, 'Did you meditate today?', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Yes', callback_data: 'true' },
                    { text: 'No', callback_data: 'false' },
                ],
            ]
        }
    });
    bot.on('callback_query', function (callbackQuery) {
        var id = callbackQuery.id, data = callbackQuery.data, message = callbackQuery.message;
        if (!message)
            return;
        var message_id = message.message_id;
        var chat_id = message.chat.id;
        var done = data === 'true';
        var responseMsg = done ? '🌞 Well done' : '🍃  Tomorrow is another day';
        var responseEmoji = done ? '🌞' : '🍃';
        bot.answerCallbackQuery(id, { text: responseEmoji });
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, { message_id: message_id, chat_id: chat_id });
        bot.editMessageText(responseMsg, { message_id: message_id, chat_id: chat_id });
        if (done) {
            changeUsername();
        }
    });
};
var bot = initTelegramBot({ polling: true });
console.log('🧙‍♂️ Bot started at ', new Date().toLocaleString('en-US', { timeZone: timezone }));
var job = new cron.CronJob('* 12 * * *', initDailyCheck);
job.start();
//# sourceMappingURL=chatbot.js.map