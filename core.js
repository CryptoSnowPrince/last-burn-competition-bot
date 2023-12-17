import dotenv from 'dotenv'

import * as constant from './constant.js';

dotenv.config()

const bot_manager = process.env.BOT_MANAGER

export const sessions = new Map();

export const setDefaultSettings = (session) => {
    session.admin = false

    if (session.chatid.toString() === bot_manager.toString()) {
        session.admin = true
    }
}

export const getSessionId = (message) => {
    return `${message.from.id}-${message.chat.id}`
}

export const getSession = (sessionId) => {
    const session = sessions.get(sessionId);
    if (!session) {
        throw "NO SESSION on getSession"
    }
    return session;
}

export const isExistSession = (sessionId) => {
    const session = sessions.get(sessionId);
    if (!session) {
        return false
    }
    return true;
}

export const initSession = (message) => {
    const sessionId = getSessionId(message);
    if (!isExistSession(sessionId)) {
        const fromid = message?.from?.id;
        const chatid = message?.chat?.id;
        const username = message?.chat?.username;
        const type = message?.chat?.type;

        const session = {
            fromid: fromid ? fromid : undefined,
            chatid: chatid ? chatid : undefined,
            username: username ? username : undefined,
            type: type ? type : 'private',
        }

        setDefaultSettings(session)

        sessions.set(`${session.fromid}-${session.chatid}`, session)

        return session;
    }

    return getSession(sessionId)
}

const json_buttonItem = (key, cmd, text) => {
    return {
        text: text,
        callback_data: JSON.stringify({ k: key, c: cmd }),
    }
}

export const json_settingsMenu = (sessionId) => {
    const session = sessions.get(sessionId)
    if (!session) {
        throw "NO SESSION on json_settingsMenu"
    }

    let title = '⬇️ Last Burn Competition Settings by Admin\n\n Only Admin can set parameters!'
    if (!session.admin) {
        title = `${title}\n\n You have not admin role. \n\n If you want to get admin role, please contact <a href="https://t.me/CryptoSnowPrince">CryptoSnowPrince</a>!`
    } else {
        title = `${title}\n\n You have a admin. \n\n Please set the Last Burn Competition Parameters!`
    }

    const json = session.admin ? [
        [
            json_buttonItem(sessionId, constant.OPTION_SETTINGS_MINIMUM_BURN_AMOUNT, 'Minimum Burn Amount'),
            json_buttonItem(sessionId, constant.OPTION_SETTINGS_MINIMUM_BURN_INCREASE_AMOUNT, 'Minimum Burn Increase Amount')
        ],
        [
            json_buttonItem(sessionId, constant.OPTION_SETTINGS_COUNTDOWN_PERIOD, 'Countdown Period'),
            json_buttonItem(sessionId, constant.OPTION_SETTINGS_PRIZE_AMOUNT, 'Prize Amount')
        ],
        [
            json_buttonItem(sessionId, constant.OPTION_SETTINGS_BURN_ADDRESS, 'Burn Address'),
            json_buttonItem(sessionId, constant.OPTION_SETTINGS_TOKEN_ADDRESS, 'Token Address')
        ],
        [
            json_buttonItem(sessionId, constant.OPTION_SETTINGS_BUY_TOKEN_LINK, 'Buy Token Link'),
            json_buttonItem(sessionId, constant.OPTION_SETTINGS_TOKEN_BURN_CHANNEL, 'Token Burn Channel'),
        ],
        [
            json_buttonItem(sessionId, constant.OPTION_SETTINGS_VIDEO_URL, 'Video URL')
        ],
    ] : []

    return {
        title,
        options: json
    };
}

export const getWelcomeMessage = () => {
    const message = `Welcome to LastBurnCompetitionBot! \n\nHow it works: \n\n/help - welcome message and help\n/start - welcome message and help\n/setting - setting competition by admin\n/startcompetition - start competition by admin\n/stopcompetition - stop competition by admin\n/setadmin - set admin\n\nMetabestech`
    return message;
}

export const getUnknownMessage = () => {
    return `Unknown Command!`;
}

export const executeSettingCommand = async (sessionId, session, cmd, bot) => {
    const chatid = session.chatid;
    let msg = `😢 Sorry, there were some errors on the command. Please try again later 😉`
    if (cmd === constant.OPTION_SETTINGS_MINIMUM_BURN_AMOUNT) {
        msg = "Please enter minimum burn amount";
    } else if (cmd === constant.OPTION_SETTINGS_MINIMUM_BURN_INCREASE_AMOUNT) {
        msg = "Please enter minimum burn increase amount";
    } else if (cmd === constant.OPTION_SETTINGS_COUNTDOWN_PERIOD) {
        msg = "Please enter minimum countdown period";
    } else if (cmd === constant.OPTION_SETTINGS_PRIZE_AMOUNT) {
        msg = "Please enter prize amount";
    } else if (cmd === constant.OPTION_SETTINGS_BURN_ADDRESS) {
        msg = "Please enter burn address";
    } else if (cmd === constant.OPTION_SETTINGS_TOKEN_ADDRESS) {
        msg = "Please enter token address";
    } else if (cmd === constant.OPTION_SETTINGS_BUY_TOKEN_LINK) {
        msg = "Please enter buy token link";
    } else if (cmd === constant.OPTION_SETTINGS_TOKEN_BURN_CHANNEL) {
        msg = "Please enter token burn channel";
    } else if (cmd === constant.OPTION_SETTINGS_VIDEO_URL) {
        msg = "Please enter video url";
    }
    await bot.sendMessage(chatid, msg);
}
