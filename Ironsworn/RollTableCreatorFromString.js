const data = '';

function createTableResults(data) {
    const ranges = data.match(/\d+-\d+/g);
    const values = data.match(/[A-Z]+[a-z]+/g);

    tableResults = [];

    _.forEach(
        values,
        (tableResultText, index) => {
            let [min, max] = ranges[index].split('-');

            if (max === '00') {
                max = '100';
            }

            const tableResult = {
                text: tableResultText,
                range: [
                    parseInt(min),
                    parseInt(max)
                ],
                weight: 1
            }

            tableResults.push(tableResult);
        }
    );

    return tableResults;
}

async function createRollTable(data, name, formula = null) {
    name = _.startCase(_.camelCase(name));

    const rollTable = await RollTable.create({ name });

    const results = createTableResults(data);

    if (!formula) {
        formula = '1d' + _.last(results).range[1];
    }

    const json = {
        name,
        results,
        formula
    };

    rollTable.importFromJSON(JSON.stringify(json));
}

new Dialog({
    title: 'Create Roll Table',
    content: `
    <div>
        <label for="tableName">Name of the Table</label>
        <input id="tableName" type="text" name="tableName"></input>
    </div>
    <div>
        <label for="diceFormula">Dice formula</label>
        <input id="diceFormula" type="text" name="diceFormula"></input>
    </div>
    <div>
        <label for="tableData">Table from Rulebook</label>
        <textarea
            id="tableData"
            name="tableData"
            rows="10"
            style="resize:none"
        ></textarea>
    </div>`,
    buttons: {
        yes: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Apply Changes',
            callback: (html) => {
                const tableName = html.find('input[name="tableName"]').val() || 'TempName';
                const diceFormula = html.find('input[name="diceFormula"]').val();
                const tableData = html.find('textarea[name="tableData"]').val();

                createRollTable(tableData, tableName, diceFormula);
            }
        }
    },
    defaultYes: false
}).render(true);