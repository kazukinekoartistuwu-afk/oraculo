const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const qrcode = require('qrcode-terminal')

// --- BASE DE DATOS ---
let db = { usuarios: {} }
if (fs.existsSync('./database.json')) db = JSON.parse(fs.readFileSync('./database.json'))
const saveDB = () => fs.writeFileSync('./database.json', JSON.stringify(db, null, 2))

async function conectarBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth')
    
    const conn = makeWASocket({
        auth: state,
        browser: ["GadamBot", "Safari", "1.0.0"]
    })

// --- MANEJO DE CONEXIÓN Y VINCULACIÓN ---
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        
        // MÉTODO POR CÓDIGO (Más fácil para Render)
        if (qr && !conn.authState.creds.registered) {
            let numero = "5516913647" 
            let codigo = await conn.requestPairingCode(numero)
            console.log(`\n\n🔗 TU CÓDIGO DE VINCULACIÓN ES: ${codigo}\n\n`)
        }

        if (connection === 'close') {
            let shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) conectarBot()
        } else if (connection === 'open') {
            console.log('✅ Gadam Online - Bot conectado con éxito')
        }
    })
            let shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) conectarBot()
        } else if (connection === 'open') {
            console.log('✅ Gadam Online - Bot conectado con éxito')
        }
    })

    conn.ev.on('creds.update', saveCreds)

    // --- BIENVENIDA ---
    conn.ev.on('group-participants.update', async (anu) => {
        if (anu.action == 'add') {
            let metadata = await conn.groupMetadata(anu.id)
            for (let num of anu.participants) {
                let txt = `Bienvenido a Gadam viajero @${num.split('@')[0]}, empezarás con 35 monedas en tu recorrido.\n\n*Descripción:*\n${metadata.desc}`
                await conn.sendMessage(anu.id, { text: txt, mentions: [num, ...metadata.participants.map(v => v.id)] })
            }
        }
    })

    // --- PROCESADOR DE MENSAJES ---
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

        // --- COMANDO TODOS ---
        if (command === '.todos' || command === '@todos') {
            let metadata = await conn.groupMetadata(from)
            let texto = `📢 *ATENCIÓN A TODOS*\n\n`
            let menciones = metadata.participants.map(i => i.id)
            for (let i of metadata.participants) { texto += `┣ @${i.id.split('@')[0]}\n` }
            await conn.sendMessage(from, { text: texto, mentions: menciones })
        }

        // --- ACCIONES CON GIFS ---
        const acciones = {
            '.golpear': { txt: 'golpeó a', gifs: ['https://media.tenor.com/E6S_NoGRphIAAAAC/anime-punch.gif', 'https://media.tenor.com/Ev97tX0_A_IAAAAC/anime-punch.gif'] },
            '.bleh': { txt: 'le hizo bleh a', gifs: ['https://media.tenor.com/86z_9zYV6-kAAAAC/anime-bleh.gif', 'https://media.tenor.com/W8N_S9YvS56IAAAAC/anime-tongue.gif'] },
            '.abrazar': { txt: 'abrazó a', gifs: ['https://media.tenor.com/9e1_z9vS56IAAAAC/anime-hug.gif', 'https://media.tenor.com/0PI_S9YvS56IAAAAC/anime-hug-sweet.gif'] },
            '.morder': { txt: 'mordió a', gifs: ['https://media.tenor.com/X-S9YvS56IAAAAC/anime-vampire-bite.gif', 'https://media.tenor.com/Y_S9YvS56IAAAAC/anime-wolf-bite.gif'] },
            '.besar': { txt: 'besó a', gifs: ['https://media.tenor.com/hK_S9YvS56IAAAAC/anime-kiss.gif', 'https://media.tenor.com/S_S9YvS56IAAAAC/anime-kiss-love.gif'] },
            '.mejilla': { txt: 'besó la mejilla de', gifs: ['https://media.tenor.com/pZ_S9YvS56IAAAAC/anime-cheek-kiss.gif', 'https://media.tenor.com/6_S9YvS56IAAAAC/anime-cheek.gif'] },
            '.empujar': { txt: 'empujó a', gifs: ['https://media.tenor.com/Y-S9YvS56IAAAAC/anime-push.gif', 'https://media.tenor.com/Z-S9YvS56IAAAAC/anime-shove.gif'] }
        }

        if (acciones[command] && mention) {
            const gif = acciones[command].gifs[Math.floor(Math.random() * acciones[command].gifs.length)]
            await conn.sendMessage(from, { video: { url: gif }, caption: `@${sender.split('@')[0]} ${acciones[command].txt} @${mention.split('@')[0]}`, gifPlayback: true, mentions: [sender, mention] })
        }

        // --- ECONOMÍA ---
        if (command === '.work') {
            if (Date.now() - u.lastWork < 300000) return conn.sendMessage(from, { text: "⏳ Estás cansado, viajero. Espera 5 minutos." })
            const trabajos = ["Cazaste un slime", "Escoltaste una caravana", "Limpiaste la taberna", "Forjaste una espada", "Recolectaste hierbas mágicas", "Derrotaste a un trasgo", "Exploraste una ruina", "Encantaste una armadura", "Pescaste en el lago lunar", "Entrenaste reclutas", "Reparaste el muro", "Cuidaste dragones", "Leíste pergaminos", "Vigilaste el bosque", "Cocinaste un festín"]
            const t = trabajos[Math.floor(Math.random() * trabajos.length)]
            u.mano += 10; u.lastWork = Date.now(); saveDB()
            await conn.sendMessage(from, { text: `⚒️ ${t}. ¡Ganaste 10 Dabloons!` })
        }

        if (command === '.service') {
            if (!mention) return
            const frases = [`Serviste hidromiel a @user`, `Preparaste un estofado para @user`, `Atendiste la mesa de @user`, `Limpiaste la copa de @user`, `Recomendaste un vino a @user`, `Llevaste el pedido a @user`]
            u.mano += 10; saveDB()
            await conn.sendMessage(from, { text: `🍻 ${frases[Math.floor(Math.random() * frases.length)].replace('@user', '@' + mention.split('@')[0])} +10 Dabloons`, mentions: [mention] })
        }

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

        if (command === '.deposit') {
            u.banco += u.mano; u.mano = 0; saveDB()
            await conn.sendMessage(from, { text: `🏦 Dinero guardado en el banco.` })
        }

        if (command === '.retirar') {
            let cant = parseInt(args[1])
            if (isNaN(cant) || cant > 50 || cant > u.banco) return conn.sendMessage(from, { text: "❌ Cantidad inválida (Límite: 50 D)." })
            u.mano += cant; u.banco -= cant; saveDB()
            await conn.sendMessage(from, { text: `💰 Retiraste ${cant} Dabloons.` })
        }

        if (command === '.diarias') {
            if (Date.now() - u.lastDiaria < 86400000) return conn.sendMessage(from, { text: "⏳ Ya reclamaste tu recompensa diaria." })
            if (Date.now() - u.lastDiaria > 172800000) u.racha = 0
            u.racha++; let premio = 5 + (u.racha * 5)
            u.mano += premio; u.lastDiaria = Date.now(); saveDB()
            await conn.sendMessage(from, { text: `📅 Día ${u.racha}. ¡Recibiste ${premio} Dabloons!` })
        }

        if (command === '.adminabuse') {
            const groupMetadata = await conn.groupMetadata(from)
            const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin
            if (!isAdmin) return
            let target = mention || sender; let cant = parseInt(args[2]) || 1000
            if (!db.usuarios[target]) db.usuarios[target] = { mano: 35, banco: 0, racha: 0, lastWork: 0, lastDiaria: 0 }
            db.usuarios[target].banco += cant; saveDB()
            await conn.sendMessage(from, { text: `⚡ Abuso de poder: +${cant} Dabloons para @${target.split('@')[0]}`, mentions: [target] })
        }

        // --- TABERNA ---
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

        const itemsTaberna = {
            '.valhala': { nombre: 'Oro de Valhala', precio: 15, efecto: 'Recuperas el 100% de tu energía.' },
            '.rocio': { nombre: 'Rocío de la Alborada', precio: 10, efecto: 'Tu voz ahora es clara.' },
            '.te': { nombre: 'Té de Hierbas', precio: 5, efecto: 'Un té reconfortante.' },
            '.viuda': { nombre: 'Beso de la viuda', precio: 30, efecto: 'Hablas con espíritus.' },
            '.erebo': { nombre: 'Velo de Erebo', precio: 10, efecto: 'Eres una sombra.' },
            '.copa': { nombre: 'Estelar en Copa', precio: 15, efecto: 'Emites luz cegadora.' },
            '.rey': { nombre: 'Aliento del Rey', precio: 18, efecto: 'Órdenes obedecidas.' },
            '.uvas': { nombre: 'Legado de las Uvas', precio: 15, efecto: 'Vino mágico.' },
            '.invierno': { nombre: 'Calor del Invierno', precio: 20, efecto: 'Piedras de fuego.' },
            '.eclipse': { nombre: 'Eclipse de Terciopelo', precio: 10, efecto: 'Ves en la oscuridad.' },
            '.esquirlas': { nombre: 'Esquirlas de Arrecife', precio: 15, efecto: 'Respiras bajo el agua.' },
            '.nebulosa': { nombre: 'Nebulosa en Reposo', precio: 10, efecto: 'Estás flotando.' },
            '.corazones': { nombre: 'Corazones de Gaia', precio: 17, efecto: 'Euforia total.' },
            '.suspiros': { nombre: 'Suspiros de Psique', precio: 25, efecto: 'Peso reducido.' },
            '.escarcha': { nombre: 'Manzana de Escarcha', precio: 10, efecto: 'Atraviesas paredes.' },
            '.fulgor': { nombre: 'Destilado de Fulgor', precio: 10, efecto: 'Ves calor.' }
        }

        if (itemsTaberna[command]) {
            const item = itemsTaberna[command]
            if (u.mano < item.precio) return await conn.sendMessage(from, { text: `❌ No tienes suficientes dabloons.` })
            u.mano -= item.precio; saveDB()
            const ticket = `🎫 *TICKET*\n\n@${sender.split('@')[0]} pidió: *${item.nombre}*\n💰 Costo: ${item.precio}\n✨ Efecto: ${item.efecto}`
            await conn.sendMessage(from, { text: ticket, mentions: [sender] })
        }

        // --- PERFIL ---
        if (command === '.perfil') {
            const total = u.mano + u.banco
            let rango = total < 50 ? "🪹 Vagabundo" : total < 150 ? "🛖 Aldeano" : total < 350 ? "⚔️ Escudero" : total < 1000 ? "🏰 Comandante" : "🌌 Ser Trascendental"
            let ppUrl; try { ppUrl = await conn.profilePictureUrl(sender, 'image') } catch { ppUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' }
            const perfilTxt = `🌟 *PERFIL*\n👤 @${sender.split('@')[0]}\n🏅 Rango: ${rango}\n💰 Mano: ${u.mano}\n🏦 Banco: ${u.banco}`
            await conn.sendMessage(from, { image: { url: ppUrl }, caption: perfilTxt, mentions: [sender] })
        }

        // --- MENÚ AYUDA ---
        if (command === '.help' || command === '.menugeneral') {
            const menuG = `✨ *MENÚ GADAM*\n\n🛡️ *ECONOMÍA*\n.work, .diarias, .service, .robar\n\n🏦 *BANCO*\n.perfil, .deposit, .retirar\n\n🎭 *GRUPO*\n.todos, .taberna, .abrazar...`
            await conn.sendMessage(from, { text: menuG })
        }
    })
}

conectarBot()
