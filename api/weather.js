const axios = require("axios");
const weatherETL = require("./weatherETL");


// Configuring the path to read the environment variable file, .env, to get the weather api key
require('dotenv').config({path: "./../../../.env"});

const baseUrlWeather = "http://api.openweathermap.org/data/2.5/weather";
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

    async getWeatherDataAll(zipCode, tempMetric) {
        let weatherData = await this.getCoords(zipCode, tempMetric);
        let tempWeather = {
            lat: weatherData.coord.lat,
            lon: weatherData.coord.lon,
            city: weatherData.name, 
            country: weatherData.sys.country,
            temp_min: weatherData.main.temp_min, 
            temp_max: weatherData.main.temp_max
        }

        let url = `${baseUrlAllWeather}?lat=${tempWeather.lat}&lon=${tempWeather.lon}&units=${tempMetric}${exclude}&appid=${process.env.WEATHER_KEY}`;

        try {
            let res = await axios(url);
            if (res.status !== 200) {
                console.log(res.status);
            }
            weatherETL.setCurrentData(res.data, tempWeather);
            weatherETL.setDailyData(res.data);
            let weather = weatherETL.getWeather();
            return weather;
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = Weather;