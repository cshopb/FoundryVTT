/**
 * Returns a RollTable with the requested name.
 *
 * @param {String} tableName 
 *
 * @returns RollTable
 */
function findTable(tableName) {
    return game
        .tables
        .find(t => t.name === tableName);
}

/**
 * Rolls on the table and returns the result.
 *
 * @param {String} tableName 
 *
 * @returns TableResult
 */
async function rollOnTable(tableName) {
    const rollTable = findTable(tableName);

    const { results } = await rollTable
        .roll();

    return results[0].data.text;
}

/**
 * Prints the message to chat.
 *
 * @param {String} message 
 */
function printMessage(message) {
    message = `<h2>Adventure:</h2><p>${message}</p>`;

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

/**
 * Prints the adventure to chat.
 *
 * @param {Object} adventure
 */
function printAdventure(adventure) {
    const strong = (string) => {
        return `<strong>${string}</strong>`;
    }

    const message = `<p>
    The Adventurers must ${strong(adventure.verb)} the ${strong(adventure.subject)} in the ${strong(adventure.place)},
     while dealing with a ${strong(adventure.hindrance)} and opposing the ${strong(adventure.antagonist)}.
    </p>`;

    printMessage(message);
}

/**
 * Generates an Adventure.
 */
async function generateAdventure() {
    let adventure = {};

    adventure.verb = await rollOnTable(tableNames.verbs);
    adventure.subject = await rollOnTable(tableNames.subject);
    adventure.place = await rollOnTable(tableNames.place);
    adventure.hindrance = await rollOnTable(tableNames.hindrance);
    adventure.antagonist = await rollOnTable(tableNames.antagonist);

    printAdventure(adventure);
}

const tableNames = {
    verbs: 'Verbs',
    subject: 'Subject',
    place: 'Place',
    hindrance: 'Hindrance',
    antagonist: 'Antagonist'
}

const gm = game
    .users
    .filter(u => u.isGM)
    .map(u => u._id);

generateAdventure();