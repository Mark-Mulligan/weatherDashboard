let citySearchHistory = [];
let cityName = '';
const apiKey = "af81902a8a73c933aeffc3228ff6f7f1";
const units = "imperial";

citySearchHistory = JSON.parse(localStorage.getItem('citySearchHistory'));

if (citySearchHistory !== null && citySearchHistory.length > 0) {
    citySearchHistory = JSON.parse(localStorage.getItem('citySearchHistory'));
    citySearchHistory.forEach(function (city) {
        $('.search-list').append(`<div class="search-item">${city}</div>`);
    })
    $('.search-list').removeClass('invisible');
    $('.reset-btn').removeClass('invisible');

    cityName = citySearchHistory[0];
    getWeatherDataAndDisplayIt();
}

$('.search-item').click(handleSearchHistoryClick);

function handleSearchHistoryClick () {
    updateCitySearch($(this).text());
    getWeatherDataAndDisplayIt();
}

$('#search-btn').click(function () {
    event.preventDefault();

    if ($('#cityNameInput').val() !== '') {
        console.log($('#cityNameInput').val().trim());
        updateCitySearch($('#cityNameInput').val().trim());
        getWeatherDataAndDisplayIt()
        $('.search-list').removeClass('invisible');
        $('.reset-btn').removeClass('invisible');
    }
})

$('#reset-searches-btn').click(function () {
    citySearchHistory = [];
    localStorage.setItem('citySearchHistory', JSON.stringify(citySearchHistory));
    $('.search-list').empty();
    $('.search-list').addClass('invisible');
    $('.reset-btn').addClass('invisible');
})

function getWeatherDataAndDisplayIt() {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${units}`;
    $.ajax({
        url: url,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        displayCurrentWeather(response);
        let lat = response.coord.lat;
        let lon = response.coord.lon;

        const mutliDayURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
        $.ajax({
            url: mutliDayURL,
            method: "GET"
        }).then(function (data) {
            displayUVIndex(data);  
            createForecastCards(data.daily);
        })
    });

    //https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
}

function updateCitySearch(inputCity) {
    $('.search-list').empty();
    cityName = formatSearch(inputCity);
    checkForDuplicate(cityName, citySearchHistory);
    localStorage.setItem('citySearchHistory', JSON.stringify(citySearchHistory));
    citySearchHistory.forEach(function (city) {
        $('.search-list').append(`<div class="search-item">${city}</div>`);
    })
    $('#cityNameInput').val('');
    $('.search-item').click(handleSearchHistoryClick);
}

function checkForDuplicate(input, arr) {
    if (arr.includes(input)) {
        arr.splice(arr.indexOf(input), 1);
    }
    arr.unshift(input);
}

function capitalizeFirstLetter(str) {
    let otherLetters = str.toLowerCase().slice(1, str.length);
    return str.charAt(0).toUpperCase() + otherLetters;
}

function formatSearch(str) {
    let words = str.split(' ');
    let result = []
    words.forEach(function (word) {
        result.push(capitalizeFirstLetter(word));
    })
    return result.join(' ');
}

function createForecastCards(res) {
    $('.five-day-container').empty();
    $('.weekly-forecast-container').removeClass('hidden');

    for (let i = 1; i < 6; i++) {
        let card = $('<div>').addClass('card');
        let cardBody1 = $('<div>').addClass('card-body border-bottom');
        let dateEl = $('<h5>').text(formatDate(res[i].dt));
        let icon = res[i].weather[0].icon;
        let iconEl = $('<img>').attr('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
        let iconWrapper = $('<div>').addClass('icon-wrapper');
        let cardBody2 = $('<div>').addClass('card-body border-top');
        let highTempEl = $(`<p>High: <span>${res[i].temp.max} &#176;F</span><p>`);
        let lowTempEl = $(`<p>Low: <span>${res[i].temp.min} &#176;F</span><p>`)
        let humidityEl = $(`<p>Humidity: <span>${res[i].humidity}</span></p>`);

        cardBody1.append(dateEl);
        iconWrapper.append(iconEl);
        cardBody2.append(highTempEl, lowTempEl, humidityEl);
        card.append(cardBody1, iconWrapper, cardBody2);
        $('.five-day-container').append(card);
    }
}

function displayCurrentWeather(response) {
    $('.weather-info-container').removeClass('hidden');
    $('#location').text(response.name + ' ' + formatDate(response.dt));
    let icon = response.weather[0].icon;
    $('#main-icon').attr('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
    $('#temperature').html(response.main.temp + ' &#176;F');
    $('#humidity').text(response.main.humidity + '%');
    $('#wind-speed').text(response.wind.speed + ' MPH');
}

function displayUVIndex(data) {
    let uvi = data.current.uvi
    $('#uv-index').html(`${uvi}`);
    $('#uv-index').removeClass();
    if (uvi > 10) $('#uv-index').addClass('extreme');
    else if (uvi >= 8) $('#uv-index').addClass('very-high');
    else if (uvi >= 6) $('#uv-index').addClass('high');
    else if (uvi >= 3) $('#uv-index').addClass('moderate');
    else $('#uv-index').addClass('favorable');
}

function formatDate(num) {
    let date = new Date(num * 1000);
    return date.toLocaleDateString();
}