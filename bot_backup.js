import Web3 from 'web3';
import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv'

import * as privateBot from './bot_private.js';

dotenv.config()

const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: true })

const getWelcomeMessage = () => {

  const message = `Welcome to LastBurnCompetitionBot! \n\nHow it works: \n\n/help - welcome message and help\n/start - welcome message and help\n/setting - setting competition by admin\n/startcomp - start competition by admin\n/stopcomp - stop competition by admin\n\nMetabestech`

  return message;
}

bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, getWelcomeMessage())
});

bot.onText(/\/help/, async (msg) => {
  await bot.sendMessage(msg.chat.id, getWelcomeMessage())
});

bot.onText(/\/setting/, async (msg) => {
  const chatId = msg.chat.id;
  console.log(msg)
  //   if (chatId != OWNER_ID) {
  //       bot.sendMessage(chatId, "Sorry, you have no permission for this bot!");

  //       return;
  //   }

  const menu = json_settingsMenu(chatId)

  const keyboard = {
    inline_keyboard: menu.options,
    resize_keyboard: true,
    one_time_keyboard: true,
    force_reply: true
  };

  await bot.sendMessage(chatId, menu.title, { reply_markup: keyboard, disable_web_page_preview: true, parse_mode: 'HTML' });
})

export const sessions = new Map();
export const stateMap = new Map();

const media = './video.mp4';
let OWNER_ID = 5353980832; //owner ID;
export const GROUP_ID = -4053235865; //TG

export const COMMAND_START = 'start';
export const COMMAND_TEST = 'test';

const OPTION_MAIN = 0

const OPTION_SETTINGS_MINIMUM_BURN_AMOUNT = 42;
const OPTION_SETTINGS_MINIMUM_BURN_INCREASE_AMOUNT = 10;
const OPTION_SETTINGS_BURN_ADDRESS = 11;
const OPTION_SETTINGS_TOKEN_ADDRESS = 12;
const OPTION_SETTINGS_COUNTDOWN_PERIOD = 13;
const OPTION_SETTINGS_PRIZE_AMOUNT = 14;

const OPTION_SETTINGS_BUY_TOKEN_LINK = 20;
const OPTION_SETTINGS_TOKEN_BURN_CHANNEL = 21;

const OPTION_SETTINGS_VIDEO_URL = 30;

/*-------- States ---------*/
export const STATE_IDLE = 0;

export const STATE_WAIT_SET_MINIMUM_BURN_AMOUNT = 40;
export const STATE_WAIT_SET_MINIMUM_BURN_INCREASE_AMOUNT = 41;
export const STATE_WAIT_SET_COUNTDOWN_PERIOD = 10;
export const STATE_WAIT_SET_PRIZE_AMOUNT = 11;
export const STATE_WAIT_SET_BURN_ADDRESS = 12;
export const STATE_WAIT_SET_TOKEN_ADDRESS = 20;
export const STATE_WAIT_SET_BUY_TOKEN_LINK = 21;
export const STATE_WAIT_SET_TOKEN_BURN_CHANNEL = 22;
export const STATE_WAIT_SET_VIDEO_URL = 30;

export const STATE_WAIT_SET_WALLETS_PRIVATEKEY = 50;

/*-------- Basic Functions ---------*/
export const stateMap_set = (chatid, state, data = {}) => {
  stateMap.set(chatid, { state, data })
}

export const stateMap_get = (chatid) => {
  return stateMap.get(chatid)
}

export const stateMap_remove = (chatid) => {
  stateMap.delete(chatid)
}

export const stateMap_clear = () => {
  stateMap.clear()
}

const json_buttonItem = (key, cmd, text) => {
  return {
    text: text,
    callback_data: JSON.stringify({ k: key, c: cmd }),
  }
}

export const createSession = (chatid, username, type) => {
  let session = {
    chatid: chatid,
    username: username,
    type: type
  }

  setDefaultSettings(session)

  sessions.set(session.chatid, session)
  showSessionLog(session)

  return session;
}

export const setDefaultSettings = (session) => {

  session.wallet = null
  session.account = null
  session.pkey = null
  session.slippage = 20 // 20%
  session.deadline = 1800 // 30 min
  session.fee = 0

  session.minimumBurnAmount = 1000;
  session.minimumBurnIncreaseAmount = 500;
  session.countdownPeriod = 86400;
  session.prizeAmount = 500;
  session.burnAddress = ZERO_ADDRESS;
  session.tokenAddress = TOKEN_ADDRESS;
  session.buyTokenLink = "https://app.uniswap.org/swap";
  session.tokenBurnChannel = 'https://t.me/ethsnowballCN';
  session.videoURL = media;

}

export function showSessionLog(session) {

  if (session.type === 'private') {
    console.log(`@${session.username} user${session.wallet ? ' joined' : '\'s session has been created (' + session.chatid + ')'}`)
  } else if (session.type === 'group') {
    console.log(`@${session.username} group${session.wallet ? ' joined' : '\'s session has been created (' + session.chatid + ')'}`)
  } else if (session.type === 'channel') {
    console.log(`@${session.username} channel${session.wallet ? ' joined' : '\'s session has been created'}`)
  }
}


export const json_mainMenu = (sessionId) => {
  const json = [
    [
      json_buttonItem(sessionId, OPTION_SETTINGS_MINIMUM_BURN_INCREASE_AMOUNT, 'BURN ADDRESS')
    ],
    [
      json_buttonItem(sessionId, OPTION_SETTINGS_COUNTDOWN_PERIOD, 'BUY $TOKEN')
    ],
    [
      json_buttonItem(sessionId, OPTION_SETTINGS_PRIZE_AMOUNT, 'TOKEN BURN')
    ]
  ];

  return { title: '', options: json };
}

export const json_settingsMenu = (sessionId) => {

  const session = sessions.get(sessionId)
  if (!session) {
    return null
  }

  const json = [
    [
      json_buttonItem(sessionId, OPTION_SETTINGS_MINIMUM_BURN_AMOUNT, 'Minimum Burn Amount'),
      json_buttonItem(sessionId, OPTION_SETTINGS_MINIMUM_BURN_INCREASE_AMOUNT, 'Minimum Burn Increase Amount')
    ],
    [
      json_buttonItem(sessionId, OPTION_SETTINGS_COUNTDOWN_PERIOD, 'Countdown Period'),
      json_buttonItem(sessionId, OPTION_SETTINGS_PRIZE_AMOUNT, 'Prize Amount')
    ],
    [
      json_buttonItem(sessionId, OPTION_SETTINGS_BURN_ADDRESS, 'Burn Address'),
      json_buttonItem(sessionId, OPTION_SETTINGS_TOKEN_ADDRESS, 'Token Address')
    ],
    [
      json_buttonItem(sessionId, OPTION_SETTINGS_BUY_TOKEN_LINK, 'Buy Token Link'),
      json_buttonItem(sessionId, OPTION_SETTINGS_TOKEN_BURN_CHANNEL, 'Token Burn Channel'),
    ],
    // [
    //     json_buttonItem(sessionId, OPTION_SETTINGS_VIDEO_URL, 'Video URL')
    // ],
    [
      json_buttonItem(sessionId, OPTION_MAIN, '↩️ Return'),
    ],
  ]

  return { title: '⬇️ Settings', options: json };
}

const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
];
const TOKEN_ADDRESS = '0xe98e93Fde3A05Bc703f307Ee63be9507d1f48554';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const CHAIN_ID = 97;
const CHAIN_RPC = "https://endpoints.omniatech.io/v1/bsc/testnet/public";
const SCAN_LINK = "https://bscscan.com/address/";

var web3 = new Web3(CHAIN_RPC);
const tokenContract = new web3.eth.Contract(CONTRACT_ABI, TOKEN_ADDRESS);



const sleep = ms => new Promise(r => setTimeout(r, ms))
// bot.onText(/\/mau/, (msg) => {
//   chatId = msg.chat.id;
//   console.log("ChatId", chatId);
// });


var countdown = 0;
var msgType = 1;
var totalBurnAmount = 0;
var burners = [];

var scanBlockNumber = 0;
var maxBlockNumber = 0;
var TransferTemp = {};

const compareObjects = (A, B) => {
  if (Object.keys(A).length === 0) return false;
  if (Object.keys(A).length !== Object.keys(B).length) return false;
  else {
    if (JSON.stringify(A) !== JSON.stringify(B)) return false;
  }
  console.log("----------------- same event happend ----------------");
  return true;
}

const Transfer_monitor_on_bsc = async (blockNumber, toBlockNumber) => {

  try {
    tokenContract.getPastEvents("Transfer", { fromBlock: blockNumber, toBlock: toBlockNumber }).then(async (transferEventslist) => {
      // console.log("transferEventslist: ", transferEventslist);
      for (let idx1 = 0; idx1 < transferEventslist.length; idx1++) {
        let data = transferEventslist[idx1];
        let objTemp = data.returnValues;
        // console.log("data.returnValues  ===> ", data.returnValues);
        objTemp.transactionHash = data.transactionHash;

        // if (compareObjects(TransferTemp, objTemp) === false) {
        if (objTemp.transactionHash !== TransferTemp?.transactionHash) {
          TransferTemp = objTemp;
          // console.log("TransferTemp  ===> ", TransferTemp);
          const from = TransferTemp.from;
          const to = TransferTemp.to;
          const value = Web3.utils.fromWei(TransferTemp.value.toString(), 'ether');
          const txHash = TransferTemp.transactionHash;
          const tokenDecimals = 18;
          // console.log("Sender: ", from, value);
          totalBurnAmount += Number(value);

          const session = sessions.get(GROUP_ID);
          if (value > session.minimumBurnAmount) {
            countdown = Math.floor(Date.now() / 1000) + session.countdownPeriod - 1;
            burners.push(from);

            msgType = 3;
            await ExecuteFunction(from, txHash);
          }
        }

      }
    })
      .catch((error) => {
        console.log(error);
        return;
      })
  } catch (error) {
    console.log("Something went wrong 1: " + error.message)
  }
}

const getBlockNumber_on_bsc = async () => {
  const session = sessions.get(GROUP_ID);

  let diff = countdown - Math.floor(Date.now() / 1000);
  if (diff < 0) {
    msgType = 4;
    await ExecuteFunction();
  } else if (diff % session.countdownPeriod < 3) { //burn amount increase
    msgType = 2;
    await ExecuteFunction();
  }

  try {
    const number = await web3.eth.getBlockNumber();

    if (maxBlockNumber < number) {
      maxBlockNumber = number;
      if (scanBlockNumber == 0) {
        scanBlockNumber = number;
      }
      console.log("max block number", number);
    }
  } catch (error) {
    console.log("get bsc_blocknumber error: ", error);
  };

  setTimeout(getBlockNumber_on_bsc, 10000);
}

const getData_on_bsc = async () => {
  let curMaxBlock = maxBlockNumber;
  if (scanBlockNumber != 0 && scanBlockNumber < curMaxBlock) {
    console.log('scanFrom : ', scanBlockNumber, " scanTo : ", curMaxBlock);
    try {
      // await Transfer_monitor_on_bsc(scanBlockNumber, curMaxBlock);
      await Transfer_monitor_on_bsc(33930340, 33930350);
      scanBlockNumber = curMaxBlock + 1;
    } catch (e) {
    }
  }
  setTimeout(getData_on_bsc, 10000);
}

bot.onText(/\/startcompetition /, async (msg) => {
  let chatId = msg.chat.id;
  bot.sendMessage(chatId, getWelcomeMessage())
  if (chatId != GROUP_ID) {
    bot.sendMessage(chatId, "Sorry, this bot does not work in this group!");

    return;
  }

  let session = sessions.get(chatId);
  if (!session) {
    let userName = msg?.chat?.username;
    session = createSession(chatId, userName, 'private');
  }
  console.log("start session: ", session);

  countdown = Math.floor(Date.now() / 1000) + session.countdownPeriod - 1;
  msgType = 1;//start
  await ExecuteFunction();
  await getBlockNumber_on_bsc();
  await getData_on_bsc();
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

const ExecuteFunction = async (sender = '', tx = '') => {
  let msg;
  try {
    const session = sessions.get(GROUP_ID);

    const total = countdown - Math.floor(Date.now() / 1000);
    const seconds = Math.floor((total) % 60);
    const minutes = Math.floor((total / 60) % 60);
    const hours = Math.floor((total / (60 * 60)) % 24);

    const period = session.countdownPeriod;
    const pSeconds = Math.floor((period) % 60);
    const pMinutes = Math.floor((period / 60) % 60);
    const pHours = Math.floor((period / (60 * 60)) % 24);
    const pDays = Math.floor((period / (60 * 60 * 24)));

    if (msgType == 1) { // New Competition
      msg = `📣$TOKEN LAST BURN COMPETITION STARTED` + "\n\n";

      msg += "🔥CURRENT MIN BURN: " + session.minimumBurnAmount + " $TOKENS" + "\n";
      msg += "⏰COUNTDOWN: " + hours + ":" + minutes + ":" + seconds + "\n";
      msg += "🏆PRIZE: " + session.prizeAmount + "BUSD" + "\n\n";
      msg += "🎁AIRDROP: Every participant will receive an airdrop of our next token launch" + "\n\n";

      msg += `🔼Every hour, the minimum burn required increased by ${session.minimumBurnIncreaseAmount} $TOKENS` + "\n";
      msg += `🔄Every new burn resets the countdown to ${pDays > 0 ? pDays + "days " : ''}${pHours > 0 ? pHours + "hours " : ''}${pMinutes > 0 ? pMinutes + "minutes " : ''}${pSeconds > 0 ? pSeconds + "seconds " : ''}` + "\n";
      msg += `🔄Every new burn resets the minimum burn to ${session.minimumBurnAmount} $TOKENS` + "\n";
    } else if (msgType == 2) { // Minimum Burn Increased!
      session.minimumBurnAmount += Number(session.minimumBurnIncreaseAmount);

      msg = "📣MINIMUM BURN INCREASED" + "\n\n";

      msg += "🔥CURRENT MIN BURN: " + session.minimumBurnAmount + " $TOKENS" + "\n";
      msg += "⏰COUNTDOWN: " + hours + ":" + minutes + ":" + seconds + "\n";
      msg += "🏆PRIZE: " + session.prizeAmount + "BUSD" + "\n\n";
      msg += "🎁AIRDROP: Every participant will receive an airdrop of our next token launch" + "\n\n";

      msg += "🔼Every hour, the minimum burn required increased by 500 $TOKENS" + "\n";
      msg += "🔄Every new burn resets the countdown to 24 hours" + "\n";
      msg += "🔄Every new burn resets the minimum burn to 1,000 $TOKENS" + "\n";
    } else if (msgType == 3) { // New Burner

      msg = "📣WE HAVE A NEW BURNER!" + "\n\n";

      msg += "🔄The minimum burn and countdown have been reset!" + "\n\n";

      msg += "🔥NEW BURNER: " + sender + "\n";
      msg += "🔥CURRENT MIN BURN: " + session.minimumBurnAmount + " $TOKENS" + "\n";
      msg += "⏰COUNTDOWN: " + hours + ":" + minutes + ":" + seconds + "\n";
      msg += "🏆PRIZE: " + session.prizeAmount + "BUSD" + "\n\n";

      msg += "🎁AIRDROP: Every participant will receive an airdrop of our next token launch" + "\n\n";

      msg += "🔼Every hour, the minimum burn required increased by 500 $TOKENS" + "\n";
      msg += "🔄Every new burn resets the countdown to 24 hours" + "\n";
      msg += "🔄Every new burn resets the minimum burn to 1,000 $TOKENS" + "\n";
    } else if (msgType == 4) { // Winner
      let winner = burners.length > 0 ? burners[burners.length - 1] : '0x000000';
      let msg = "🏁WE HAVE A WINNER!" + "\n\n";

      msg += "🏆WINNER: " + winner + "\n";
      msg += "🤑PRIZE: " + session.prizeAmount + "BUSD" + "\n\n";
      msg += "🔥TOTAL $TOKEN BURNED: " + totalBurnAmount + "\n";

      msg += "🎁AIRDROP RECEIPIENTS: As a token of our appreciation every participant of this competition will receive an airdrop of the next token we launch." + "\n\n";

      for (let i = 0; i < burners.length; i++) {
        msg += burners[i] + "\n";
      }
    } else {
      return;
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: 'BURN ADDRESS', url: SCAN_LINK + session.burnAddress }
        ],
        [
          { text: 'BUY $TOKEN', url: session.buyTokenLink }
        ],
        [
          { text: '$TOKEN BURN CHANNEL', url: session.tokenBurnChannel }
        ],
      ]
    };

    await sleep(5000);
    await bot.sendVideo(GROUP_ID, session.videoURL, {
      caption: msg,
      reply_markup: keyboard,
      disable_web_page_preview: true,
      parse_mode: 'HTML'
    });

    // const menu = json_mainMenu(chatId);
    // await sendOptionMessage(chatId, msg, menu.options);

    // await sleep(5000)
    // await bot.sendVideo(OWNER_ID, media, {
    //   caption:msg,
    //   parse_mode: 'HTML'
    // });

    msgType = 0;
  } catch (e) {
    console.log("execution error: ", e);
    return;
  }

}

if (bot.isPolling()) {
  await bot.stopPolling();
}
await bot.startPolling();

export async function sendOptionMessage(chatid, message, option) {
  try {
    const session = sessions.get(Number(chatid));
    const keyboard = {
      inline_keyboard: option,
      resize_keyboard: true,
      one_time_keyboard: true,
      force_reply: true
    };

    await sleep(5000)
    await bot.sendVideo(chatid, session.videoURL, {
      caption: message,
      reply_markup: keyboard,
      disable_web_page_preview: true,
      parse_mode: 'HTML'
    });

    //   await bot.sendMessage(chatid, message, { reply_markup: keyboard, disable_web_page_preview: true, parse_mode: 'HTML' });

  } catch (error) {
    console.log('sendMessage', error)
  }
}

bot.on('message', async (message) => {

  console.log(`========== message ==========`)
  console.log(message)
  console.log(`=============================`)

  let chatId = message?.chat?.id;
  let session = sessions.get(chatId);
  if (!session) {
    let userName = message?.chat?.username;
    session = createSession(chatId, userName, message?.chat?.type);
  }

  const msgType = message?.chat?.type;

  if (msgType === 'private') {
    await privateBot.procMessage(message);

  } else if (msgType === 'group' || msgType === 'supergroup') {

  }
})

bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;

  if (!msg) return;

  const option = JSON.parse(callbackQuery.data);
  const chatId = msg.chat.id.toString();

  const cmd = option.c;
  const id = option.k;

  await executeCommand(chatId, msg.message_id, callbackQuery.id, option);
});

const executeCommand = async (chatId, msgId, callbackQueryId, option) => {
  const cmd = option.c;
  const id = option.k;

  try {
    if (cmd === OPTION_SETTINGS_MINIMUM_BURN_AMOUNT) {
      const sessionId = id;

      const msg = "Please enter minimum burn amount";
      await sendReplyMessage(chatId, msg);

      stateMap_set(chatId, STATE_WAIT_SET_MINIMUM_BURN_AMOUNT, { sessionId })
    } else if (cmd === OPTION_SETTINGS_MINIMUM_BURN_INCREASE_AMOUNT) {
      const sessionId = id;

      const msg = "Please enter minimum burn increase amount";
      await sendReplyMessage(chatId, msg);

      stateMap_set(chatId, STATE_WAIT_SET_MINIMUM_BURN_INCREASE_AMOUNT, { sessionId })
    } else if (cmd === OPTION_SETTINGS_COUNTDOWN_PERIOD) {
      const sessionId = id;

      const msg = "Please enter minimum countdown period";
      await sendReplyMessage(chatId, msg);

      stateMap_set(chatId, STATE_WAIT_SET_COUNTDOWN_PERIOD, { sessionId })
    } else if (cmd === OPTION_SETTINGS_PRIZE_AMOUNT) {
      const sessionId = id;

      const msg = "Please enter prize amount";
      await sendReplyMessage(chatId, msg);

      stateMap_set(chatId, STATE_WAIT_SET_PRIZE_AMOUNT, { sessionId })
    } else if (cmd === OPTION_SETTINGS_BURN_ADDRESS) {
      const sessionId = id;

      const msg = "Please enter burn address";
      await sendReplyMessage(chatId, msg);

      stateMap_set(chatId, STATE_WAIT_SET_BURN_ADDRESS, { sessionId })
    } else if (cmd === OPTION_SETTINGS_TOKEN_ADDRESS) {
      const sessionId = id;

      const msg = "Please enter token address";
      await sendReplyMessage(chatId, msg);

      stateMap_set(chatId, STATE_WAIT_SET_TOKEN_ADDRESS, { sessionId })
    } else if (cmd === OPTION_SETTINGS_BUY_TOKEN_LINK) {
      const sessionId = id;

      const msg = "Please enter buy token link";
      await sendReplyMessage(chatId, msg);

      stateMap_set(chatId, STATE_WAIT_SET_BUY_TOKEN_LINK, { sessionId })
    } else if (cmd === OPTION_SETTINGS_TOKEN_BURN_CHANNEL) {
      const sessionId = id;

      const msg = "Please enter token burn channel";
      await sendReplyMessage(chatId, msg);

      stateMap_set(chatId, STATE_WAIT_SET_TOKEN_BURN_CHANNEL, { sessionId })
    } else if (cmd === OPTION_SETTINGS_VIDEO_URL) {
      const sessionId = id;

      const msg = "Please enter video url";
      await sendReplyMessage(chatId, msg);

      stateMap_set(chatId, STATE_WAIT_SET_VIDEO_URL, { sessionId })
    }
  } catch (error) {
    await sendMessage(chatId, `😢 Sorry, there were some errors on the command. Please try again later 😉`);
    await bot.answerCallbackQuery(callbackQueryId, { text: `😢 Sorry, there were some errors on the command. Please try again later 😉` });
  }
}


export async function openMenu(chatId, menuTitle, json_buttons) {

  const keyboard = {
    inline_keyboard: json_buttons,
    resize_keyboard: true,
    one_time_keyboard: true,
    force_reply: true
  };

  try {

    await bot.sendMessage(chatId, menuTitle, { reply_markup: keyboard, parse_mode: 'HTML', disable_web_page_preview: true });

  } catch (error) {
    console.log('openMenu', error)
  }
}

export const get_menuTitle = (sessionId, subTitle) => {

  const session = sessions.get(sessionId)
  if (!session) {
    return 'ERROR ' + sessionId
  }

  let result = session.type === 'private' ? `@${session.username}'s configuration setup` : `@${session.username} group's configuration setup`

  if (subTitle && subTitle !== '') {

    //subTitle = subTitle.replace('%username%', `@${session.username}`)
    result += `\n${subTitle}`
  }

  return result
}

export const removeMessage = async (sessionId, messageId) => {

  try {
    await bot.deleteMessage(sessionId, messageId)
  } catch (error) {
    console.error(error)
  }
}

export async function sendMessage(chatid, message, enableLinkPreview = true) {
  try {

    let data = { parse_mode: 'HTML' }

    if (enableLinkPreview)
      data.disable_web_page_preview = false
    else
      data.disable_web_page_preview = true

    data.disable_forward = true

    const retVal = await bot.sendMessage(chatid, message, data)

    return retVal
  } catch (error) {
    console.log('sendMessage', error)

    return false;
  }
}

export async function sendReplyMessage(chatid, message) {
  try {
    console.log("ReplyMessage");
    let options = { parse_mode: 'HTML', disable_forward: true, disable_web_page_preview: true, reply_markup: { force_reply: true } }

    await bot.sendMessage(chatid, message, options)

    return true
  } catch (error) {
    console.log('sendMessage', error)

    return false
  }
}

export function isValidAddress(adr) {
  return web3.utils.isAddress(adr);
}