const axios = require('axios');
require('dotenv').config({path: './../../../.env'});

const baseSplitwiseAPI = 'https://www.splitwise.com/api/v3.0';
const baseSplitwiseAPI2 = 'https://secure.splitwise.com/api/v3.0';
const splitwiseAuthHeader = {
    'Authorization': `Bearer ${process.env.SPLITWISE_KEY}`
}

let existingTransactions = []

class Splitwise {

    async getGroups() {
        let url = `${baseSplitwiseAPI2}/get_groups`;
        try {
            let res = await axios(url, {headers: splitwiseAuthHeader})
            if (res.status !== 200) {
                console.log(res.status);
            }
            return res.data.groups;
        } catch (err) {
            return err;
        }
    }

    async getExpenses(groupId, date) {
        date = new Date(date)
        let startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
        let endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
        if (existingTransactions.length < 1) {
            try {
                let url = `https://secure.splitwise.com/api/v3.0/get_expenses?group_id=${groupId}&dated_before=${endOfMonth}&dated_after=${startOfMonth}&limit=0`
                let result = await axios.get(url, {
                    headers: splitwiseAuthHeader
                })
                let expenses = result.data.expenses
                for (var i = 0; i < expenses.length; i++) {
                    let newDate = new Date(expenses[i].date)
                    newDate.toISOString()
                    let expense = {
                        cost: parseInt(expenses[i].cost),
                        description: expenses[i].description,
                        date: newDate
                    }
                    existingTransactions.push(expense)
                }
                return true;                
            } catch (err) {
                console.log(err);
                return err;
            }
        }
    }

    async compareExpenses(expense) {
        let newExpense = {
            cost: expense.cost,
            description: expense.description,
            date: expense.date
        }
        
        for (var i = 0; i < existingTransactions.length; i++) {
            if (JSON.stringify(existingTransactions[i]) == JSON.stringify(newExpense)) {
                return true;
            }
        }
    }

    async createExpense(expenseData) {
        let url = `${baseSplitwiseAPI}/create_expense`;
        try {
            let res = await axios(url, null, {
                params: expenseData,
                headers: splitwiseAuthHeader
            })
            if (res.status !== 200) {
                console.log(res.status);
            }
            return res.data
        } catch (err) {
            return err;
        }
    }
}

module.exports = Splitwise;