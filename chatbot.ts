import TelegramBot = require('node-telegram-bot-api')
import dotenv = require('dotenv')
import Twitter = require('twitter')
import cron = require('cron')

dotenv.config()

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY || '',
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET || '',
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY || '',
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
})

const generateNewUsername = (num: number, done: boolean) => `Aiden 🧘🏻‍♂️ ${done ? num + 1 : num}/7`

const generateNewLocation = (location: string, done: boolean) => {
  const day = new Date().getDay()
  const startChar = location.indexOf('⚪️⚪️⚪️⚪️⚪️⚪️⚪️')
  const newLocation =
    location.substring(0, startChar + day * 2) + (done ? '🟢' : '⚪️') + location.substring(startChar + day * 2 + 1)
  return newLocation
}

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const getUserProfileInfo = () => {
  return new Promise<Twitter.ResponseData>((resolve, reject) => {
    client.get('https://api.twitter.com/1.1/account/verify_credentials.json', {}, function (err, data) {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

interface updateProfileProps {
  name?: string
  location?: string
}

const updateProfile = (profile: updateProfileProps) => {
  return new Promise((resolve, reject) => {
    client.post('https://api.twitter.com/1.1/account/update_profile.json', profile, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const changeUsername = async () => {
  // Get the current username and location
  const { name, location } = await getUserProfileInfo()
  const endOfWeekCharPos = name.indexOf('/7')

  // Extract the current habit count
  const habitCount = parseInt(name.substring(endOfWeekCharPos - 1, endOfWeekCharPos))

  if (isNaN(habitCount)) return

  // Generate the new username and location strings by increasing the count
  const newUsername = generateNewUsername(habitCount, true)
  const newLocation = generateNewLocation(location, true)
  updateProfile({ name: newUsername, location: newLocation })
}

const initTelegramBot = (options: TelegramBot.ConstructorOptions = {}) => {
  const token = process.env.TELEGRAM_TOKEN
  if (!token) return
  const bot = new TelegramBot(token, { polling: false, ...options })
  return bot
}

const initDailyCheck = () => {
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!chatId || !bot) return

  bot.sendMessage(chatId, 'Did you meditate today?', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Yes', callback_data: 'true' },
          { text: 'No', callback_data: 'false' },
        ],
      ],
    },
  })

  bot.on('callback_query', callbackQuery => {
    const { id, data, message } = callbackQuery

    if (!message) return

    const message_id = message.message_id
    const chat_id = message.chat.id
    const done = data === 'true'
    const responseMsg = done ? '🌞 Well done' : '🍃  Tomorrow is another day'
    const responseEmoji = done ? '🌞' : '🍃'

    // Response with an emoji
    bot.answerCallbackQuery(id, { text: responseEmoji })

    // Remove the inline keyboard
    bot.editMessageReplyMarkup({ inline_keyboard: [] }, { message_id, chat_id })

    // Edit the message
    bot.editMessageText(responseMsg, { message_id, chat_id })

    // Change username
    if (done) {
      changeUsername()
    }
  })
}

const bot = initTelegramBot({ polling: true })

console.log('🧙‍♂️ Bot started at ', new Date().toLocaleString('en-US', { timeZone: timezone }))

// https://crontab.guru/
// (Should) Run every day at 12:00 AM
// const job = new cron.CronJob('0 12 * * *', initDailyCheck)
const job = new cron.CronJob('* * * * *', initDailyCheck)
job.start()
