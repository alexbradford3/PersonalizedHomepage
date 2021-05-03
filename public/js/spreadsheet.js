document.querySelector('#spreadsheet-submit').addEventListener('click', function(event) {
    event.preventDefault();
    
    var formData = new FormData(); 
    var csv = document.getElementById('expenseFile').files[0];
    formData.append("expenseFile", csv); 
    axios.post("/api/loadCSVExpenses", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(d => {
        displayExpenses(d.data, 'csv');
    });
});

document.querySelector('#ynab-submit').addEventListener('click', function(event) {
    event.preventDefault();
    var dates = {
        startDate: document.querySelector('#start').value,
        endDate: document.querySelector('#end').value
    }
    axios.post("/api/loadYnabExpenses", {dates}).then(d => {
        displayExpenses(d.data, 'ynab')
        document.querySelector('#expense-all-button').classList.remove('hidden')
    })
})

var formSwitch = document.querySelector('.switch-input')
formSwitch.onchange = function() {
    if (formSwitch.checked) {
        document.querySelector('#csv-form').classList.remove('hidden')
        document.querySelector('#ynab-form').classList.add('hidden')
    } else {
        document.querySelector('#csv-form').classList.add('hidden')
        document.querySelector('#ynab-form').classList.remove('hidden')
    }
}

function displayExpenses(data, formType) {
    buildTable();
    displaySplitwiseGroups();
    fillTableData(data, formType);
}

function buildTable() {
    var tableDiv = document.querySelector('#expense-table-div');
    var table = document.createElement('table');
    table.setAttribute('id', 'expense-table');
    var headingRow = document.createElement('tr');
    var headings = ['Date', 'Company', 'Splitwise Amount', 'Note', 'Total Amount'];
    for (var i = 0; i < headings.length; i++) {
        var heading = document.createElement('th');
        var headingText = document.createTextNode(headings[i]);
        heading.appendChild(headingText);
        headingRow.appendChild(heading);
    }
    table.appendChild(headingRow);
    tableDiv.appendChild(table);
}

function displaySplitwiseGroups() {
    var splitwiseDiv = document.querySelector('#splitwise-groups');
    var label = document.createElement('label');
    label.htmlFor = 'groups';
    label.innerHTML = 'Select which splitwise group to expense to:';

    var dropdown = document.createElement('select');
    dropdown.name = 'groups';
    dropdown.id = 'splitwise-group-dropdown';

    splitwiseDiv.appendChild(label);
    splitwiseDiv.appendChild(dropdown);

    axios.post("/api/loadSplitwiseGroups").then(d => {
        populateGroupsDropdown(d.data, dropdown);
    });

}

function populateGroupsDropdown(data, dropdown) {
    for (var i = 0; i < data.length; i++) {
        var option = document.createElement('option');
        option.id = data[i].id;
        option.value = data[i].name;
        option.innerHTML = data[i].name;

        dropdown.appendChild(option);
    }
}

function fillTableData(data, formType) {
    var tableDiv = document.getElementById('expense-table');
    for (var i = 0; i < data.length; i++) {
        var row = tableDiv.insertRow();
        createDataRow(data[i], row, formType);
        tableDiv.appendChild(row);
    }
}

function createDataRow(expense, row, dataType) {
    if (dataType == 'csv') {
        var targetKeys = ['Description', 'Date', 'Amount', 'Notes', "Total Amount"];

        for (key in expense) {
            if (targetKeys.includes(key)) {
                var cell = row.insertCell();
                var textValue = expense[key];
                var form = document.createElement('form');
                var input = document.createElement('input');
                input.type = 'text';
                input.setAttribute('value', textValue);
                form.appendChild(input);
                cell.appendChild(form);
                cell.classList.add('centered');
            }
        }
    } else {
        var targetKeys = ['date', 'payee_name', 'amount', 'memo', 'total_cost']

        for (var i = 0; i < targetKeys.length; i++) {
            var cell = row.insertCell();
            var textValue = expense[targetKeys[i]];
            var form = document.createElement('form');
            var input = document.createElement('input');
            input.type = 'text';
            input.setAttribute('value', textValue);
            form.appendChild(input);
            cell.appendChild(form);
            cell.classList.add('centered');
        }
    }
    

    addButtonForm(row, 'delete');
    addButtonForm(row, 'expense');
}

function addButtonForm(tableRow, method) {
    var cell = tableRow.insertCell();
    var form = document.createElement('form');
    var button = document.createElement('input');
    var id = document.createElement('input');
    form.appendChild(button);
    cell.appendChild(form);
    button.setAttribute('type', 'button');
    button.setAttribute('value', method);
    if (method === 'delete') {
        button.setAttribute('onClick', 'deleteRow(this)');
    } else {
        button.setAttribute('onClick', 'expenseRow(this)');
    }
    cell.classList.add('tableButtons');
}

function deleteRow(deleteCell) {
    var row = deleteCell.parentNode.parentNode.parentNode
    row.parentNode.removeChild(row);
}

function expenseRow(rowCell, skipConfirm) {
    var expense = {};
    var dropdown = document.querySelector('#splitwise-group-dropdown');
    var row = rowCell.parentNode.parentNode.parentNode;

    var date = new Date(row.childNodes[0].childNodes[0].childNodes[0].value)
    date.setSeconds(date.getSeconds() + 10)
    date.toISOString();
    expense.date = date;
    expense.description = row.childNodes[1].childNodes[0].childNodes[0].value;
    expense.owedShare = row.childNodes[2].childNodes[0].childNodes[0].value;
    expense.note = row.childNodes[3].childNodes[0].childNodes[0].value;
    expense.groupId = dropdown.options[dropdown.selectedIndex].id;
    expense.totalShare = row.childNodes[4].childNodes[0].childNodes[0].value;
    
    axios.post("/api/createExpense", expense).then(d => {
        if (d.status == 200 || d.status == 204) {
            if (d.status == 200) {
                if (!skipConfirm) {
                    alert('expense was successfully created');
                } 
            } else if (d.status == 204) {
                alert('expense has already been submitted');
            }
            for (var i = 0; i < 5; i++) {
                row.childNodes[i].childNodes[0].childNodes[0].classList.add('strikeThrough');
            }
            rowCell.parentNode.parentNode.parentNode.removeChild(rowCell.parentNode.parentNode);
        } else {
            alert('something went wrong :(');
        }
    });
}

function expenseAll() {
    var confirmation = confirm('Are you sure you want to expense all current transactions?')
    if (confirmation) {
        var table = document.querySelector('#expense-table')
        for (var i = 1; i < table.childNodes.length; i++) {
            expenseRow(table.childNodes[i].lastChild.childNodes[0].childNodes[0] , true)
        }
    }
}