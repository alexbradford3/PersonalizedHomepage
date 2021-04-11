const axios = require('axios');
require('dotenv').config({path: './../../../.env'});

const baseYnabAPI = 'https://api.youneedabudget.com/v1';
const ynabAuthHeader = {
    'Authorization': `Bearer ${process.env.YNAB_KEY}`
}
const budgetID = '2ef9959f-a2db-4048-ac09-81bde0b9a676'

class Ynab {

    async getTransactions(startDate, endDate) {
        let url = `${baseYnabAPI}/budgets/${budgetID}/transactions`;
        try {
        let res = await axios(url, {headers: ynabAuthHeader})
        if (res.status !== 200) {
            console.log(res.status);
        }
        return res.data
        } catch (err) {
            return err;
        }
    }

    async filterTransactions(transactions, dates) {
        let start = Date.parse(dates.startDate)
        let end = Date.parse(dates.endDate)
        let transactionList = []
        let finalTransactions = []
        transactions = transactions.data.transactions
        for (var i = 0; i < transactions.length; i++) {
            var date = Date.parse(transactions[i].date)
            if (date >= start && date <= end) {
                transactionList.push(transactions[i])
            }
        }
        for (var i = 0; i < transactionList.length; i++) {
            if (transactionList[i].subtransactions.length > 0) {
                for (var j = 0; j < transactionList[i].subtransactions.length; j++) {
                    if (transactionList[i].subtransactions[j].category_name == 'Splitwise Transactions') {
                        // Checks if it is an expense I've created to track what I owe Megan
                        if (!(transactionList[i].memo.substring(0, 3) == 'DNE')) {
                            transactionList[i].subtransactions[j].memo = transactionList[i].memo
                            transactionList[i].subtransactions[j].date = transactionList[i].date
                            transactionList[i].subtransactions[j].payee_name = transactionList[i].payee_name
                            transactionList[i].subtransactions[j].amount = Math.abs(transactionList[i].subtransactions[j].amount / 1000)
                            transactionList[i].subtransactions[j].total_cost = Math.abs(transactionList[i].amount / 1000)
                            finalTransactions.push(transactionList[i].subtransactions[j])
                        }
                        
                    }
                }
            }
        }
        console.log(finalTransactions)
        return finalTransactions
    }
}

module.exports = Ynab;