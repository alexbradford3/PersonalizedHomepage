const express = require('express');
const router = express.Router();

const Weather = require("./weather");

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

module.exports = router;