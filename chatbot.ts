import TelegramBot = require("node-telegram-bot-api");
import dotenv = require("dotenv");
import Twitter = require("twitter");
import cron = require("cron");

dotenv.config();

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY || "",
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET || "",
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY || "",
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
});

const generateNewUsername = (num: number, done: boolean) =>
  `Aiden 🧘🏻‍♂️ ${done ? num + 1 : num}/7`;

const generateNewLocation = (location: string, done: boolean) => {
  const day = new Date().getDay();
  const startChar = location.indexOf("⚪️⚪️⚪️⚪️⚪️⚪️⚪️");
  const newLocation =
    location.substring(0, startChar + day * 2) +
    (done ? "🟢" : "⚪️") +
    location.substring(startChar + day * 2 + 1);
  return newLocation;
};

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const getCurrentCredentials = () => {
  return new Promise<Twitter.ResponseData>((resolve, reject) => {
    client.get(
      "https://api.twitter.com/1.1/account/verify_credentials.json",
      {},
      function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
};

interface updateProfileProps {
  name?: string;
  location?: string;
}

const updateProfile = (profile: updateProfileProps) => {
  return new Promise((resolve, reject) => {
    client.post(
      "https://api.twitter.com/1.1/account/update_profile.json",
      profile,
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};

const changeUsername = async () => {
  const credentials = await getCurrentCredentials();
  const { name, location } = credentials;
  const endOfWeekCharPos = name.indexOf("/7");
  const currentNum = parseInt(
    name.substring(endOfWeekCharPos - 1, endOfWeekCharPos)
  );
  const newUsername = generateNewUsername(currentNum, true);
  const newLocation = generateNewLocation(location, true);
  updateProfile({ name: newUsername, location: newLocation });
};

// replace the value below with the Telegram token you receive from @BotFather

const initTelegramBot = (options: TelegramBot.ConstructorOptions = {}) => {
  const token = process.env.TELEGRAM_TOKEN;
  if (!token) return;
  const bot = new TelegramBot(token, { polling: false, ...options });
  return bot;
};

const sendMessage = () => {
  const bot = initTelegramBot({ polling: true });
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId || !bot) return;

  bot.onText(/\/done/, (msg) => {
    const options: TelegramBot.SendMessageOptions = {
      reply_to_message_id: msg.message_id,
      reply_markup: {
        keyboard: [[{ text: "🟢" }], [{ text: "🔴" }]],
        one_time_keyboard: true,
      },
    };

    bot.sendMessage(msg.chat.id, "Do you love me?", options);
  });
};

const job = new cron.CronJob("* * * * *", sendMessage, null, true, timezone);

job.start();
