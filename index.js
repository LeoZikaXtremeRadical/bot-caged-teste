import fetch from "node-fetch";
import { Client, GatewayIntentBits } from "discord.js";
import * as cheerio from "cheerio"; // Importa o Cheerio

// Variáveis de ambiente
const token = process.env.DISCORD_TOKEN;
const channelId = process.env.CHANNEL_ID;

// Validação de segurança, mas sem o exit(1) inicial que causava o erro
if (!token || !channelId) {
    console.error("❌ As variáveis DISCORD_TOKEN e/ou CHANNEL_ID não foram carregadas corretamente.");
    console.error("O bot tentará logar, mas provavelmente falhará.");
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let ultimoValor = "";

async function verificar() {
    try {
        const urlCaged = "https://www.gov.br/trabalho-e-emprego/pt-br/assuntos_do_trabalho/caged/novo-caged/novo-caged";
        
        console.log(`Buscando dados em: ${urlCaged}`);

        // 1. Fazer a requisição e obter o HTML
        const response = await fetch(urlCaged);
        const html = await response.text();

        // 2. Carregar o HTML para análise com Cheerio
        const $ = cheerio.load(html);

        // 3. Encontrar o texto do mês de referência
        // Seletor CSS atual: Tenta pegar o texto em negrito dentro do 'callout' (caixa de destaque).
        // Se o site mudar, este seletor DEVE ser alterado.
        const textoMes = $(".callout > p strong").text().trim(); 

        if (!textoMes) {
            console.log("⚠️ Não foi possível encontrar o mês de referência com o seletor atual. Verifique o HTML do site.");
            return;
        }

        console.log(`Mês de referência atual encontrado: ${textoMes}`);

        if (ultimoValor && ultimoValor !== textoMes) {
            const canal = await client.channels.fetch(channelId);
            await canal.send(`⚠️ **ALERTA CAGED:** O mês de referência do Novo CAGED mudou! Novo mês: **${textoMes}**`);
        }

        ultimoValor = textoMes;

    } catch (error) {
        console.error("🔴 Erro na verificação do CAGED:", error);
    }
}

// Quando o bot logar
client.once("ready", () => {
    console.log(`✅ Bot logado como ${client.user.tag}`);
    // Executa a verificação imediatamente e depois a cada 10 minutos (600_000 ms)
    verificar();
    setInterval(verificar, 600_000); 
});

// Tentativa de login. Se o token for undefined, a promise será rejeitada
client.login(token)
    .catch(error => {
        console.error("🔴 Falha ao conectar o Bot ao Discord. O DISCORD_TOKEN está inválido ou ausente.");
        console.error(error.message);
    });

client.login(token);

