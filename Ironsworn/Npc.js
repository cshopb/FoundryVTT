// CONFIG.debug.hooks = true;

const genders = [
    {
        sign: 'M',
        pronoun: 'His',
    },
    {
        sign: 'F',
        pronoun: 'Her',
    },
    // {
    //     sign: 'N',
    //     pronoun: 'Their',
    // }
];

/**
 * Convert string to camel case.
 *
 * @param {string} str 
 * @returns string
 */
function toCamelCase(str) {
    return str.replace(
        /(?:^\w|[A-Z]|\b\w)/g,
        function(word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }
    )
    .replace(/\s+/g, '');
  }

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
 * Rolls on a table and returns the rolled result text.
 *
 * @param {RollTable} rollTable
 * @param {Boolean} firstRoll If it is not the first roll add the `and` infront of the result.
 *
 * @returns RollTableResult
 */
async function rollOnTable(rollTable, firstRoll = true) {
    const { results } = await rollTable.roll();

    let result = results[0].text;

    if (toCamelCase(result) === 'rollTwice') {
        const firstGoal = await rollOnTable(rollTable, false);
        const secondGoal = await rollOnTable(rollTable, false);

        result = `${firstGoal} and ${secondGoal}`;

        if (firstRoll === false) {
            result = ' and' + result;
        }
    }

    return result;
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

function linkGenerator(data) {
    return `@${data.collection}[${data.resultId}]{${data.text}}`
}

function image(data) {
    const side = '40px';

    return `<img src="${data.img}" alt="${data.text}" width="${side}" height="${side}">`
}

function npcHtml(npc) {
    const pronoun = npc.gender.pronoun;

    const strong = (string) => {
        return `<strong>${string}</strong>`;
    }

    const startsWithVowel = function (word) {
        return ['a', 'e', 'i', 'o', 'u'].some(
            (vowel) => {
                word = word.toLowerCase();

                return word.startsWith(vowel);
            }
        );
    };

    const descriptonString = (descripton) => {
        let a = 'a';

        if (startsWithVowel(descripton) === true) {
            a = 'an';
        }

        return `${a} ${strong(descripton)}`;
    }

    return `
        <h1>
            ${npc.name}
        </h1>
        <p>
            <em>
                ${npc.difficulty} <small>(${npc.gender.sign})</small>
            </em>
        </p>
        <br>
        <h3>Initial Description:</h3>
        <p>
            ${strong(npc.name)} is ${descriptonString(npc.description)} ${strong(npc.role)}.
            ${pronoun} current goal is to ${strong(npc.goal)}.
            ${pronoun} current stance toward you is ${strong(npc.disposition)}
        </p>
        <hr>
    `;
}

function saveNpc(npc) {
    JournalEntry.create(
        {
            name: npc.name,
            content: npcHtml(npc)
        }
    );
}

async function generateNpc() {
    const npc = {};

    npc.name = await rollOnTable(findTable('Oracle: Ironlander Names'));
    npc.difficulty = await rollOnTable(findTable('Character Difficulty'));
    npc.description = await rollOnTable(findTable('Oracle: Character Descriptor'));
    npc.role = await rollOnTable(findTable('Oracle: Character Role'));
    npc.goal = await rollOnTable(findTable('Oracle: Character Goal'));
    npc.disposition = await rollOnTable(findTable('Oracle: Character Disposition'));
    npc.gender = genders[Math.floor(Math.random() * genders.length)];

    printMessage(npcHtml(npc));

    new Dialog(
        {
            title: 'Save NPC to Journal',
            content: `Should ${npc.name} be saved in Journal`,
            buttons: {
                yes: {
                    icon: '<i class="fas fa-save"></i>',
                    label: 'Save NPC',
                    callback: () => {
                        saveNpc(npc);
                    }
                },
                no: {
                    icon: '<i class="fas fa-ban"></i>',
                    label: 'Cancel'
                },
            },
            default: 'yes'
        }
    ).render(true);
}

generateNpc();