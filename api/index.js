const express = require('express');
const router = express.Router();
const axios = require('axios');

var multer  = require('multer');
const csv = require('csvtojson');
var upload = multer({ dest: 'uploads/' });

const Weather = require('./weather');
const Splitwise = require('./splitwise');
const Ynab = require('./ynab');

const splitwiseAuthHeader = {
    'Authorization': `Bearer ${process.env.SPLITWISE_KEY}`
}

router.get("/weather",  async (req, res) => {
    let weather = new Weather();
    
    let weatherData = await weather.getWeatherDataAll('02127', "imperial");

    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(weatherData, null, 4));
});

router.post("/weather",  async (req, res) => {
    const {zipCode, tempMetric} = req.body;
    let weather = new Weather();
    
    let weatherData = await weather.getWeatherDataAll(zipCode, tempMetric);
    res.send(JSON.stringify(weatherData, null, 4));
});

router.post('/loadCSVExpenses', upload.single('expenseFile'), (req, res) => {
    var expenseFile;  
    csv()
    .fromFile(req.file.path)
    .then((expenseFile) => {
        res.send(expenseFile);
    })
});

router.post('/loadYnabExpenses', (req, res) => {
    let ynab = new Ynab();

    ynab.getTransactions().then(transactions => {
        ynab.filterTransactions(transactions, req.body.dates).then(finalTransactions => {
            res.send(finalTransactions)
        })
    })
})

router.post('/loadSplitwiseGroups', (req, res) => {
    let sw = new Splitwise();

    sw.getGroups().then(groups => {
        var refinedGroupData = [];
        for (var i = 0; i < groups.length; i++) {
            var object = {};
            object.name = groups[i].name;
            object.id = groups[i].id;
            refinedGroupData.push(object);
        }
        res.send(refinedGroupData);
    });
    

});

router.post('/createExpense', (req, res) => {
    let sw = new Splitwise();
    var data = req.body;
    var expenseParams = {
        cost: Math.abs(data.totalShare),
        description: data.note,
        group_id: data.groupId,
        date: data.date,
        users__0__first_name: 'Alex',
        users__0__last_name: 'Bradford',
        users__0__email: 'alex.bradford417@gmail.com',
        users__1__first_name: 'Megan',
        users__1__last_name: 'Greeley',
        users__1__email: 'mjgreeley93@gmail.com',
    }
    if (data.totalShare > 0) {
        expenseParams.users__0__paid_share = 0
        expenseParams.users__0__owed_share = data.owedShare
        expenseParams.users__1__paid_share = data.totalShare
        expenseParams.users__1__owed_share = data.totalShare - data.owedShare
    } else {
        expenseParams.users__0__paid_share = Math.abs(data.totalShare)
        expenseParams.users__0__owed_share = Math.abs(data.totalShare - data.owedShare)
        expenseParams.users__1__paid_share = 0
        expenseParams.users__1__owed_share = Math.abs(data.owedShare)
    }  
       
    sw.getExpenses(expenseParams.group_id, expenseParams.date).then(() => {
        sw.compareExpenses(expenseParams).then((expenseFound) => {
            if (!expenseFound) {
                axios.post('https://secure.splitwise.com/api/v3.0/create_expense', null, {
                params: expenseParams,
                headers: splitwiseAuthHeader}).then(response => {
                if (!response.data.errors) {
                    res.sendStatus(200);
                } else {
                    res.send(response.data.errors);
                }
                });
            } else {
                res.send(204);
            }
        })
    })
});

module.exports = router;