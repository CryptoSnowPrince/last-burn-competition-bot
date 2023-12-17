import * as instance from './fuck.js'
import assert from 'assert'
import dotenv from 'dotenv'
dotenv.config()

/*
start - welcome
*/

export const procMessage = async (message) => {

	let chatid = message.chat.id;
	let session = instance.sessions.get(chatid)
	console.log("session: ", session)
	let userName = message?.chat?.username;

	if (message.photo) {
		console.log(message.photo)
	}

	if (message.animation) {
		console.log(message.animation)
	}

	if (!message.text)
		return;

	let command = message.text;
	if (message.entities) {
		for (const entity of message.entities) {
			if (entity.type === 'bot_command') {
				command = command.substring(entity.offset, entity.offset + entity.length);
				break;
			}
		}
	}

	if (command.startsWith('/')) {
		if (!session) {

			if (!userName) {
				console.log(`Rejected anonymous incoming connection. chatid = ${chatid}`);
				await instance.sendMessage(chatid, `Welcome to alphAI bot. We noticed that your telegram does not have a username. Please create username and try again. If you have any questions, feel free to ask the developer team at @CryptoPrince0207. Thank you.`)
				return;
			}

			if (false && !await instance.checkWhitelist(userName)) {

				//await instance.sendMessage(chatid, `😇Sorry, but you do not have permission to use alphBot. If you would like to use this bot, please contact the developer team at ${process.env.TEAM_TELEGRAM}. Thanks!`);
				console.log(`Rejected anonymous incoming connection. @${userName}, ${chatid}`);
				return;
			}

			console.log(`@${userName} session has been permitted through whitelist`);

			session = instance.createSession(chatid, userName, 'private');
			session.permit = 1;

			// await database.updateUser(session)
		}

		// if (session.permit !== 1) {
		// 	session.permit = await instance.isAuthorized(session) ? 1 : 0;
		// }

		// if (false && session.permit !== 1) {
		// 	//await instance.sendMessage(chatid, `😇Sorry, but you do not have permission to use alphBot. If you would like to use this bot, please contact the developer team at ${process.env.TEAM_TELEGRAM}. Thank you for your understanding. [2]`);
		// 	return;
		// }

		let params = message.text.split(' ');
		if (params.length > 0 && params[0] === command) {
			params.shift()
		}

		command = command.slice(1);

		if (command === instance.COMMAND_START) {

			const menu = instance.json_mainMenu(session.chatid);

			// await instance.sendOptionMessage(session.chatid, await instance.getWelcomeMessage(session), menu.options)
		}
	} else if (message.reply_to_message) {
		await processSettings(message);
		await instance.removeMessage(chatid, message.reply_to_message.message_id)
		//await instance.removeMessage(chatid, message.message_id)

	} else {
		const value = message.text.trim()
		// if (utils.isValidAddress(value)) {

		// 	const session = instance.sessions.get(chatid)

		// 	if (session && instance._callback_proc) {
		// 		instance._callback_proc(instance.OPTION_MSG_GETTOKENINFO, { session, address: value })
		// 	}
		// }
	}
}

const processSettings = async (msg) => {

	const privateId = msg.chat?.id.toString()

	let stateNode = instance.stateMap_get(privateId)

	if (!stateNode) {
		instance.stateMap_set(privateId, instance.STATE_IDLE, { sessionId: privateId })
		stateNode = instance.stateMap_get(privateId)

		assert(stateNode)
	}

	if (stateNode.state === instance.STATE_WAIT_SET_MINIMUM_BURN_AMOUNT) {
		// const session = instance.sessions.get(stateNode.data.sessionId);
		const session = instance.sessions.get(instance.GROUP_ID);
		// assert(session)
		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < 0 || value > 1000000) {
			await instance.sendMessage(privateId, `🚫 Sorry, the slippage you entered must be between 0 to 1,000,000. Please try again`)
			return
		}
		session.minimumBurnAmount = value
		// await database.updateUser(session)
		console.log("Updated Session: ", session);

		instance.stateMap_set(privateId, instance.STATE_IDLE, { sessionId: privateId })

		await instance.sendMessage(privateId, `✅ Successfully updated minimum burn amount`);

		const menu = instance.json_settingsMenu(stateNode.data.sessionId);
		if (menu)
			await instance.openMenu(privateId, menu.title, menu.options);

		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_MINIMUM_BURN_INCREASE_AMOUNT) {
		// const session = instance.sessions.get(stateNode.data.sessionId);
		const session = instance.sessions.get(instance.GROUP_ID);
		assert(session)

		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < 0 || value > 1000000) {
			await instance.sendMessage(privateId, `🚫 Sorry, the minimum burn increase amount you entered must be between 0 to 1,000,000. Please try again`)
			return
		}

		session.minimumBurnIncreaseAmount = value
		// await database.updateUser(session)

		instance.stateMap_set(privateId, instance.STATE_IDLE, { sessionId: privateId })

		await instance.sendMessage(privateId, `✅ Successfully updated minimum burn increase amount`);

		const menu = instance.json_settingsMenu(stateNode.data.sessionId);
		if (menu)
			await instance.openMenu(privateId, menu.title, menu.options);

		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_COUNTDOWN_PERIOD) {
		// const session = instance.sessions.get(stateNode.data.sessionId);
		const session = instance.sessions.get(instance.GROUP_ID);
		assert(session)

		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < 0 || value > 864000) {
			await instance.sendMessage(privateId, `🚫 Sorry, the countdown period you entered must be between 0 to 864,000(24h). Please try again`)
			return
		}

		session.countdownPeriod = value
		// await database.updateUser(session)

		instance.stateMap_set(privateId, instance.STATE_IDLE, { sessionId: privateId })

		await instance.sendMessage(privateId, `✅ Successfully updated countdown period`);

		const menu = instance.json_settingsMenu(stateNode.data.sessionId);
		if (menu)
			await instance.openMenu(privateId, menu.title, menu.options);

		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_PRIZE_AMOUNT) {
		// const session = instance.sessions.get(stateNode.data.sessionId);
		const session = instance.sessions.get(instance.GROUP_ID);
		assert(session)

		const value = msg.text.trim()
		if (isNaN(value) || value === '' || value < 0 || value > 1000000) {
			await instance.sendMessage(privateId, `🚫 Sorry, the prize amount you entered must be between 0 to 1,000,000. Please try again`)
			return
		}

		session.prizeAmount = value
		// await database.updateUser(session)

		instance.stateMap_set(privateId, instance.STATE_IDLE, { sessionId: privateId })

		await instance.sendMessage(privateId, `✅ Successfully updated prize amount`);

		const menu = instance.json_settingsMenu(stateNode.data.sessionId);
		if (menu)
			await instance.openMenu(privateId, menu.title, menu.options);

		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_BURN_ADDRESS) {

		// const session = instance.sessions.get(stateNode.data.sessionId);
		const session = instance.sessions.get(instance.GROUP_ID);
		assert(session);

		const addr = msg.text.trim();
		if (!instance.isValidAddress(addr)) {
			await instance.sendReplyMessage(privateId, `🚫 Sorry, the address you entered is invalid. Please input again`);
			return;
		}

		session.burnAddress = addr
		// await database.updateUser(session)

		instance.stateMap_set(privateId, instance.STATE_IDLE, { sessionId: privateId })

		await instance.sendMessage(privateId, `✅ Successfully updated burn address`);

		const menu = instance.json_settingsMenu(stateNode.data.sessionId);
		if (menu)
			await instance.openMenu(privateId, menu.title, menu.options);

		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_TOKEN_ADDRESS) {

		// const session = instance.sessions.get(stateNode.data.sessionId);
		const session = instance.sessions.get(instance.GROUP_ID);
		assert(session);

		const addr = msg.text.trim();
		if (!instance.isValidAddress(addr)) {
			await instance.sendReplyMessage(privateId, `🚫 Sorry, the address you entered is invalid. Please input again`);
			return;
		}

		session.tokenAddress = addr
		// await database.updateUser(session)

		instance.stateMap_set(privateId, instance.STATE_IDLE, { sessionId: privateId })

		await instance.sendMessage(privateId, `✅ Successfully updated token address`);

		const menu = instance.json_settingsMenu(stateNode.data.sessionId);
		if (menu)
			await instance.openMenu(privateId, menu.title, menu.options);

		return

	} else if (stateNode.state === instance.STATE_WAIT_SET_BUY_TOKEN_LINK) {

		// const session = instance.sessions.get(stateNode.data.sessionId);
		const session = instance.sessions.get(instance.GROUP_ID);
		assert(session)

		const value = msg.text.trim()
		session.buyTokenLink = value
		// await database.updateUser(session)

		instance.stateMap_set(privateId, instance.STATE_IDLE, { sessionId: privateId })

		await instance.sendMessage(privateId, `✅ Successfully updated buy token link`)

		const menu = instance.json_settingsMenu(stateNode.data.sessionId);
		if (menu)
			await instance.openMenu(privateId, await instance.getWelcomeMessage(session), menu.options)

		return
	} else if (stateNode.state === instance.STATE_WAIT_SET_TOKEN_BURN_CHANNEL) {

		// const session = instance.sessions.get(stateNode.data.sessionId);
		const session = instance.sessions.get(instance.GROUP_ID);
		assert(session)

		const value = msg.text.trim()
		session.tokenBurnChannel = value
		// await database.updateUser(session)

		instance.stateMap_set(privateId, instance.STATE_IDLE, { sessionId: privateId })

		await instance.sendMessage(privateId, `✅ Successfully updated token burn channel`)

		const menu = instance.json_settingsMenu(stateNode.data.sessionId);
		if (menu)
			await instance.openMenu(privateId, await instance.getWelcomeMessage(session), menu.options)

		return

	} else if (stateNode.state === instance.STATE_WAIT_SET_VIDEO_URL) {

		// const session = instance.sessions.get(stateNode.data.sessionId);
		const session = instance.sessions.get(instance.GROUP_ID);
		assert(session)

		const value = msg.text.trim()
		session.videoURL = value
		// await database.updateUser(session)

		instance.stateMap_set(privateId, instance.STATE_IDLE, { sessionId: privateId })

		await instance.sendMessage(privateId, `✅ Successfully updated video URL`)

		const menu = instance.json_settingsMenu(stateNode.data.sessionId);
		if (menu)
			await instance.openMenu(privateId, await instance.getWelcomeMessage(session), menu.options)

		return
	}
}
