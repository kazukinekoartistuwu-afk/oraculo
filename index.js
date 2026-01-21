const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth() // Guarda la sesión para no escanear cada vez
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('Escanea este código QR con tu WhatsApp:');
});

client.on('ready', () => {
    console.log('¡El Oráculo de Gadam está en línea!');
});

client.on('message', message => {
    if(message.body.toLowerCase() === '!hola') {
        message.reply('Bienvenido a Gadam viajero, empezaras con 35 moneda, esperamos que tu estancia sea agradable');
    }
});

client.initialize();
