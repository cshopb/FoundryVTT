// CONFIG.debug.hooks = true;

/**
 * Returns the Foundry object that we are looking for by name.
 *
 * @param {String} objectType Type of the object to look for
 * @param {String} objectName Name of the object
 *
 * @returns Object
 */
function findFoundryObject(objectType, objectName) {
    return game
        [objectType]
        .find(o => o.name === objectName);
}

/**
 * Rolls on the table and returns the result.
 *
 * @param {String} tableName 
 *
 * @returns TableResult
 */
async function rollOnTable(tableName) {
    const rollTable = findFoundryObject('tables', tableName);

    const { results } = await rollTable
        .roll();

    return results[0];
}

/**
 * Execuet Macro
 *
 * @param {String} macroName Name of the macro to execute
 */
async function executeMacro(macroName) {
    const macro = findFoundryObject('macros', macroName);

    const foo = await macro.execute();

    console.dir(foo);

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

function settlementHtml(settlement) {
    const strong = (string) => {
        return `<strong>${string}</strong>`;
    }

    let html = `
        <h1>
            ${settlement.name}
        </h1>
        <h3>
            ${strong('Descriptor: ')} ${settlement.descriptor}
        </h3>
        <h3>
            ${strong('Trouble: ')} ${settlement.trouble}
        </h3>
        <h3>
            ${strong('Leader: ')} ${linkGenerator(settlement.leader)}
        </h3>
        <h3>
            ${strong('Other Actors: ')}
        </h3>
    `;

    _.forEach(
        settlement.otherActors,
        (actor) => {
            html += `
            <p>
                ${linkGenerator(actor)}
            </p>
            `;
        }
    );

    return html;
}

function saveNpc(npc) {
    JournalEntry.create(
        {
            name: npc.name,
            content: npcHtml(npc)
        }
    );
}

async function generateSettlement() {
    const settlement = {};

    settlement.name = await rollOnTable(tableNames.settlementName);
    settlement.descriptor = await rollOnTable(tableNames.locationDescriptor);
    settlement.trouble = await rollOnTable(tableNames.settlementTrouble);
    settlement.leader = await executeMacro(macros.npc);
    settlement.actors = [];

    const numberOfActors = _.random(5);

    for (i = 0; i <= numberOfActors; i++) {
        settlement.actors.push(
            await executeMacro(macros.npc)
        );
    }

    printMessage(settlementHtml(settlement));

    new Dialog(
        {
            title: 'Save Settlement to Journal',
            content: 'Should the Settlement be saved in Journal',
            buttons: {
                yes: {
                    icon: '<i class="fas fa-save"></i>',
                    label: 'Save Settlement',
                    callback: () => {
                        saveSettlement(settlement);
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

const tableNames = {
    settlementName: 'Site Name: Format',
    locationDescriptor: 'Oracle: Location Descriptor',
    settlementTrouble: 'Oracle: Settlement Trouble'
};

const macros = {
    npc: 'Generate NPC'
}

generateSettlement();