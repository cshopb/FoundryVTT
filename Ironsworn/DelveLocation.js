// CONFIG.debug.hooks = true;

async function rollOnTable(tableName) {
    const { results } = await game
        .tables
        .find(t => t.name === tableName)
        .roll();

    return results[0];
}

function printMessage(message) {
    message = `<h2>Delve Location</h2><p>${message}</p>`;

    const gm = game
        .users
        .filter(u => u.isGM)
        .map(u => u._id);

    const chatData = {
        user: game.user._id,
        content: message,
        whisper: gm
    };

    ChatMessage.create(
        chatData,
        {}
    );
}

function image(data) {
    const side = '40px';

    return `<img src="${data.img}" alt="${data.text}" width="${side}" height="${side}">`
}

function printLocation(actor) {
    const img = image(actor);

    printMessage(img + ' ' + actor.link);
}

function itemData(name) {
    return game
        .items
        .find(i => i.name === name)
        .data;
}

async function generateLocation() {
    const theme = await rollOnTable('Delve Theme');
    const domain = await rollOnTable('Delve Domain');

    const actor = await Actor.create(
        {
            'name': 'Site',
            'type': 'site',
            'img': domain.icon,
            'items': [
                itemData(theme.data.text),
                itemData(domain.data.text)
            ]
        }
    );

    printLocation(actor);
}

generateLocation();
