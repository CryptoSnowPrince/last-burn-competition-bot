# Last Burn Competition Bot

### Environment

You should setup the following version or above.
```text
OS: Ubuntu 22.04.3 LTS
node: v16.20.2
yarn: 1.22.19
npm: 8.19.4
```

### Get Bot Token
In order to use this bot yourself, you'll need to get a token for the Telegram bot.
You can create a bot and get its token using [@BotFather](https://t.me/botfather) inside the app.

### Get Chat ID
In order to know your chat id with your bot, you can use [@ShowJsonBot](https://t.me/ShowJsonBot) inside the app.
You can forward your message to this bot, and this bot will show the chat id.

### Config .env file
Once you've got Telegram Bot Token and Chat ID, please copy .env.example to .env and copy your token and chat id.
```text
TELEGRAM_BOT_TOKEN="your token as string"
BOT_MANAGER='your chat id'
```

### Install packages
```shell
yarn
```

### Run the bot as development mode
```shell
yarn start
```

### Run the bot as product mode
```shell
yarn start-bot
```

### Stop the bot
```shell
yarn stop-bot
```

And that's all, you can now interact with your bot using Telegram.