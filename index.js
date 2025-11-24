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
    const { produto, preco, usuario, itens } = req.body; // usuario = ID no Discord

    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const categoria = process.env.CATEGORY_ID;
        const cargoCEO = "1407038865914466451";

        if (!guild) return res.status(500).json({ error: "Guild não encontrada" });

        // Buscar usuário
        const member = await guild.members.fetch(usuario).catch(() => null);
        if (!member) return res.status(400).json({ error: "Usuário não encontrado" });

        const nomeDiscord = member.user.username;

        // Criar o canal do ticket
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
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages
                    ]
                }
            ]
        });

        // 📩 Mensagem personalizada dentro do ticket
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



// 📝 SISTEMA DE FECHAR O TICKET + LOG
client.on("messageCreate", async (message) => {
    try {
        if (!message.channel.name.startsWith("📩・ticket-")) return;
        if (message.author.bot) return;

        if (message.content.toLowerCase() === "!fechar") {
            const guild = message.guild;

            const canalLog = "1442642518842937577"; // Canal logs-ticket
            const logChannel = await guild.channels.fetch(canalLog).catch(() => null);

            if (!logChannel) {
                return message.reply("❌ O canal de logs não foi encontrado!");
            }

            // Buscar mensagens do ticket
            const msgs = await message.channel.messages.fetch({ limit: 100 });

            const textoLog = msgs
                .map(m => `[${m.author.tag}] ${m.content}`)
                .reverse()
                .join("\n");

            // Mandar o histórico para o canal de logs
            await logChannel.send({
                content: `
📁 **TICKET FECHADO**
━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 **Canal:** ${message.channel.name}
👤 **Fechado por:** ${message.author.tag}
━━━━━━━━━━━━━━━━━━━━━━━━━━
🧾 **Histórico Completo:**  
\`\`\`
${textoLog}
\`\`\`
`
            });

            await message.channel.send("💗 Ticket salvo e será fechado em 5 segundos...");

            setTimeout(() => message.channel.delete(), 5000);
        }
    } catch (err) {
        console.error("Erro no fechamento:", err);
    }
});



app.listen(process.env.PORT || 3000, () => {
    console.log("API rodando na porta " + (process.env.PORT || 3000));
});

client.login(process.env.BOT_TOKEN);
