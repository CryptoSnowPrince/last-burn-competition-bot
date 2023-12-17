import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv'

import * as core from './core.js';
import * as constant from './constant.js';

dotenv.config()

const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: true })

let gParams = {
  minimumBurnAmount: 1000,
  minimumBurnIncreaseAmount: 500,
  countdownPeriod: 86400,
  prizeAmount: 500,
  burnAddress: '0x0000000000000000000000000000000000000000',
  tokenAddress: '0xe98e93Fde3A05Bc703f307Ee63be9507d1f48554',
  buyTokenLink: "https://app.uniswap.org/swap",
  tokenBurnChannel: 'https://t.me/CryptoSnowPrince',
  videoURL: './video.mp4',
  setting_state: constant.SETTING_STATE_IDLE
}

const BOT_COMMAND_HELP = '/help' // help
const BOT_COMMAND_START = '/start' // start bot
const BOT_COMMAND_SETTING = '/setting' // setting bot
const BOT_COMMAND_START_COMPETITION = '/startcompetition' // start competition
const BOT_COMMAND_END_COMPETITION = '/stopcompetition' // stop competition
const BOT_COMMAND_SET_ADMIN = '/setadmin' // set admin

bot.on('message', async (message) => {
  try {
    console.log('message')
    // console.log(message)
    const sessionId = core.getSessionId(message)
    const session = core.initSession(message)

    switch (global.setting_state) {
      case global.SETTING_STATE_WAIT_MINIMUM_BURN_AMOUNT:
        return;
      case global.SETTING_STATE_WAIT_MINIMUM_BURN_INCREASE_AMOUNT:
        return;
      case global.SETTING_STATE_WAIT_COUNTDOWN_PERIOD:
        return;
      case global.SETTING_STATE_WAIT_PRIZE_AMOUNT:
        return;
      case global.SETTING_STATE_WAIT_BURN_ADDRESS:
        return;
      case global.SETTING_STATE_WAIT_TOKEN_ADDRESS:
        return;
      case global.SETTING_STATE_WAIT_BUY_TOKEN_LINK:
        return;
      case global.SETTING_STATE_WAIT_TOKEN_BURN_CHANNEL:
        return;
      case global.SETTING_STATE_WAIT_VIDEO_URL:
        return;
      case global.SETTING_STATE_IDLE:
      default:
        break;
    }

    if (message.entities) {
      const commandEntity = message.entities.find(entity => entity.type === 'bot_command');
      if (commandEntity) {
        // Extract the bot command
        const command = message.text.substring(commandEntity.offset, commandEntity.offset + commandEntity.length);

        switch (command) {
          case BOT_COMMAND_HELP:
          case BOT_COMMAND_START:
            await bot.sendMessage(session.chatid, core.getWelcomeMessage());
            return;
          case BOT_COMMAND_SETTING:
            const menu = core.json_settingsMenu(sessionId)

            const keyboard = {
              inline_keyboard: menu.options,
              resize_keyboard: true,
              one_time_keyboard: true,
              force_reply: false
            };

            await bot.sendMessage(session.chatid, menu.title, { reply_markup: keyboard, disable_web_page_preview: true, parse_mode: 'HTML' });
            return;
          case BOT_COMMAND_START_COMPETITION:
            return;
          case BOT_COMMAND_END_COMPETITION:
            return;
          case BOT_COMMAND_SET_ADMIN:
            if (session.admin) {
              await bot.sendMessage(session.chatid, 'admin')
            } else {
              await bot.sendMessage(session.chatid, 'no admin')
            }
            return;
        }
      }
    }

    await bot.sendMessage(session.chatid, core.getUnknownMessage())
    await bot.sendMessage(session.chatid, core.getWelcomeMessage())
  } catch (error) {
    console.log('message: ', error)
  }
})
