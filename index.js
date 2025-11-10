import { Client, GatewayIntentBits } from 'discord.js';

// Lê as variáveis de ambiente corretamente
const token = process.env.DISCORD_TOKEN;
const channelId = process.env.CHANNEL_ID;

if (!token) {
  console.error("❌ Nenhum DISCORD_TOKEN encontrado nas variáveis de ambiente!");
  process.exit(1);
}

if (!channelId) {
  console.error("❌ Nenhum CHANNEL_ID encontrado nas variáveis de ambiente!");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`✅ Bot logado como ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.channel.id === channelId && !message.author.bot) {
    console.log(`📩 Nova mensagem no canal monitorado: ${message.content}`);
  }
});

client.login(token).catch(err => {
  console.error("⚠️ Erro ao fazer login no Discord:", err.message);
});
