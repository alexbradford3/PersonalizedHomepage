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
    console.log(req.body);

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
    var data = req.body;
    var expenseParams = {
        cost: data.amount,
        description: data.description,
        group_id: data.groupId,
        date: data.date,
        details: data.note
    }
    if (data.totalShare == data.owedShare) {
        expenseParams.split_equally = true
    } else {
        expenseParams.user_0_last_name = 'Bradford'
        expenseParams.user_0_paid_share = data.totalShare
        expenseParams.user_0_owed_share = data.totalShare - data.owedShare
        expenseParams.user_1_last_name = 'Greeley'
        expenseParams.user_1_paid_share = 0
        expenseParams.user_1_owed_share = data.owedShare
    }
    axios.post('https://secure.splitwise.com/api/v3.0/create_expense', null, {
        params: expenseParams,
        headers: splitwiseAuthHeader}).then(response => {
           if (!response.data.errors) {
               res.sendStatus(200);
           } else {
               res.send(response.data.errors);
           }
    });
});

module.exports = router;