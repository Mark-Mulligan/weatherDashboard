/* ----- GLOBAL VARIABLES ----- */
let citySearchHistory = [];
let cityName = '';
const apiKey = "af81902a8a73c933aeffc3228ff6f7f1";
const units = "imperial";


if (JSON.parse(localStorage.getItem('citySearchHistory')) !== null &&
    JSON.parse(localStorage.getItem('citySearchHistory')).length > 0) {
    console.log('local storage called');
    citySearchHistory = JSON.parse(localStorage.getItem('citySearchHistory'));
    citySearchHistory.forEach(function (city) {
        $('.search-list').append(`<div class="search-item">${city}</div>`);
    })
    $('.search-list').removeClass('invisible');
    $('.reset-btn').removeClass('invisible');

    cityName = citySearchHistory[0];
    getWeatherDataAndDisplayIt();
}

/* ----- EVENT LISTENERS ----- */
// note, needs to be called after generating search list in function above, not before
$('.search-item').click(handleSearchHistoryClick);

$('#search-btn').click(function () {
    event.preventDefault();

    if ($('#cityNameInput').val() !== '') {
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

/* ----- FUNCTIONS ----- */

//click function for city search history list
function handleSearchHistoryClick() {
    updateCitySearch($(this).text());
    getWeatherDataAndDisplayIt();
}

//AJAX calls
function getWeatherDataAndDisplayIt() {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${units}`;
    $.ajax({
        url: url,
        method: "GET"
    }).then(function (response) {
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
}

// inputs city into search history and local storage
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

// updates html with current weather info
function displayCurrentWeather(response) {
    $('.weather-info-container').removeClass('hidden');
    $('#location').text(response.name + ' ' + formatDate(response.dt));
    let icon = response.weather[0].icon;
    $('#main-icon').attr('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
    $('#temperature').html(Math.round(response.main.temp) + ' &#176;F');
    $('#humidity').text(response.main.humidity + '%');
    $('#wind-speed').text(response.wind.speed + ' MPH');
}

// updates UVI reading
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

// Generate five day forecast cards
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
        let highTempEl = $(`<p>High: <span>${Math.round(res[i].temp.max)} &#176;F</span><p>`);
        let lowTempEl = $(`<p>Low: <span>${Math.round(res[i].temp.min)} &#176;F</span><p>`)
        let humidityEl = $(`<p>Humidity: <span>${res[i].humidity}%</span></p>`);

        cardBody1.append(dateEl);
        iconWrapper.append(iconEl);
        cardBody2.append(highTempEl, lowTempEl, humidityEl);
        card.append(cardBody1, iconWrapper, cardBody2);
        $('.five-day-container').append(card);
    }
}

/* ----- UTILITY FUNCTIONS ----- */
// Removes duplicates from search history if user searches same city twice
function checkForDuplicate(input, arr) {
    if (arr.includes(input)) {
        arr.splice(arr.indexOf(input), 1);
    }
    arr.unshift(input);
}

// Formats all strings enter by user so they appear with the same capitalization rules
function formatSearch(str) {
    let words = str.split(' ');
    let result = []
    words.forEach(function (word) {
        result.push(capitalizeFirstLetter(word));
    })
    return result.join(' ');
}

// sub function to formatSearch, capitalizes first letter in a string, makes all others lowercase
function capitalizeFirstLetter(str) {
    let otherLetters = str.toLowerCase().slice(1, str.length);
    return str.charAt(0).toUpperCase() + otherLetters;
}

// formates the date input given by get request
function formatDate(num) {
    let date = new Date(num * 1000);
    return date.toLocaleDateString();
}