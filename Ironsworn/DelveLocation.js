// CONFIG.debug.hooks = true;

/**
 * Generates a HTML select box.
 *
 * @param {String} label 
 * @param {String[]} options 
 * @param {String} id 
 *
 * @returns String
 */
function selectBox(label, options, id) {
    let optionsHtml = '';

    _.forEach(
        options,
        (option) => {
            optionsHtml += `<option value="${option}">${option}</option>`;
        }
    );


    return `
    <label for="${id}">${label}</label>
    <select name="${id}" id="${id}">
        ${optionsHtml}
    </select>
    `;
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

    return results[0];
}

/**
 * Returns a specific TableResult based on its text value.
 *
 * @param {String} tableName
 * @param {String} tableResultText
 *
 * @returns TableResult
 */
function getSpecificTableResult(tableName, tableResultText) {
    const rollTable = findTable(tableName);

    return rollTable
        .results
        .find(r => r.data.text = tableResultText);
}

/**
 * Returns all the options of a RollTable as an array of strings.
 *
 * @param {String} tableName
 *
 * @returns String[]
 */
function getTableResultTexts(tableName) {
    return findTable(tableNames.domain)
        .data
        .results
        .map(r => r.data.text);
}

/**
 * Prints the message to chat.
 *
 * @param {String} message 
 */
function printMessage(message) {
    message = `<h2>Delve Location</h2><p>${message}</p>`;

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
 * Generates the image HTML tag.
 *
 * @param {TableResult} data 
 *
 * @returns String
 */
function image(data) {
    const side = '40px';

    return `<img src="${data.img}" alt="${data.text}" width="${side}" height="${side}">`
}

/**
 * Prints the Actor to chat with the image that the actor has.
 *
 * @param {Actor} actor 
 */
function printLocation(actor) {
    const img = image(actor);

    printMessage(img + ' ' + actor.link);
}

/**
 * Retutns the date of the item with the requested name.
 *
 * @param {String} name Name of the item.
 *
 * @returns Object
 */
function itemData(name) {
    return game
        .items
        .find(i => i.name === name)
        .data;
}

/**
 * Generate a Site Name.
 *
 * @param {String} domainName
 *
 * @returns String
 */
async function generateSiteName(domainName) {
    const { data: format } = await rollOnTable(tableNames.siteNameFormat);

    let name = format.text;

    const tables = name.match(/\[[A-Z]+[a-z]+\]/g);

    for (const table of tables) {
        let tableName = table.match(/[A-Z]+[a-z]+/g)[0];

        if (tableName === 'Place') {
            tableName = 'Place-' + domainName;
        }

        const { data: value } = await rollOnTable(tableNames.siteNameDefault + tableName);

        name = name.replace(
            table,
            value.text
        );
    }

    return name;
}

/**
 * Generates a Delve Site.
 *
 * @param {String} domainName
 */
async function generateSite(domainName) {
    let domain = {};

    if (domainName === 'Random') {
        domain = await rollOnTable(tableNames.domain);
    } else {
        domain = getSpecificTableResult(tableNames.domain, domainName);
    }

    const theme = await rollOnTable(tableNames.theme);
    const name = await generateSiteName(domain.data.text);

    const actor = await Actor.create(
        {
            name,
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

const tableNames = {
    siteNameFormat: 'Site Name: Format',
    siteNameDefault: 'Site Name: ',
    domain: 'Delve Domain',
    theme: 'Delve Theme',
}

const gm = game
    .users
    .filter(u => u.isGM)
    .map(u => u._id);

new Dialog({
    title: 'Create Roll Table',
    content: selectBox(
        'Select Domain',
        [
            'Random',
            ...getTableResultTexts(tableNames.domain)
        ],
        'domain'
    ),
    buttons: {
        yes: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Apply Changes',
            callback: () => {
                const tableName = document.querySelector('#domain').value;

                generateSite(tableName);
            }
        }
    },
    defaultYes: false
}).render(true);