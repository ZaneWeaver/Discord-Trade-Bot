require('dotenv').config();
const Discord = require('discord.js');
const { Client } = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const mongoose = require('mongoose');
const User = require("./schemas/UserSchema");
const Trade = require("./schemas/TradeSchema");

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then((m) => {
    console.log("Connected to DB");
})
.catch((err) => console.log(err));

client.login(process.env.DISCORD_BOT_TOKEN);

client.on("ready", () => {
    console.log(`${client.user.tag} has logged in.`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase().startsWith('!addtrade')) {
        const argss = message.content.split(' ');
        if (argss.length === 4) {
            const description = (argss[1]);
            const expdate = (argss[2]);
            const strike = (argss[3]);
            try {
                await Trade.create({
                    description,
                    userId: message.author.id,
                    expdate,
                    strike,           
                });
                message.channel.send("Trade Saved.");
            } catch (err) {
                console.log(err);
                message.channel.send("Failed to save Trade.");
            }
        } else {
            message.channel.send("Failed to add trade");
        }
    } else if (message.content.toLowerCase().startsWith('!mytrades')) {
        const args = message.content.split(' ');
        if (args.length === 1) {
            const trades = await Trade.find({ userId: message.author.id },
                null, {
                    limit: 10,
                });
            let description = '';
            for (const i in trades) {
                description += `${parseInt(i) + 1}) ${trades[i].description}\n`;
            }
            message.channel.send("Trade List: \n" + description);
        } else {
            message.channel.send("Invalid Command")
        }
    } else if (message.content.toLowerCase().startsWith('!showtrade')) {
        const args = message.content.split(' ');
        if (args.length === 2) {
            const arg = args[1];
            try {
                const trade = await Trade.findOne({ description: arg });
                if (trade) {
                    message.channel.send("Stock Ticker: " + trade.description);
                    message.channel.send("Option Contract Exp. Date: " + trade.expdate);
                    message.channel.send("Strike Price: " + trade.strike);
                } else {
                    message.channel.send("Trade not found.");
                }
            } catch (err) {
                console.log(err);
                message.channel.send("Trade not found.");
            }
        } else {
            message.channel.send("Trade not found.");
        }
    } else if (message.content.toLowerCase().startsWith('!deltrade')) {
        const args = message.content.split(' ');
        if (args.length === 0 || args.length === 1) {
            message.channel.send("Trade not found.");
        } else {
                for (const i in args) {
                    const arg = args[i];
                    const trade = await Trade.deleteOne({ description: arg });
                }
                message.channel.send("Trades Deleted")
            }
    }
});