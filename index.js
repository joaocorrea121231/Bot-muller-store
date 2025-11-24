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
        GatewayIntentBits.GuildMembers
    ]
});

client.once("ready", () => {
    console.log(`Bot online como: ${client.user.tag}`);
});


// 🚀 ROTA PARA CRIAR TICKET
app.post("/ticket", async (req, res) => {
    const { produto, preco, usuario, itens } = req.body;

    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const categoria = process.env.CATEGORY_ID;
        const cargoCEO = "1407038865914466451"; // cargo mencionado no ticket

        if (!guild) return res.status(500).json({ error: "Guild não encontrada" });

        const member = await guild.members.fetch(usuario).catch(() => null);
        if (!member) return res.status(400).json({ error: "Usuário não encontrado" });

        const nomeDiscord = member.user.username;

        // Criar o canal do ticket
        const ticketChannel = await guild.channels.create({
            name: `📩・ticket-${nomeDiscord}`,
            type: 0,
            parent: categoria,
            topic: usuario, // ← DONO DO TICKET
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: usuario,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                },
                {
                    id: cargoCEO,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                }
            ]
        });

        // Mensagem dentro do ticket
        await ticketChannel.send(`
💌  **Novo Ticket Recebido**  
━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 **Cliente:** <@${usuario}> (${nomeDiscord})  
🛍️ **Produto:** ${produto}  
💳 **Total da compra:** R$ ${preco}  

🧾 **Itens:**  
${itens.split("\n").map(i => `• ${i}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ <@&${cargoCEO}>, sua atenção é necessária.  
Agradecemos por comprar conosco 💗  
**Muller Store — sempre com carinho.** ✨
        `);

        return res.json({ ok: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao criar ticket" });
    }
});


// 📝 SISTEMA DE FECHAR O TICKET + ARQUIVAR
client.on("messageCreate", async (message) => {
    try {
        if (!message.channel.name.startsWith("📩・ticket-")) return;
        if (message.author.bot) return;

        if (message.content.toLowerCase() === "!fechar") {

            const guild = message.guild;
            const archiveCategory = "1442642518842937577"; // categoria dos arquivados

            // Dono salvo no tópico
            const donoId = message.channel.topic;
            const dono = await guild.members.fetch(donoId).catch(() => null);

            if (!dono) {
                return message.reply("❌ Não foi possível identificar o dono do ticket.");
            }

            // remover acesso do cliente
            await message.channel.permissionOverwrites.edit(dono.id, {
                ViewChannel: false,
                SendMessages: false,
                ReadMessageHistory: false
            });

            // mover para a categoria de arquivados
            await message.channel.setParent(archiveCategory);

            // renomear
            await message.channel.setName(`📁・arquivo-${dono.user.username}`);

            await message.channel.send(`
🔒 **Ticket fechado com sucesso!**
📁 O cliente não pode mais ver este canal.
💗 Todas as mensagens foram preservadas para consulta.
            `);
        }
    } catch (err) {
        console.error("Erro no fechamento:", err);
    }
});


app.listen(process.env.PORT || 3000, () => {
    console.log("API rodando na porta " + (process.env.PORT || 3000));
});

client.login(process.env.BOT_TOKEN);
