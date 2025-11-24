const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // <--- NECESSÁRIO PARA PEGAR NOME DO DISCORD
    ]
});

client.once("clientReady", () => {
    console.log(`Bot online como: ${client.user.tag}`);
});

// 🚀 Rota do ticket
app.post("/ticket", async (req, res) => {
    const { produto, preco, usuario, itens } = req.body;
    // usuario = ID do usuário no Discord

    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const categoria = process.env.CATEGORY_ID;
        const cargoCEO = "1407038865914466451";

        if (!guild) return res.status(500).json({ error: "Guild não encontrada" });

        // 🔍 Buscar info do usuário pelo ID
        const member = await guild.members.fetch(usuario).catch(() => null);

        if (!member) {
            return res.status(400).json({ error: "Usuário não encontrado no Discord" });
        }

        const nomeDiscord = member.user.username;

        // Criar canal
        const ticketChannel = await guild.channels.create({
            name: `📩・ticket-${nomeDiscord}`,
            type: 0,
            parent: categoria,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: usuario,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                }
            ]
        });

        // Mensagem
        await ticketChannel.send(`
📨 **NOVO TICKET ABERTO!**
━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 **Cliente:** <@${usuario}> (${nomeDiscord})
🛒 **Produto:** ${produto}
💵 **Valor Total:** R$ ${preco}

🧾 **Itens Comprados:**
${itens}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 <@&${cargoCEO}> um cliente abriu um ticket!

Por favor, aguarde que você será atendido em breve. 💗
        `);

        return res.json({ ok: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao criar ticket" });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("API rodando na porta " + (process.env.PORT || 3000));
});

client.login(process.env.BOT_TOKEN);
