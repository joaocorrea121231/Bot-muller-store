const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
require("dotenv").config();

const app = express();

// 🔥 LIBERA ACESSO DO SEU SITE
app.use(cors({
    origin: "*"
}));

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

// 🔥 PORTA CORRIGIDA PARA O RENDER
app.listen(process.env.PORT || 3000, () => {
    console.log("API rodando na porta " + (process.env.PORT || 3000));
});

client.login(process.env.BOT_TOKEN);
