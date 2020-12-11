document.querySelector('#spreadsheet-submit').addEventListener('click', function(event) {
    event.preventDefault();
    
    var formData = new FormData(); 
    var csv = document.getElementById('expenseFile').files[0];
    formData.append("expenseFile", csv); 
    axios.post("/api/loadExpenses", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(d => {
        displayExpenses(d.data);
    });
});

function displayExpenses(data) {
    buildTable();
    fillTableData(data);
}

function buildTable() {
    var tableDiv = document.querySelector('#expense-table-div');
    var table = document.createElement('table');
    table.setAttribute('id', 'expense-table');
    var headingRow = document.createElement('tr');
    var headings = ['Date', 'Company', 'Amount', 'Category', 'Note'];
    for (var i = 0; i < headings.length; i++) {
        var heading = document.createElement('th');
        var headingText = document.createTextNode(headings[i]);
        heading.appendChild(headingText);
        headingRow.appendChild(heading);
    }
    table.appendChild(headingRow);
    tableDiv.appendChild(table);
}

function fillTableData(data) {
    var tableDiv = document.getElementById('expense-table');
    console.log(data);
    for (var i = 0; i < data.length; i++) {
        var row = tableDiv.insertRow();
        createDataRow(data[i], row);
        tableDiv.appendChild(row);
    }
}

function createDataRow(expense, row) {
    var targetKeys = ['Description', 'Date', 'Category', 'Amount', 'Notes'];
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

function expenseRow(rowCell) {
    var row = rowCell.parentNode.parentNode.parentNode;
    for (var i = 0; i < 5; i++) {
        row.childNodes[i].childNodes[0].childNodes[0].classList.add('strikeThrough');
    }
    rowCell.parentNode.parentNode.parentNode.removeChild(rowCell.parentNode.parentNode);
}