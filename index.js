import fetch from "node-fetch";
import { Client, GatewayIntentBits } from "discord.js";
import fs from "fs";

// === CONFIGURAÇÃO ===
const DISCORD_TOKEN = "TEU_TOKEN_AQUI"; // token do bot
const CHANNEL_ID = "ID_DO_CANAL_AQUI"; // canal onde o bot vai avisar
const URL = "https://api.coindesk.com/v1/bpi/currentprice.json"; // site de teste
// =====================

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function verificar() {
  try {
    const data = await fetch(URL).then(r => r.json());
    const preco = data.bpi.USD.rate_float;
    const ultimoPreco = fs.existsSync("ultimo.txt")
      ? parseFloat(fs.readFileSync("ultimo.txt", "utf8"))
      : 0;

    // Se mudou mais que 0.1% do último valor, notifica
    if (Math.abs(preco - ultimoPreco) / ultimoPreco > 0.001) {
      fs.writeFileSync("ultimo.txt", preco.toString());
      const canal = await client.channels.fetch(CHANNEL_ID);
      canal.send(
        `💰 O preço do Bitcoin mudou!\nNovo valor: **$${preco.toFixed(2)} USD**`
      );
      console.log(`🔔 Mudança detectada: $${preco.toFixed(2)}`);
    } else {
      console.log("Nenhuma mudança significativa detectada.");
    }
  } catch (err) {
    console.error("Erro ao verificar:", err);
  }
}

// Quando o bot conecta
client.once("ready", () => {
  console.log(`✅ Bot logado como ${client.user.tag}`);
  verificar();
  setInterval(verificar, 1000 * 60 * 5); // a cada 5 minutos
});

client.login(DISCORD_TOKEN);
