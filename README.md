### Getting keys
In order to use this bot yourself, you'll need to get a token for the Telegram bot.
You can create a bot and get its token using [@BotFather](https://t.me/botfather) inside the app.

### Setting up the environment
Once you've got Telegram Bot Token create a .env file in the root of the project and then add the tokens there, the following way:
```text
TELEGRAM_BOT_TOKEN="your token as string"
```
Save the file and remember adding it to your .gitignore if you're pushing the code, otherwise you'd be sharing your keys.

```text
OS: Ubuntu 22.04.3 LTS
node: v16.20.2
yarn: 1.22.19
npm: 8.19.4
```

### Running the bot
First, we need to install the dependencies in order for the bot to run correctly. From the root, just execute the following command.
```shell
npm install
```
That's it, we're ready to run the bot, just use this script:
```shell
npm start
```

```help
help - help
start - start bot
startcompetition - start competition
endcompetition - end competition
set_minimum_burn_amount - set minimum burn amount
set_increase_burn_amount - set increase burn amount
set_countdown_timer - set countdown timer
set_prize_amount - set prize amount
set_burn_address - set burn address
set_token_address - set token address
set_buy_token_link - set buy token link
set_burn_channel_link - set burn channel link
set_video - set video
set_channel_1 - set channel 1 id
set_channel_2 - set channel 2 id
show_info - show info
```

And that's all, you can now interact with your bot using Telegram.