const express = require("express");
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
require("dotenv").config();

const app = express();
app.use(express.json());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`Bot online como: ${client.user.tag}`);
});

app.post("/ticket", async (req, res) => {
    const { produto, preco, usuario } = req.body;

    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const categoria = process.env.CATEGORY_ID;

        const ticketChannel = await guild.channels.create({
            name: `ticket-${usuario}-${produto}`.toLowerCase(),
            type: 0,
            parent: categoria,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                }
            ]
        });

        await ticketChannel.send(`🎫 **Novo ticket criado!**
👤 Usuário: **${usuario}**
🛒 Produto: **${produto}**
💵 Preço: **${preco}**

Aguarde um atendente.`);

        return res.json({ ok: true, channel: ticketChannel.id });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao criar ticket" });
    }
});

app.listen(3000, () => {
    console.log("API rodando na porta 3000");
});

client.login(process.env.BOT_TOKEN);
