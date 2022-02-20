// CONFIG.debug.hooks = true;

async function rollOnTable(tableName) {
    console.dir(tableName);
    const { results } = await game
        .tables
        .find(t => t.name === tableName)
        .roll();

    return results[0].data.text;
}

function printMessage(message) {
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

function linkGenerator({ data }) {
    return `@${data.collection}[${data.resultId}]{${data.text}}`
}

function image({ data }) {
    const side = '40px';

    return `<img src="${data.img}" alt="${data.text}" width="${side}" height="${side}">`
}

function printNpc(npc) {
    let pronoun = npc.gender === 'M' ? 'His' : 'Her';

    let message = `<h2>${npc.name}</h2>`;
    message += `<em>${npc.difficulty}</em>`;
    message += '<hr>';
    message += `<p>${npc.name} is a ${npc.difficulty} ${npc.description} ${npc.role}. ${pronoun} current goal is to ${npc.goal}. ${pronoun} current stance toward you is ${npc.disposition}</p>`;

    printMessage(message);
}

async function generateNpc() {
    const npc = {};

    npc.name = await rollOnTable('Oracle: Ironlander Names');
    npc.difficulty = await rollOnTable('Character Difficulty');
    npc.description = await rollOnTable('Oracle: Character Descriptor');
    npc.role = await rollOnTable('Oracle: Character Role');
    npc.goal = await rollOnTable('Oracle: Character Goal');
    npc.disposition = await rollOnTable('Oracle: Character Disposition');
    npc.gender = _.sample(['M', 'F']);

    printNpc(npc);
}

generateNpc();