var currentWeather = {
    hourly: {

    }
};

async function setData(data) {
    currentTime = new Date(data.dt * 1000);

    
}

async function getHourlyWeather() {
    return currentWeather;
}

// function upperCaseString(string) {
//     var stringArr = string.split(" ");

//     for (var i = 0; i < stringArr.length; i++) {
//         stringArr[i] = stringArr[i].charAt(0).toUpperCase() + stringArr[i].slice(1);
//     }
//     return stringArr.join(' ');
// }

// function hours12(date) {
//     return (date.getHours() + 24) % 12 || 12;
// }
    
module.exports = {
    setData: setData,
    getHourlyWeather: getHourlyWeather
}