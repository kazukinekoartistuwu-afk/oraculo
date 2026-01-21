const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')

async function conectarBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth')
    
    const conn = makeWASocket({
        printQRInTerminal: true, // ESTO es lo que hace que salga el QR
        auth: state,
        browser: ["GadamBot", "Safari", "1.0.0"]
    })

    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            let shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) conectarBot()
        } else if (connection === 'open') {
            console.log('✅ Bot conectado con éxito a WhatsApp')
            
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')

async function conectarBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth')
    const conn = makeWASocket({ printQRInTerminal: true, auth: state, browser: ["GadamBot", "Safari", "1.0.0"] })

    conn.ev.on('creds.update', saveCreds)
    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            if ((lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut) conectarBot()
        } else if (connection === 'open') console.log('✅ Bot Online')
    })

    conn.ev.on('group-participants.update', async (anu) => {
        if (anu.action == 'add') {
            let metadata = await conn.groupMetadata(anu.id)
            for (let num of anu.participants) {
                let txt = `Bienvenido a Gadam viajero @${num.split('@')[0]}, empezarás con 35 monedas en tu recorrido.\n\n*Descripción:*\n${metadata.desc}`
                await conn.sendMessage(anu.id, { text: txt, mentions: [num, ...metadata.participants.map(v => v.id)] })
            }
        }
    })

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0]
        if (!m.message || m.key.fromMe) return
        const body = m.message.conversation || m.message.extendedTextMessage?.text || ""
        const from = m.key.remoteJid
        const command = body.split(' ')[0].toLowerCase()
        const mention = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const sender = m.key.participant || m.key.remoteJid

        const acciones = {
            '.golpear': { txt: 'golpeó a', gifs: ['https://media.tenor.com/E6S_NoGRphIAAAAC/anime-punch.gif', 'https://media.tenor.com/Ev97tX0_A_IAAAAC/anime-punch.gif'] },
            '.bleh': { txt: 'le hizo bleh a', gifs: ['https://media.tenor.com/86z_9zYV6-kAAAAC/anime-bleh.gif', 'https://media.tenor.com/W8N_S9YvS56IAAAAC/anime-tongue.gif'] },
            '.abrazar': { txt: 'abrazó a', gifs: ['https://media.tenor.com/9e1_z9vS56IAAAAC/anime-hug.gif', 'https://media.tenor.com/0PI_S9YvS56IAAAAC/anime-hug-sweet.gif'] },
            '.morder': { txt: 'mordió a', gifs: ['https://media.tenor.com/X-S9YvS56IAAAAC/anime-vampire-bite.gif', 'https://media.tenor.com/Y_S9YvS56IAAAAC/anime-wolf-bite.gif'] },
            '.besar': { txt: 'besó a', gifs: ['https://media.tenor.com/hK_S9YvS56IAAAAC/anime-kiss.gif', 'https://media.tenor.com/S_S9YvS56IAAAAC/anime-kiss-love.gif'] },
            '.mejilla': { txt: 'besó la mejilla de', gifs: ['https://media.tenor.com/pZ_S9YvS56IAAAAC/anime-cheek-kiss.gif', 'https://media.tenor.com/6_S9YvS56IAAAAC/anime-cheek.gif'] },
            '.empujar': { txt: 'empujó a', gifs: ['https://media.tenor.com/Y-S9YvS56IAAAAC/anime-push.gif', 'https://media.tenor.com/Z-S9YvS56IAAAAC/anime-shove.gif'] }
        }

        if (acciones[command]) {
            if (!mention) return
            const gif = acciones[command].gifs[Math.floor(Math.random() * acciones[command].gifs.length)]
            await conn.sendMessage(from, { video: { url: gif }, caption: `@${sender.split('@')[0]} ${acciones[command].txt} @${mention.split('@')[0]}`, gifPlayback: true, mentions: [sender, mention] })
        }
    })
}
conectarBot()

        // COMANDO MENCIONAR TODOS
        if (command === '.todos' || command === '@todos') {
            let metadata = await conn.groupMetadata(from)
            let texto = `📢 *ATENCIÓN A TODOS*\n\n`
            let menciones = metadata.participants.map(i => i.id)
            for (let i of metadata.participants) { texto += `┣ @${i.id.split('@')[0]}\n` }
            await conn.sendMessage(from, { text: texto, mentions: menciones })
        }

        const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const fs = require('fs')

// Base de datos simple
let db = { usuarios: {} }
if (fs.existsSync('./database.json')) db = JSON.parse(fs.readFileSync('./database.json'))
const saveDB = () => fs.writeFileSync('./database.json', JSON.stringify(db, null, 2))

async function conectarBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth')
    const conn = makeWASocket({ printQRInTerminal: true, auth: state, browser: ["GadamBot", "Safari", "1.0.0"] })

    conn.ev.on('creds.update', saveCreds)
    conn.ev.on('connection.update', (up) => {
        if (up.connection === 'close') {
            if ((up.lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut) conectarBot()
        } else if (up.connection === 'open') console.log('✅ Gadam Online')
    })

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const m = chatUpdate.messages[0]
        if (!m.message || m.key.fromMe) return
        const from = m.key.remoteJid
        const body = m.message.conversation || m.message.extendedTextMessage?.text || ""
        const command = body.split(' ')[0].toLowerCase()
        const args = body.split(' ')
        const sender = m.key.participant || m.key.remoteJid
        const mention = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

        // Inicializar usuario
        if (!db.usuarios[sender]) db.usuarios[sender] = { mano: 35, banco: 0, racha: 0, lastWork: 0, lastDiaria: 0 }
        let u = db.usuarios[sender]

        // .work (Cooldown 5 min)
        if (command === '.work') {
            if (Date.now() - u.lastWork < 300000) return conn.sendMessage(from, { text: "⏳ Estás cansado, viajero. Espera 5 minutos." })
            const trabajos = ["Cazaste un slime", "Escoltaste una caravana", "Limpiaste la taberna", "Forjaste una espada", "Recolectaste hierbas mágicas", "Derrotaste a un trasgo", "Exploraste una ruina", "Encantaste una armadura", "Pescaste en el lago lunar", "Entrenaste reclutas", "Reparaste el muro", "Cuidaste dragones", "Leíste pergaminos", "Vigilaste el bosque", "Cocinaste un festín"]
            const t = trabajos[Math.floor(Math.random() * trabajos.length)]
            u.mano += 10; u.lastWork = Date.now(); saveDB()
            await conn.sendMessage(from, { text: `⚒️ ${t}. ¡Ganaste 10 Dabloons!` })
        }

        // .service @user
        if (command === '.service') {
            if (!mention) return
            const frases = [`Serviste hidromiel a @user`, `Preparaste un estofado para @user`, `Atendiste la mesa de @user`, `Limpiaste la copa de @user`, `Recomendaste un vino a @user`, `Llevaste el pedido a @user`]
            u.mano += 10; saveDB()
            await conn.sendMessage(from, { text: `🍻 ${frases[Math.floor(Math.random() * frases.length)].replace('@user', '@' + mention.split('@')[0])} +10 Dabloons`, mentions: [mention] })
        }

        // .robar @user (55% éxito)
        if (command === '.robar') {
            if (!mention) return
            if (Math.random() < 0.55) {
                u.mano += 30; saveDB()
                await conn.sendMessage(from, { text: `🥷 ¡Robo exitoso a @${mention.split('@')[0]}! +30 Dabloons`, mentions: [mention] })
            } else {
                u.mano -= 20; saveDB()
                await conn.sendMessage(from, { text: `⚖️ ¡Te atraparon! Pagas 20 Dabloons de multa al reino.` })
            }
        }

        // .deposit y .retirar
        if (command === '.deposit') {
            u.banco += u.mano; u.mano = 0; saveDB()
            await conn.sendMessage(from, { text: `🏦 Dinero guardado en el banco.` })
        }
        if (command === '.retirar') {
            let cant = parseInt(args[1])
            if (cant > 50 || cant > u.banco) return
            u.mano += cant; u.banco -= cant; saveDB()
            await conn.sendMessage(from, { text: `💰 Retiraste ${cant} Dabloons.` })
        }

        // .diarias (Aumenta de 5 en 5)
        if (command === '.diarias') {
            if (Date.now() - u.lastDiaria < 86400000) return
            if (Date.now() - u.lastDiaria > 172800000) u.racha = 0
            u.racha++; let premio = 5 + (u.racha * 5)
            u.mano += premio; u.lastDiaria = Date.now(); saveDB()
            await conn.sendMessage(from, { text: `📅 Día ${u.racha}. ¡Recibiste ${premio} Dabloons!` })
        }

        // .adminabuse (Solo Admins)
        if (command === '.adminabuse') {
            const groupMetadata = await conn.groupMetadata(from)
            const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin
            if (!isAdmin) return
            let target = mention || sender; let cant = parseInt(args[2]) || 1000
            if (!db.usuarios[target]) db.usuarios[target] = { mano: 35, banco: 0, racha: 0, lastWork: 0, lastDiaria: 0 }
            db.usuarios[target].banco += cant; saveDB()
            await conn.sendMessage(from, { text: `⚡ Abuso de poder: +${cant} Dabloons para @${target.split('@')[0]}`, mentions: [target] })
        }
    })
}
conectarBot()


        // COMANDO: .taberna o .menutaberna
        if (command === '.taberna' || command === '.menutaberna') {
            const menuTxt = `『 𝓜𝖾𝗇ú 𝖽𝖾 𝗅𝖺 𝓣𝖺𝖻𝖾𝗋𝗇𝖺 𝖽𝖾𝗅 𝓒𝗋𝖾𝗆𝗂𝗈 』\n\n` +
                `*Bebidas:*\n` +
                `🍷 .valhala - Oro de Valhala (15 D)\n` +
                `🎵 .rocio - Rocío de la Alborada (10 D)\n` +
                `🍃 .te - Té de Hierbas (5 D)\n` +
                `💀 .viuda - Beso de la viuda (30 D)\n` +
                `🌑 .erebo - Velo de Erebo (10 D)\n` +
                `✨ .copa - Estelar en Copa (15 D)\n` +
                `👑 .rey - Aliento del Rey (18 D)\n` +
                `🍇 .uvas - Legado de las Uvas (15 D)\n` +
                `🔥 .invierno - Calor del Invierno (20 D)\n\n` +
                `*Comida General:*\n` +
                `🍰 .eclipse - Eclipse de Terciopelo (10 D)\n` +
                `🍣 .esquirlas - Esquirlas de Arrecife (15 D)\n` +
                `🌌 .nebulosa - Nebulosa en Reposo (10 D)\n` +
                `🍎 .corazones - Corazones de Gaia (17 D)\n` +
                `🦋 .suspiros - Suspiros de Psique (25 D)\n` +
                `❄️ .escarcha - Manzana de Escarcha (10 D)\n` +
                `🎃 .fulgor - Destilado de Fulgor (10 D)`
            await conn.sendMessage(from, { text: menuTxt })
        }

        // LÓGICA DE COMPRA AUTOMÁTICA
        const itemsTaberna = {
            '.valhala': { nombre: 'Oro de Valhala', precio: 15, efecto: 'Recuperas el 100% de tu energía.' },
            '.rocio': { nombre: 'Rocío de la Alborada', precio: 10, efecto: 'Tu voz ahora es clara como la de un bardo.' },
            '.te': { nombre: 'Té de Hierbas', precio: 5, efecto: 'Un té simple y reconfortante.' },
            '.viuda': { nombre: 'Beso de la viuda', precio: 30, efecto: 'Puedes hablar con espíritus (Cuidado con el contacto visual).' },
            '.erebo': { nombre: 'Velo de Erebo', precio: 10, efecto: 'Te has vuelto una sombra intangible.' },
            '.copa': { nombre: 'Estelar en Copa', precio: 15, efecto: 'Emites una luz que ciega a tus enemigos.' },
            '.rey': { nombre: 'Aliento del Rey', precio: 18, efecto: 'Tus órdenes deben ser obedecidas ahora.' },
            '.uvas': { nombre: 'Legado de las Uvas', precio: 15, efecto: 'Vino mágico de viñedos encantados.' },
            '.invierno': { nombre: 'Calor del Invierno', precio: 20, efecto: 'Piedras de fuego sutil calientan tu cuerpo.' },
            '.eclipse': { nombre: 'Eclipse de Terciopelo', precio: 10, efecto: 'Ves perfectamente en la oscuridad por 2 horas.' },
            '.esquirlas': { nombre: 'Esquirlas de Arrecife', precio: 15, efecto: 'Puedes respirar bajo el agua por 1 hora.' },
            '.nebulosa': { nombre: 'Nebulosa en Reposo', precio: 10, efecto: 'Estás flotando por 15 minutos.' },
            '.corazones': { nombre: 'Corazones de Gaia', precio: 17, efecto: 'Herida crítica estabilizada y euforia total.' },
            '.suspiros': { nombre: 'Suspiros de Psique', precio: 25, efecto: 'Tu peso se ha reducido a la mitad.' },
            '.escarcha': { nombre: 'Manzana de Escarcha', precio: 10, efecto: 'Eres semi-transparente y atraviesas paredes.' },
            '.fulgor': { nombre: 'Destilado de Fulgor', precio: 10, efecto: 'Ves el rastro de calor de los seres vivos.' }
        }

        if (itemsTaberna[command]) {
            const item = itemsTaberna[command]
            if (u.mano < item.precio) return await conn.sendMessage(from, { text: `❌ No tienes suficientes Dabloons en mano, viajero.` })
            
            u.mano -= item.precio
            saveDB()
            
            const ticket = `🎫 *TICKET DE LA TABERNA*\n\n` +
                `@${sender.split('@')[0]} acaba de pedir: *${item.nombre}*\n` +
                `💰 Costo: ${item.precio} Dabloons\n` +
                `✨ Efecto: ${item.efecto}\n\n` +
                `*¡Disfruta tu consumo en Gadam!*`
            
            await conn.sendMessage(from, { text: ticket, mentions: [sender] })
        }

        // COMANDO: .perfil mejorado
        if (command === '.perfil') {
            const total = u.mano + u.banco
            let rango = ""

            // Sistema de Rangos Expandido (Realeza y Poder)
            if (total < 50) rango = "🪹 Vagabundo del Gremio"
            else if (total < 150) rango = "🛖 Aldeano Principiante"
            else if (total < 350) rango = "⚔️ Escudero de Gadam"
            else if (total < 600) rango = "🛡️ Caballero Veterano"
            else if (total < 1000) rango = "🏰 Comandante Real"
            else if (total < 2000) rango = "👑 Duque de la Taberna"
            else if (total < 5000) rango = "💎 Príncipe de Gadam"
            else if (total < 10000) rango = "🔱 Monarca Supremo"
            else if (total < 20000) rango = "🤴 Emperador del Gremio"
            else if (total < 50000) rango = "✨ Deidad de la Fortuna"
            else rango = "🌌 Ser Trascendental de Gadam"

            // Obtener foto de perfil
            let ppUrl
            try { 
                ppUrl = await conn.profilePictureUrl(sender, 'image') 
            } catch { 
                ppUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' 
            }

            const perfilTxt = `🌟 *PERFIL DE GADAM* 🌟\n\n` +
                `👤 *Usuario:* @${sender.split('@')[0]}\n` +
                `🏅 *Rango:* ${rango}\n\n` +
                `💰 *Dabloons en Mano:* ${u.mano}\n` +
                `🏦 *Dabloons en Banco:* ${u.banco}\n` +
                `✨ *Patrimonio Total:* ${total}`

            await conn.sendMessage(from, { 
                image: { url: ppUrl }, 
                caption: perfilTxt, 
                mentions: [sender] 
            })
        }

        // COMANDO: .help o .menugeneral
        if (command === '.help' || command === '.menugeneral') {
            const menuG = `✨ *MENÚ GENERAL DE GADAM* ✨\n\n` +
                `🛡️ *ECONOMÍA Y TRABAJO*\n` +
                `┣ .work - Realiza un trabajo de fantasía (10 D)\n` +
                `┣ .diarias - Reclama tu recompensa diaria\n` +
                `┣ .service @user - Atiende a un viajero (10 D)\n` +
                `┣ .robar @user - Intenta un robo (55% éxito)\n\n` +
                `🏦 *BANCO Y ESTADO*\n` +
                `┣ .perfil - Mira tu rango, foto y dabloons\n` +
                `┣ .deposit - Guarda todo tu dinero en el banco\n` +
                `┣ .retirar [cantidad] - Saca hasta 50 dabloons\n` +
                `┣ .transfer @user [cant] - Envía dinero al banco de otro\n\n` +
                `🎭 *ACCIONES Y GRUPO*\n` +
                `┣ .todos - Menciona a todos los integrantes\n` +
                `┣ .taberna - Mira el menú de la Taberna del Gremio\n` +
                `┣ .abrazar, .golpear, .morder, .besar...\n` +
                `┗ .mejilla, .empujar, .bleh\n\n` +
                `*Usa los comandos con sabiduría, viajero.*`
            
            await conn.sendMessage(from, { text: menuG })
        }
