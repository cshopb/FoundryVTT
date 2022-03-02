function createTableResults(data, rangeMultiplyer) {
    const maxRange = function (currentIndex) {
        return currentIndex * rangeMultiplyer;
    }

    const minRange = function (currentIndex) {
        return (currentIndex * rangeMultiplyer) - (rangeMultiplyer - 1);
    }

    tableResults = [];

    _.forEach(
        data,
        (tableResultText, index) => {
            const currentIndex = index + 1;

            const tableResult = {
                text: tableResultText,
                range: [
                    minRange(currentIndex),
                    maxRange(currentIndex)
                ],
                weight: 1
            }

            tableResults.push(tableResult);
        }
    );

    return tableResults;
}

/**
 * Create Roll Table from array.
 *
 * @param {Array} data Data for the table
 * @param {String} name Name of the table
 * @param {Number} rangeMultiplyer How many values on the die shall be added to one option.
 *                                 I.e. if 3 than the first option on the table will go from 1-3.
 */
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

function generateTable() {
    new Dialog(
        {
            title: 'Generate new table.',
            content: `
            <div>
                <label for="tableName">Name of the Table</label>
                <input id="tableName" type="text" name="tableName"></input>
            </div>
            <div>
            <label for="rangeMultiplyer">Range Multiplyer</label>
                <input id="rangeMultiplyer" type="text" name="rangeMultiplyer"></input>
            </div>
            <div>
                <label for="tableData">CSV</label>
                <textarea
                    id="tableData"
                    name="tableData"
                    rows="10"
                    style="resize:none"
                ></textarea>
            </div>`,
            buttons: {
                yes: {
                    icon: '<i class="fas fa-save"></i>',
                    label: 'Save Table',
                    callback: (html) => {
                        const tableName = html.find('input[name="tableName"]').val() || 'TempName';
                        const rangeMultiplyer = html.find('input[name="rangeMultiplyer"]').val() || 1;
                        let tableData = html.find('textarea[name="tableData"]').val();

                        tableData = tableData.split(',');

                        createRollTable(tableData, tableName, rangeMultiplyer);
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

generateTable();
