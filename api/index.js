const express = require('express');
const router = express.Router();
const axios = require('axios');

var multer  = require('multer');
const csv = require('csvtojson');
var upload = multer({ dest: 'uploads/' });

const Weather = require("./weather");

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

router.post('/loadExpenses', upload.single('expenseFile'), (req, res) => {
    var expenseFile;
    csv()
    .fromFile(req.file.path)
    .then((expenseFile) => {
        res.send(expenseFile);
    })
});

router.post('/loadSplitwiseGroups', (req, res) => {
    // sw.getGroups().then((groupData) => {
    //     var refinedGroupData = [];
    //     for (var i = 0; i < groupData.length; i++) {
    //         var object = {};
    //         object.name = groupData[i].name;
    //         object.id = groupData[i].id;
    //         refinedGroupData.push(object);
    //     }
    //     // console.log(refinedGroupData);
    //     res.send(refinedGroupData);
    // });

    axios.get("https://www.splitwise.com/api/v3.0/get_groups", {headers: splitwiseAuthHeader}).then(response => {
        var groupData = response.data.groups;
        // console.log(groupData);
        var refinedGroupData = [];
        for (var i = 0; i < groupData.length; i++) {
            var object = {};
            object.name = groupData[i].name;
            object.id = groupData[i].id;
            refinedGroupData.push(object);
        }
        // console.log(refinedGroupData);
        res.send(refinedGroupData);
    });
});

router.post('/createExpense', (req, res) => {
    var data = req.body;
    axios.post('https://secure.splitwise.com/api/v3.0/create_expense', null, {
        params: {
            cost: data.amount,
            description: data.description,
            group_id: data.groupId,
            split_equally: true,
            date: data.date,
            details: data.note
        },
        headers: splitwiseAuthHeader}).then(response => {
           if (!response.data.errors) {
               res.sendStatus(200);
           } else {
               res.send(response.data.errors);
           }
    });
    
    // var data = req.body;
    // console.log(data);
    // sw.getGroup({id: req.body.groupId}).then((groupData) => {
    //     console.log(groupData);
    //     var selfId;
    //     var targetId;
    //     for (var i = 0; i < groupData.members.length; i++) {
    //         if (groupData.members[i].first_name == 'Alex') {
    //             selfId = groupData.members[i].id;
    //         } else if (groupData.members[i].first_name == 'Megan') {
    //             targetId = groupData.members[i].id
    //         }
    //     }

    //     console.log(targetId);
        
    //     sw.createDebt({
    //         from: selfId,
    //         to: targetId,
    //         amount: data.amount,
    //         description: data.description,
    //         group_id: data.groupId
    //     }).then(res.send('success'));
    // });
    
});

module.exports = router;