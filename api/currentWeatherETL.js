var currentWeather = {
    location: {
        city: String,
        country: String,
        lat: Number,
        lon: Number
    },
    time: {
        time: String,
        timezone: String,
        sunrise: String,
        sunset: String,
        timeOfDay: String
    },
    temp: {
        temperature: Number,
        feelsLike: Number,
        tempMin: Number,
        tempMax: Number,
    },
    weather: {
        id: Number,
        description: String,
        windSpeed: String,
        rainPercentage: Number
    }
};

async function setData(data, weatherObject) {
    currentTime = new Date(data.current.dt * 1000);
    sunriseTime = new Date(data.current.sunrise * 1000);
    sunsetTime = new Date(data.current.sunset * 1000);

    currentWeather.location.city = weatherObject.city;
    currentWeather.location.country = weatherObject.country;
    currentWeather.location.lat = data.lat;
    currentWeather.location.lon = data.lon;
    currentWeather.time.time = `${(hours12(currentTime)).toString()}:${currentTime.getMinutes().toString()} ${currentTime.getHours() < 11 ? "AM" : "PM"}`;
    switch (currentTime.getTimezoneOffset()/60) {
        case (5):
            currentWeather.time.timezone = "EST";
            break;
        case (6):
            currentWeather.time.timezone = "CST";
            break;
        case (7):
            currentWeather.time.timezone = "MST";
            break;
        case (8):
            currentWeather.time.timezone = "PST";
            break;
    }
    currentWeather.temp.temperature = Math.round(data.current.temp);
    currentWeather.temp.feelsLike = Math.round(data.current.feels_like);
    currentWeather.weather.description = upperCaseString(data.current.weather[0].description);
    currentWeather.weather.id = data.current.weather[0].id;
    currentWeather.weather.rainPercentage = calculateAverageRainPercentage(data, currentTime);;
    currentWeather.temp.tempMin = Math.round(weatherObject.temp_min);
    currentWeather.temp.tempMax = Math.round(weatherObject.temp_max);
    currentWeather.time.sunrise = `${(hours12(sunriseTime)).toString()}:${sunriseTime.getMinutes().toString()} ${sunriseTime.getHours() < 11 ? "AM" : "PM"}`;
    currentWeather.time.sunset = `${(hours12(sunsetTime)).toString()}:${sunsetTime.getMinutes().toString()} ${sunsetTime.getHours() < 11 ? "AM" : "PM"}`;
    currentWeather.weather.windSpeed = `${data.current.wind_speed} m/s`;
    (currentTime.getTime() < sunriseTime.getTime() || currentTime.getTime() > sunsetTime.getTime()) ? currentWeather.time.timeOfDay = "night" : currentWeather.time.timeOfDay = "day";
}

async function getCurrentWeather() {
    return currentWeather;
}

function calculateAverageRainPercentage(weatherData, date) {
    hourlyDate = weatherData.hourly;
    var count = 0;
    var sum = 0;
    for (var i = 0; i < hourlyDate.length; i++) {
        var compareDate = new Date(hourlyDate[i].dt * 1000);
        if (date.getDate() === compareDate.getDate()) {
            count++;
            sum += hourlyDate[i].pop * 100;
        }
    }
    return Math.round(sum / count);
}

function upperCaseString(string) {
    var stringArr = string.split(" ");

    for (var i = 0; i < stringArr.length; i++) {
        stringArr[i] = stringArr[i].charAt(0).toUpperCase() + stringArr[i].slice(1);
    }
    return stringArr.join(' ');
}

function hours12(date) {
    return (date.getHours() + 24) % 12 || 12;
}
    
module.exports = {
    setData: setData,
    getCurrentWeather: getCurrentWeather
}