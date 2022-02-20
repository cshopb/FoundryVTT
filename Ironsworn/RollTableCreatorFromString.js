const data = '';

function createTableResults(data) {
    const ranges = data.match(/\d+-\d+/g);
    const values = data.match(/[A-Z]+[a-z]+/g);

    tableResults = [];

    _.forEach(
        values,
        (tableResultText, index) => {
            let [min, max] = ranges[index].split('-');
            console.dir(min);
            console.dir(max);

            if(max === '00') {
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

async function createRollTable(data, name, formula) {
    name = _.startCase(_.camelCase(name));

    name = 'Site Name: Place-' + name;

    const rollTable = await RollTable.create({ name });

    const results = createTableResults(data);

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
    <form>
        <div class="form-group">
            <div>
                <label>Name of the Table</label>
                <input type='text' name='tableName'></input>
            </div>
            <div>
                <label>Dice size</label>
                <input type='text' name='diceFormula'></input>
            </div>
            <div>
                <label>Table from Rulebook</label>
                <textarea name='tableData'></textarea>
            </div>
        </div>
    </form>`,
    buttons: {
        yes: {
            icon: "<i class='fas fa-check'></i>",
            label: `Apply Changes`,
            callback: (html) => {
                const tableName = html.find("input[name='tableName']").val() || 'TempName';
                const diceFormula = html.find("input[name='diceFormula']").val() || 100;
                const tableData = html.find("textarea[name='tableData']").val();
        
                createRollTable(tableData, tableName, diceFormula);
            }
        }
    },
    defaultYes: false
}).render(true);