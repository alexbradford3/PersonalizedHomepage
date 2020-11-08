const axios = require("axios");
const currentWeatherETL = require("./currentWeatherETL");


// Configuring the path to read the environment variable file, .env, to get the weather api key
require('dotenv').config({path: "./../../../.env"});

const baseUrlWeather = "http://api.openweathermap.org/data/2.5/weather";
const baseUrlForecast5 = "https://openweathermap.org/data/2.5/forecast";
const baseUrlAllWeather = "https://api.openweathermap.org/data/2.5/onecall";
const exclude = '&exclude=minutely,alerts';

class Weather {

    async getCoords(zipCode, tempMetric) {
        let url = `${baseUrlWeather}?zip=${zipCode},us&appid=${process.env.WEATHER_KEY}&units=${tempMetric}`;

        try {
            let res = await axios(url)
            if (res.status !== 200) {
                console.log(res.status);
            }
            return res.data;
        }
        catch (err) {
            console.error(err);
        }
    }

    // Original call
    async getWeatherData(zipCode, tempMetric) {

        let url = `${baseUrlWeather}?zip=${zipCode},us&appid=${process.env.WEATHER_KEY}&units=${tempMetric}`;
        try {
            let res = await axios(url)
            if (res.status !== 200) {
                console.log(res.status);
            }
            currentWeatherETL.setData(res.data);
            let currentWeather = currentWeatherETL.getCurrentWeather();
            console.log(currentWeather);
            return currentWeather;
        }
        catch (err) {
            console.error(err);
        }
    }

    // Forecast 5
    async getWeatherDataForecast(zipCode, tempMetric) {

        let url = `${baseUrlForecast5}?zip=${zipCode},us&appid=${process.env.WEATHER_KEY}&units=${tempMetric}`;

        try {
            let res = await axios(url)
            if (res.status !== 200) {
                console.log(res.status);
            }
            currentWeatherETL.setData(res.data);
            let weatherData =  currentWeatherETL.getCurrentWeather();

            return weatherData;
        } 
        catch (err) {
            console.error(err);
        }
    }

    async getWeatherDataAll(zipCode, tempMetric) {

        let weatherData = await this.getCoords(zipCode, tempMetric);

        let lat = weatherData.coord.lat;
        let lon = weatherData.coord.lon
        
        let tempWeather = {
            city: weatherData.name, 
            country: weatherData.sys.country,
            temp_min: weatherData.main.temp_min, 
            temp_max: weatherData.main.temp_max
        }

        let url = `${baseUrlAllWeather}?lat=${lat}&lon=${lon}&units=${tempMetric}${exclude}&appid=${process.env.WEATHER_KEY}`;

        try {
            let res = await axios(url);
            if (res.status !== 200) {
                console.log(res.status);
            }
            currentWeatherETL.setData(res.data, tempWeather);
            let currentWeather = currentWeatherETL.getCurrentWeather();
            return currentWeather;
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = Weather;