const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
require("dotenv").config();

const app = express();

// Libera acesso do seu site
app.use(cors({ origin: "*" }));
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

// Rota principal de ticket
app.post("/ticket", async (req, res) => {
    const { produto, preco, usuario, itens } = req.body;

    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const categoria = process.env.CATEGORY_ID;

        if (!guild) return res.status(500).json({ error: "Guild não encontrada" });

        const ticketChannel = await guild.channels.create({
            name: `ticket-${Date.now()}`,
            type: 0,
            parent: categoria,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                }
            ]
        });

        await ticketChannel.send(`
🎫 **Novo ticket criado!**

👤 Usuário: **${usuario}**
🛒 Produto: **${produto}**
💵 Total: **R$ ${preco}**

🧾 **Itens:**
${itens}

Aguarde um atendente.
        `);

        return res.json({ ok: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao criar ticket" });
    }
});

// 🔥 Rota de TESTE para verificar criação de canal
app.get("/test", async (req, res) => {
    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const categoria = process.env.CATEGORY_ID;

        const canal = await guild.channels.create({
            name: "teste-bot",
            type: 0,
            parent: categoria
        });

        return res.json({ status: "Canal criado com sucesso!", channelID: canal.id });

    } catch (e) {
        console.error(e);
        return res.json({
            status: "Erro ao criar canal",
            error: e.message
        });
    }
});

// Porta do Render
app.listen(process.env.PORT || 3000, () => {
    console.log("API rodando na porta " + (process.env.PORT || 3000));
});

// Login do bot
client.login(process.env.BOT_TOKEN);
