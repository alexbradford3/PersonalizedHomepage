const axios = require('axios');
require('dotenv').config({path: './../../../.env'});

const baseSplitwiseAPI = 'https://www.splitwise.com/api/v3.0';
const splitwiseAuthHeader = {
    'Authorization': `Bearer ${process.env.SPLITWISE_KEY}`
}

class Splitwise {

    async getGroups() {
        let url = `${baseSplitwiseAPI}/get_groups`;
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