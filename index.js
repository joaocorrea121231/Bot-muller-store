const express = require("express");
const cors = require("cors");
const { 
    Client, 
    GatewayIntentBits, 
    PermissionsBitField,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

require("dotenv").config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

let conviteEnviado = false;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});


client.once("ready", async () => {
    console.log(`Bot online: ${client.user.tag}`);


    // 🎀 PAINEL DE PAGAMENTO
    try {
        const canalPagamento = client.channels.cache.get("1407038866765906073");

        if (canalPagamento) {
            const embedPagamento = new EmbedBuilder()
                .setTitle("💗 Formas de Pagamento — Muller Store")
                .setColor("#FFB6C1")
                .setImage("https://i.imgur.com/9oBpThS.png")
                .setFooter({ text: "Pague com segurança 💗" });

            await canalPagamento.send({ embeds: [embedPagamento] });

            console.log("✔ Embed de pagamento enviado!");
        }
    } catch (err) {
        console.log("Erro ao enviar pagamento:", err);
    }



    // 🎀 CONVITE DO SERVIDOR APENAS UMA VEZ
    if (!conviteEnviado) {
        try {
            const conviteChannel = client.channels.cache.get("1407038866552258592");

            if (conviteChannel) {

                const embedConvite = new EmbedBuilder()
                    .setTitle("🌸 Convite do Servidor")
                    .setDescription("Clique no link abaixo para entrar 💖")
                    .setColor("#FFB6C1")
                    .setThumbnail("https://cdn.discordapp.com/icons/1407038865906208882/a.png?size=2048")
                    .setFooter({ text: "Muller Store — Seja bem-vindo(a)! 🌸" });

                await conviteChannel.send({ embeds: [embedConvite] });

                await conviteChannel.send("https://discord.gg/hCAxpwkQm2");

                conviteEnviado = true;
            }
        } catch (e) {
            console.log("Erro ao enviar convite:", e);
        }
    }



    // 🎀 PAINEL DE TICKET
    try {
        const channel = client.channels.cache.get("1407103113403568210");

        if (channel) {

            const embed = new EmbedBuilder()
                .setTitle("Sistema de Atendimento — Muller Store")
                .setDescription(
`Bem-vindo(a) ao **atendimento da Muller Store** 💗  
Escolha abaixo uma categoria para abrir seu ticket.`
                )
                .setColor("#FFB6C1")
                .setImage("https://i.imgur.com/ewkxnYw.png");

            const menu = new StringSelectMenuBuilder()
                .setCustomId("painel_ticket")
                .setPlaceholder("Escolha uma categoria")
                .addOptions(
                    { label: "📦 Compra / Pedido", value: "compra" },
                    { label: "❗ Problema / Erro", value: "problema" },
                    { label: "💬 Suporte Geral", value: "geral" }
                );

            const row = new ActionRowBuilder().addComponents(menu);

            await channel.send({ embeds: [embed], components: [row] });
        }

    } catch (e) {
        console.log("Erro ao enviar painel:", e);
    }



    // 🎀 EMBED "QUEM SOMOS"
    try {
        const canalInfo = client.channels.cache.get("1442654966001959002");

        if (canalInfo) {
            const embedInfo = new EmbedBuilder()
                .setTitle("💗 QUEM SOMOS — Muller Store")
                .setColor("#FFB6C1")
                .setThumbnail("https://cdn.discordapp.com/icons/1407038865906208882/a.png?size=2048")
                .setDescription(
`A **Muller Store** nasceu do carinho de **Pipokinha & Kira**, trazendo itens premium e fofinhos para você! 🌸✨

🎀 **Cabelos 2 em 1 e 3 em 1**  
🌈 **Acessórios e props**  
✨ **Presets faciais exclusivos**

— Sempre com amor,  
**Pipokinha & Kira 💗🌸**`
                )
                .setFooter({ text: "Muller Store — Qualidade e Carinho 💗" });

            await canalInfo.send({ embeds: [embedInfo] });
        }

    } catch (err) {
        console.log("Erro ao enviar Quem Somos:", err);
    }
});



// ⭐ DAR CARGO AUTOMÁTICO
client.on("guildMemberAdd", async (member) => {
    try {
        const cargoID = "1407038865906208884"; 
        const cargo = member.guild.roles.cache.get(cargoID);

        if (!cargo) return;

        await member.roles.add(cargo);

    } catch (err) {
        console.log("Erro ao dar cargo:", err);
    }
});



// 🎀 CRIAR TICKET VIA MENU
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "painel_ticket") return;

    const guild = interaction.guild;
    const categoria = process.env.CATEGORY_ID;
    const cargoCEO = "1407038865914466451";
    const escolha = interaction.values[0];

    const ticketChannel = await guild.channels.create({
        name: `📩・ticket-${interaction.user.username}`,
        type: 0,
        parent: categoria,
        topic: interaction.user.id,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: interaction.user.id,
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

    await interaction.reply({ content: "💗 Seu ticket foi aberto!", ephemeral: true });

    await ticketChannel.send(`
💌 **Novo Ticket Aberto**
━━━━━━━━━━━━━━━━━━━━━━

👤 **Cliente:** <@${interaction.user.id}>
📁 **Categoria:** ${escolha}

Aguarde, nossa equipe irá te atender 💗`);
});



// 🔒 FECHAR TICKET
client.on("messageCreate", async (message) => {
    try {
        if (!message.channel.name.startsWith("📩・ticket-")) return;
        if (message.author.bot) return;

        if (message.content.toLowerCase() === "!fechar") {

            const guild = message.guild;
            const archiveCategory = "1442642518842937577";

            const donoId = message.channel.topic;
            const dono = await guild.members.fetch(donoId).catch(() => null);

            if (!dono) {
                return message.reply("❌ Não foi possível identificar o dono do ticket.");
            }

            await message.channel.permissionOverwrites.edit(dono.id, {
                ViewChannel: false,
                SendMessages: false,
                ReadMessageHistory: false
            });

            await message.channel.setParent(archiveCategory);
            await message.channel.setName(`📁・arquivo-${dono.user.username}`);

            await message.channel.send(`
🔒 **Ticket fechado!**
📁 O cliente não pode mais ver o canal.
💗 Todas as mensagens foram arquivadas.`);
        }
    } catch (err) {
        console.error("Erro no fechamento:", err);
    }
});



app.listen(process.env.PORT || 3000, () => {
    console.log("API rodando na porta " + (process.env.PORT || 3000));
});

client.login(process.env.BOT_TOKEN);
