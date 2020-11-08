
let weatherData = {};

function setFooterText() {
    var node = document.createElement("p");
    var text = document.createTextNode("© Copyright " + new Date().getFullYear() + " Alex Bradford");
    node.appendChild(text);
    document.querySelector("#footer").appendChild(node); 
}

document.querySelector('#submit-weather').addEventListener('click', function(event) {
    event.preventDefault();
    clearWeatherData();
    
    var zipCode = document.forms["weather-form"]["zip-code"].value;
    const radioButtons = document.querySelectorAll('input[name="unit-radios"]');
    let units;
    for (const button of radioButtons) {
        if (button.checked) {
            units = button.value;
            break;
        }
    }
    axios.post("/api/weather", {
        zipCode: zipCode,
        tempMetric: units
    }).then(d => {
        displayWeather(d.data);
    });
    document.querySelector('#weather-form').reset();
});

function extractWeatherData(data) {
    var currentDate = new Date(data.dt * 1000);
    var sunrise = new Date(data.sys.sunrise * 1000);
    var sunset = new Date(data.sys.sunset * 1000);

    weatherData.city = data.name;
    weatherData.country = data.sys.country;
    weatherData.time = `${(currentDate.getHours()%12).toString()}:${currentDate.getMinutes().toString()} ${currentDate.getHours() < 11 ? "AM" : "PM"}`;
    switch (currentDate.getTimezoneOffset()/60) {
        case (5):
            weatherData.timezone = "EST";
            break;
        case (6):
            weatherData.timezone = "CST";
            break;
        case (7):
            weatherData.timezone = "MST";
            break;
        case (8):
            weatherData.timezone = "PST";
            break;
    }
    weatherData.temperature = Math.round(data.main.temp);
    weatherData.feelsLike = Math.round(data.main.feels_like);
    weatherData.description = upperCaseString(data.weather[0].description);
    weatherData.rainPercentage = 0;
    weatherData.tempMin = Math.round(data.main.temp_min);
    weatherData.tempMax = Math.round(data.main.temp_max);
    weatherData.sunrise = `${(sunrise.getHours()%12).toString()}:${sunrise.getMinutes().toString()} ${sunrise.getHours() < 11 ? "AM" : "PM"}`;
    weatherData.sunset = `${(sunset.getHours()%12).toString()}:${sunset.getMinutes().toString()} ${sunset.getHours() < 11 ? "AM" : "PM"}`;
    weatherData.windSpeed = `${data.wind.speed} m/s`;
    (currentDate.getTime() < sunrise.getTime() || currentDate.getTime() > sunset.getTime()) ? weatherData.dayOrNight = "night" : weatherData.dayOrNight = "day";
}

function upperCaseString(string) {
    var stringArr = string.split(" ");

    for (var i = 0; i < stringArr.length; i++) {
        stringArr[i] = stringArr[i].charAt(0).toUpperCase() + stringArr[i].slice(1);
    }
    return stringArr.join(' ');
}

function clearWeatherData() {
    document.querySelector('#current-weather-container').classList.remove('blueBackground');
    var currentWeatherSummaryDiv = document.querySelector('.current-weather-summary');
    var currentWeatherIcon = document.querySelector('#current-weather-icon');
    var currentWeatherDiv = document.querySelector('#current-weather-abbrev-details');

    removeAllChildNodes([currentWeatherSummaryDiv, currentWeatherIcon, currentWeatherDiv]);
}

function removeAllChildNodes(parentNodes) {
    for (var i = 0; i < parentNodes.length; i++) {
        while(parentNodes[i].firstChild) {
            parentNodes[i].removeChild(parentNodes[i].firstChild);
        }
    }
}

function buildWeatherContainer(data) {
    document.querySelector('#current-weather-container').classList.add('blueBackground');
    var currentWeatherSummaryDiv = document.querySelector('.current-weather-summary');
    var currentWeatherIcon = document.querySelector('#current-weather-icon');
    var currentWeatherDiv = document.querySelector('#current-weather-abbrev-details');

    createHTMLElement('h4', `${weatherData.city}, ${weatherData.country} Weather`, currentWeatherSummaryDiv);
    createHTMLElement('h6', `as of ${weatherData.time} ${weatherData.timezone}`, currentWeatherSummaryDiv);
    createHTMLElement('h1', `${weatherData.temperature}°`, currentWeatherSummaryDiv, 'temperature');
    createHTMLElement('h3', `${weatherData.description}`, currentWeatherSummaryDiv);
    (weatherData.rainPercentage) ? createHTMLElement('p', `5% chance of rain through 4pm`, currentWeatherSummaryDiv) : null;

    var node = document.createElement('span');
    node.setAttribute('class', `fa-2x wi wi-owm-${weatherData.dayOrNight}-${data.weather[0].id}`);
    currentWeatherIcon.appendChild(node);
    
    createHTMLElement('h5', `${weatherData.tempMin}° / ${weatherData.tempMax}°`, currentWeatherDiv);
    createHTMLElement('h5', `Feels like: ${weatherData.feelsLike}°`, currentWeatherDiv);
    createHTMLElement('p', `Sunrise: ${weatherData.sunrise}`, currentWeatherDiv);
    createHTMLElement('p', `Sunset: ${weatherData.sunset}`, currentWeatherDiv,);
    createHTMLElement('p', `Wind Speed: ${weatherData.windSpeed}`, currentWeatherDiv,);
}

function createHTMLElement(element, textValue, root, id) {
    var node = document.createElement(element);
    var textNode = document.createTextNode(textValue);
    node.appendChild(textNode);
    root.appendChild(node);
    if (id) {
        node.setAttribute('id', id);
    }
}

function displayWeather(data) {
    extractWeatherData(data);
    buildWeatherContainer(data); 
}

setFooterText();