const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('Escanea este código QR con tu WhatsApp:');
});

client.on('ready', () => {
    console.log('¡El Oráculo de Gadam está en línea!');
});

// --- DICCIONARIO DE GIFS DE ACCIONES ---
const actionGifs = {
    'abrazar': [
        'https://c.tenor.com/eB4I2_39u40AAAAC/anime-hug.gif',
        'https://c.tenor.com/xIXVqQ0VwKAAAAAC/cute-hug-anime.gif',
        // ¡Añade más URLs de GIFs de abrazos aquí!
    ],
    'golpear': [
        'https://c.tenor.com/uGkH2-u3zV4AAAAC/anime-slap.gif',
        'https://c.tenor.com/w4l79vXmD4AAAAAC/anime-punch.gif',
        // ¡Añade más URLs de GIFs de golpes aquí!
    ],
    'sacar la lengua': [
        'https://c.tenor.com/eE_04_3j0qMAAAAC/anime-tongue.gif',
        'https://c.tenor.com/f2L1L8rYn4oAAAAC/anime-tongue-out.gif',
    ],
    'empujar': [
        'https://c.tenor.com/2XbFhD1V-vAAAAAC/anime-push.gif',
        'https://c.tenor.com/yFqG0Fq0_S8AAAAC/push-anime.gif',
    ],
    'cachetear': [ // Puedes usar los mismos que 'golpear' o buscar específicos de cachetadas
        'https://c.tenor.com/tHqX5-tU-vQAAAAC/anime-slap.gif',
        'https://c.tenor.com/o2b1XbIuT5oAAAAC/anime-slap-yato.gif',
    ],
    'besar': [
        'https://c.tenor.com/V6mG0D_-6CgAAAAC/anime-kiss.gif',
        'https://c.tenor.com/rN9kS2L-w3kAAAAC/anime-kiss-love.gif',
    ],
    'besamejilla': [
        'https://c.tenor.com/zVqS7j7D-1IAAAAC/anime-kiss-on-cheek.gif',
        'https://c.tenor.com/PysC9a_20Y8AAAAC/anime-kiss-cheek.gif',
    ],
    // Puedes añadir más acciones aquí
};

client.on('message', async (message) => {
    const msgTexto = message.body.toLowerCase();
    const chat = await message.getChat(); // Para poder enviar menciones

    // --- Comando de Bienvenida ---
    if(msgTexto === '!hola') {
        message.reply('Bienvenido a Gadam viajero, empezaras con 35 moneda, esperamos que tu estancia sea agradable');
    }

    // --- Comando de Stickers ---
    const stickerCommands = ['.sticker', '!sticker', '.s', '.image', '!image'];
    if (stickerCommands.includes(msgTexto) && message.hasMedia) {
        try {
            const media = await message.downloadMedia();
            client.sendMessage(message.from, media, {
                sendMediaAsSticker: true,
                stickerName: "Oráculo Bot",
                stickerAuthor: "Team Gadam"
            });
        } catch (error) {
            console.error('Error al crear sticker:', error);
            message.reply('No pude procesar el sticker, intenta de nuevo.');
        }
    }

    // --- Comandos de Acciones con GIFs ---
    const partesMensaje = msgTexto.split(' '); // Divide el mensaje para ver el comando y el objetivo
    const comando = partesMensaje[0]; // Ej: .abrazar
    const objetivo = partesMensaje.slice(1).join(' '); // El resto del mensaje (ej: @usuario)

    // Remueve el '.' o '!' inicial para buscar en nuestro diccionario de acciones
    const accionLimpia = (comando.startsWith('.') || comando.startsWith('!')) ? comando.substring(1) : comando;

    if (actionGifs[accionLimpia]) { // Si la acción existe en nuestro diccionario
        const gifs = actionGifs[accionLimpia];
        const randomGif = gifs[Math.floor(Math.random() * gifs.length)]; // Elige un GIF aleatorio

        let mensajeAccion = '';

        if (message.hasQuotedMsg) { // Si se está respondiendo a un mensaje
            const quotedMsg = await message.getQuotedMessage();
            if (quotedMsg.author) { // Si el mensaje citado tiene autor (no es tuyo)
                mensajeAccion = `*@${message.author.split('@')[0]}* ha ${accionLimpia} a *@${quotedMsg.author.split('@')[0]}*`;
                chat.sendMessage(new MessageMedia('image/gif', '', mensajeAccion), {
                    mentions: [message.author, quotedMsg.author] // Menciona a ambos
                });
            } else { // Si se responde a un mensaje sin autor (ej: un mensaje tuyo)
                mensajeAccion = `*@${message.author.split('@')[0]}* se ha ${accionLimpia} a sí mismo/a (o a alguien sin mención directa).`;
                chat.sendMessage(new MessageMedia('image/gif', '', mensajeAccion), {
                    mentions: [message.author]
                });
            }
        } else if (message.mentionedIds && message.mentionedIds.length > 0) { // Si se menciona a alguien en el mensaje
            const mentions = message.mentionedIds.map(id => `@${id.split('@')[0]}`).join(' y ');
            mensajeAccion = `*@${message.author.split('@')[0]}* ha ${accionLimpia} a ${mentions}`;
            chat.sendMessage(new MessageMedia('image/gif', '', mensajeAccion), {
                mentions: [message.author, ...message.mentionedIds]
            });
        } else { // Si no se menciona a nadie ni se responde
            mensajeAccion = `*@${message.author.split('@')[0]}* se ha ${accionLimpia} a sí mismo/a.`;
            chat.sendMessage(new MessageMedia('image/gif', '', mensajeAccion), {
                mentions: [message.author]
            });
        }

        // Envía el GIF
        try {
            await client.sendMessage(message.from, await MessageMedia.fromUrl(randomGif), { caption: mensajeAccion, mentions: [message.author] });
        } catch (error) {
            console.error(`Error al enviar GIF para ${accionLimpia}:`, error);
            message.reply('Lo siento, no pude enviar el GIF de la acción. Revisa la URL del GIF.');
        }
    }
});

client.initialize();

