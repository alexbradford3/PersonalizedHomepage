
let weatherData = {};
let units;

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

    removeAllChildNodes([currentWeatherSummaryDiv, currentWeatherIcon, currentWeatherDiv]);
}

function removeAllChildNodes(parentNodes) {
    for (var i = 0; i < parentNodes.length; i++) {
        while(parentNodes[i].firstChild) {
            parentNodes[i].removeChild(parentNodes[i].firstChild);
        }
    }
}

function buildWeatherContainer(weatherData) {
    // console.log(`Weather: ${weatherData.time.timeOfDay}`);
    // console.log(typeof(weatherData));
    document.querySelector('#current-weather-container').classList.add('blueBackground');
    var currentWeatherSummaryDiv = document.querySelector('.current-weather-summary');
    var currentWeatherIcon = document.querySelector('#current-weather-icon');
    var currentWeatherDiv = document.querySelector('#current-weather-abbrev-details');

    createHTMLElement('h4', `${weatherData.location.city}, ${weatherData.location.country} Weather`, currentWeatherSummaryDiv);
    createHTMLElement('h6', `as of ${weatherData.time.time} ${weatherData.time.timezone}`, currentWeatherSummaryDiv);
    createHTMLElement('h1', `${weatherData.temp.temperature}°${units == "Imperial" ? "F" : "C"}`, currentWeatherSummaryDiv, 'temperature');
    createHTMLElement('h3', `${weatherData.weather.description}`, currentWeatherSummaryDiv);
    (weatherData.weather.rainPercentage) ? createHTMLElement('p', `5% chance of rain through 4pm`, currentWeatherSummaryDiv) : null;

    var node = document.createElement('span');
    node.setAttribute('class', `fa-2x wi wi-owm-${weatherData.time.timeOfDay}-${weatherData.weather.id}`);
    currentWeatherIcon.appendChild(node);
    
    createHTMLElement('h5', `${weatherData.temp.tempMin}°${units == "Imperial" ? "F" : "C"} / ${weatherData.temp.tempMax}°${units == "Imperial" ? "F" : "C"}`, currentWeatherDiv);
    createHTMLElement('h5', `Feels like: ${weatherData.temp.feelsLike}°${units == "Imperial" ? "F" : "C"}`, currentWeatherDiv);
    createHTMLElement('p', `Sunrise: ${weatherData.time.sunrise}`, currentWeatherDiv);
    createHTMLElement('p', `Sunset: ${weatherData.time.sunset}`, currentWeatherDiv,);
    createHTMLElement('p', `Wind Speed: ${weatherData.weather.windSpeed}`, currentWeatherDiv,);
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
    // extractWeatherData(data);
    buildWeatherContainer(data); 
}

setFooterText();