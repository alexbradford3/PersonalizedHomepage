var dailyWeatherData = {
    day: String,
    weekDay: String,
    temp_max: Number,
    temp_min: Number,
    weatherId: Number,
    rainPercentage: Number
}
var dailyWeatherArr = []; 

async function setData(data) {
    var dailyWeather = data.daily;
    var dayArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (var i = 0; i < 7; i++) {
        var currentTime = new Date(dailyWeather[i].dt * 1000);
        var sunriseTime = new Date(dailyWeather[i].sunrise * 1000);
        var sunsetTime = new Date(dailyWeather[i].sunset * 1000);
        dailyWeatherData.day = (i == 0) ? null : `${currentTime.getDate()}`;
        dailyWeatherData.weekDay = (i == 0) ? 'Today': dayArray[currentTime.getDay()];
        dailyWeatherData.temp_max = dailyWeather[i].temp.max;
        dailyWeatherData.temp_min = dailyWeather[i].temp.min;
        dailyWeatherData.weatherId = dailyWeather[i].weather[0].id;
        dailyWeatherData.rainPercentage = Math.round(dailyWeather[i].pop * 100);
        dailyWeatherArr.push(dailyWeatherData);
    }
}

async function getDailyWeather() {
    return dailyWeatherArr;
}

function hours12(date) {
    return (date.getHours() + 24) % 12 || 12;
}
    
module.exports = {
    setData: setData,
    getDailyWeather: getDailyWeather
}