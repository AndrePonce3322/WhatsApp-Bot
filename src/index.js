require('dotenv').config();
// OPENAI CONFIGURATION
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  // eslint-disable-next-line no-undef
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// WHATSAPP CONFIGURATION
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

// CLIENT CONFIGURATION
client.on('qr', (qr) => {
  console.log('Escanea el código QR con tu celular!');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Cliente listo!');
});

client.on('message', async (msg) => {
  const userMessages = msg.body.toLowerCase();

  const session_chats = {
    bot: [],
    user: [],
  };

  if (msg.body) {
    // Función para enviar y recibir mensajes
    session_chats.user.push(userMessages); // Almacena el mensaje del usuario en el historial

    // Envía el mensaje a la API de OpenAI y obtén la respuesta
    const chatCompletion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        ...session_chats.bot.map((message) => ({
          role: 'assistant',
          content: message,
        })),
        ...session_chats.user.map((message) => ({
          role: 'user',
          content: message,
        })),
      ],
    });

    const response = chatCompletion.data.choices[0].message.content;
    session_chats.bot.push(response); // Almacena la respuesta del bot en el historial
    client.sendMessage(msg.from, response);
  }
});

client.initialize();
