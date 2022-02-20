const data = [
    'Deep',
    'Tainted',
    'Grey',
    'Forgotten',
    'Flooded',
    'Forbidden',
    'Barren',
    'Lost',
    'Cursed',
    'Fell',
    'Sunken',
    'Nightmare',
    'Infernal',
    'Dark',
    'Bloodstained',
    'Haunted',
    'White',
    'Shrouded',
    'Wasted',
    'Grim',
    'Endless',
    'Crumbling',
    'Undying',
    'Bloodied',
    'Forsaken',
    'Silent',
    'Blighted',
    'Iron',
    'Frozen',
    'Abyssal',
    'Crimson',
    'Silver',
    'Desecrated',
    'Ashen',
    'Elder',
    'Scorched',
    'Unknown',
    'Scarred',
    'Broken',
    'Chaotic',
    'Black',
    'Hidden',
    'Sundered',
    'Shattered',
    'Dreaded',
    'Secret',
    'High',
    'Sacred',
    'Fallen',
    'Ruined',
];

function createTableResults(data, rangeMultiplyer) {
    const maxRange = function (currentIndex) {
        currentIndex++;
        return currentIndex * rangeMultiplyer;
    }

    const minRange = function (currentIndex) {
        currentIndex++;
        return (currentIndex * rangeMultiplyer) - (rangeMultiplyer - 1);
    }

    tableResults = [];

    _.forEach(
        data,
        (tableResultText, index) => {

            const tableResult = {
                text: tableResultText,
                range: [
                    minRange(index),
                    maxRange(index)
                ],
                weight: 1
            }

            tableResults.push(tableResult);
        }
    );

    return tableResults;
}

async function createRollTable(data, name, rangeMultiplyer) {
    const formula = '1d' + (data.length * rangeMultiplyer);

    const rollTable = await RollTable.create(
        {
            name
        }
    );

    const results = createTableResults(data, rangeMultiplyer);

    const json = {
        name,
        results,
        formula
    };

    rollTable.importFromJSON(JSON.stringify(json));
}

createRollTable(data, 'Test', 2);