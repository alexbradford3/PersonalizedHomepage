
let weatherData = {};
let units;

document.querySelector('#submit-weather').addEventListener('click', function(event) {
    event.preventDefault();
    clearWeatherData();
    
    var zipCode = document.forms["weather-form"]["zip-code"].value;
    const radioButtons = document.querySelectorAll('input[name="unit-radios"]');
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

function clearWeatherData() {
    document.querySelector('#current-weather-container').classList.remove('blueBackground');
    var currentWeatherSummaryDiv = document.querySelector('.current-weather-summary');
    var currentWeatherIcon = document.querySelector('#current-weather-icon');
    var currentWeatherDiv = document.querySelector('#current-weather-abbrev-details');
    var dailyWeatherDiv = document.querySelector('.daily-weather');
    var dailyWeatherHeader = document.querySelector('#daily-header');

    removeAllChildNodes([currentWeatherSummaryDiv, currentWeatherIcon, currentWeatherDiv, dailyWeatherDiv, dailyWeatherHeader]);
}

function removeAllChildNodes(parentNodes) {
    for (var i = 0; i < parentNodes.length; i++) {
        while(parentNodes[i].firstChild) {
            parentNodes[i].removeChild(parentNodes[i].firstChild);
        }
    }
}

function buildWeatherContainer(weatherData) {
    let currentWeather = weatherData.current;
    let dailyWeather = weatherData.daily;
    buildCurrentWeather(currentWeather);
    buildDailyWeather(dailyWeather);
}

function buildCurrentWeather(currentWeather) {
    document.querySelector('#current-weather-container').classList.add('blueBackground');
    var currentWeatherSummaryDiv = document.querySelector('.current-weather-summary');
    var currentWeatherIcon = document.querySelector('#current-weather-icon');
    var currentWeatherDiv = document.querySelector('#current-weather-abbrev-details');

    createHTMLElement('h4', `${currentWeather.location.city}, ${currentWeather.location.country} Weather`, currentWeatherSummaryDiv);
    createHTMLElement('h6', `as of ${currentWeather.time.time} ${currentWeather.time.timezone}`, currentWeatherSummaryDiv);
    createHTMLElement('h1', `${currentWeather.temp.temperature}°${units == "Imperial" ? "F" : "C"}`, currentWeatherSummaryDiv, 'temperature');
    createHTMLElement('h3', `${currentWeather.weather.description}`, currentWeatherSummaryDiv);
    (currentWeather.weather.rainPercentage) ? createHTMLElement('p', `${currentWeather.weather.rainPercentage}% chance of rain today`, currentWeatherSummaryDiv) : null;

    var node = document.createElement('span');
    node.setAttribute('class', `fa-2x wi wi-owm-${currentWeather.time.timeOfDay}-${currentWeather.weather.id}`);
    currentWeatherIcon.appendChild(node);
    
    createHTMLElement('h5', `${currentWeather.temp.tempMin}°${units == "Imperial" ? "F" : "C"} / ${currentWeather.temp.tempMax}°${units == "Imperial" ? "F" : "C"}`, currentWeatherDiv);
    createHTMLElement('h5', `Feels like: ${currentWeather.temp.feelsLike}°${units == "Imperial" ? "F" : "C"}`, currentWeatherDiv);
    createHTMLElement('p', `Sunrise: ${currentWeather.time.sunrise}`, currentWeatherDiv);
    createHTMLElement('p', `Sunset: ${currentWeather.time.sunset}`, currentWeatherDiv,);
    createHTMLElement('p', `Wind Speed: ${currentWeather.weather.windSpeed}`, currentWeatherDiv,);
}

function buildDailyWeather(dailyWeather) {
    document.querySelector('#daily-weather-container').classList.add('daily-weather-background');
    var dailyWeatherContainer = document.querySelector('#daily-header');
    createHTMLElement('h3', `Daily Forecast`, dailyWeatherContainer);
    
    var dailyWeatherDiv = document.querySelector('.daily-weather');
    for (var i = 0; i < dailyWeather.length; i++) {
        var weather = dailyWeather[i];
        var div = document.createElement('div');
        createHTMLElement('h4', `${(weather.day == null ? 'Today' : `${(weather.weekDay).slice(0,3)} ${weather.day}`)}`, div);
        createHTMLElement('h3', `${weather.temp_max}°${units == "Imperial" ? "F" : "C"}`, div);
        createHTMLElement('p', `${weather.temp_min}°${units == "Imperial" ? "F" : "C"}`, div);
        
        var iconDiv = document.createElement('div');
        iconDiv.classList.add('daily-weather-icon');
        var node = document.createElement('span');
        node.setAttribute('class', `fa-2x wi wi-owm-day-${weather.weatherId}`);
        iconDiv.appendChild(node);
        div.appendChild(iconDiv);

        createRainIcon('span', `${weather.rainPercentage}%`, div);
        dailyWeatherDiv.appendChild(div);
    }
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

function createRainIcon(element, textValue, root) {
    var div = document.createElement('div');
    div.classList.add('rain-icon');
    var iconNode = document.createElement('span');
    (textValue !== '0%') ? iconNode.classList.add('wi') : null;
    (textValue !== '0%') ? iconNode.classList.add('wi-raindrops') : null;
    var node = document.createElement(element);
    var textNode = document.createTextNode(textValue);
    node.appendChild(textNode);
    div.appendChild(iconNode);
    div.appendChild(node);
    root.appendChild(div);
}

function displayWeather(data) {
    // extractWeatherData(data);
    buildWeatherContainer(data); 
}