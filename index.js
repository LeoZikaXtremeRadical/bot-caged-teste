import fetch from "node-fetch";
import { Client, GatewayIntentBits } from "discord.js";

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.CHANNEL_ID;

// Verifica se o token e o canal estão definidos
if (!token) {
  console.error("❌ Nenhum DISCORD_TOKEN encontrado nas variáveis de ambiente!");
  process.exit(1);
}

if (!channelId) {
  console.error("❌ Nenhum CHANNEL_ID encontrado nas variáveis de ambiente!");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let ultimoValor = "";

async function verificar() {
  try {
    const response = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json");
    console.log("Status da resposta:", response.status);

    const data = await response.json();
    const valor = data.bpi.USD.rate;

    if (ultimoValor && ultimoValor !== valor) {
      const canal = await client.channels.fetch(channelId);
      await canal.send(`💰 O valor do Bitcoin mudou! Novo valor: **${valor} USD**`);
    }

    ultimoValor = valor;
  } catch (error) {
    console.error("Erro na verificação:", error);
  }
}

// Quando o bot logar
client.once("ready", () => {
  console.log(`✅ Bot logado como ${client.user.tag}`);
  verificar();
  setInterval(verificar, 60_000); // 1 minuto
});

client.login(token);
