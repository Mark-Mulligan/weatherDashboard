let fiveDayForecasts = [];
let citySearchHistory = [];
let cityName = '';
const apiKey = "af81902a8a73c933aeffc3228ff6f7f1";
const units = "imperial";

citySearchHistory = JSON.parse(localStorage.getItem('citySearchHistory'));

if (citySearchHistory !== null && citySearchHistory.length > 0) {
    console.log('search history exisits in local stoarge');
    citySearchHistory = JSON.parse(localStorage.getItem('citySearchHistory'));
    citySearchHistory.forEach(function (city) {
        $('.search-list').append(`<div class="search-item">${city}</div>`);
    })
    $('.search-list').removeClass('invisible');
    $('.reset-btn').removeClass('invisible');


    cityName = citySearchHistory[0];
    getWeatherDataAndDisplayIt();
}

$('#search-btn').click(function () {
    event.preventDefault();
    $('.five-day-container').empty();
    fiveDayForecasts = [];

    if ($('#cityNameInput').val() !== '') {
        updateCitySearch();
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

        const uviURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${response.coord.lat}&lon=${response.coord.lon}&appid=${apiKey}`;
        $.ajax({
            url: uviURL,
            method: "GET"
        }).then(function (data) {
            displayUVIndex(data);
        })
    });

    const fiveDayURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=${units}`;
    $.ajax({
        url: fiveDayURL,
        method: "GET"
    }).then(function (data) {
        let res = data.list;
        find3pmTimes(res);
        createForecastCards(res);
    })
}

function updateCitySearch() {
    $('.search-list').empty();
    cityName = formatSearch($('#cityNameInput').val().trim());
    checkForDuplicate(cityName, citySearchHistory);
    console.log(citySearchHistory);
    localStorage.setItem('citySearchHistory', JSON.stringify(citySearchHistory));
    citySearchHistory.forEach(function (city) {
        $('.search-list').append(`<div class="search-item">${city}</div>`);
    })
    $('#cityNameInput').val('');
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
    $('.weekly-forecast-container').removeClass('hidden');
    let index = 0;

    for (let i = 0; i < fiveDayForecasts.length; i++) {
        index = fiveDayForecasts[i];
        let card = $('<div>').addClass('card');
        let cardBody1 = $('<div>').addClass('card-body border-bottom');
        let dateEl = $('<h5>').text(formatDate(res[index].dt_txt));
        let icon = res[index].weather[0].icon;
        let iconEl = $('<img>').attr('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
        let iconWrapper = $('<div>').addClass('icon-wrapper');
        let cardBody2 = $('<div>').addClass('card-body border-top');
        let tempEl = $(`<p>Temp: <span>${res[index].main.temp} &#176;F</span><p>`);
        let humidityEl = $(`<p>Humidity: <span>${res[index].main.humidity}</span></p>`);

        cardBody1.append(dateEl);
        iconWrapper.append(iconEl);
        cardBody2.append(tempEl, humidityEl);
        card.append(cardBody1, iconWrapper, cardBody2);
        $('.five-day-container').append(card);
    }
}

function displayCurrentWeather(response) {
    $('.weather-info-container').removeClass('hidden');
    $('#location').text(response.name + ' ' + getCurrentDate());
    let icon = response.weather[0].icon;
    $('#main-icon').attr('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
    $('#temperature').html(response.main.temp + ' &#176;F');
    $('#humidity').text(response.main.humidity + '%');
    $('#wind-speed').text(response.wind.speed + ' MPH');
}

function displayUVIndex(data) {
    $('#uv-index').html(`${data.value}`);
    if (data.value > 10) $('#uv-index').addClass('extreme');
    else if (data.value >= 8) $('#uv-index').addClass('very-high');
    else if (data.value >= 6) $('#uv-index').addClass('high');
    else if (data.value >= 3) $('#uv-index').addClass('moderate');
    else $('#uv-index').addClass('favorable');
}

function find3pmTimes(array) {
    let timeRegex = /15:00:00/

    for (let i = 0; i < array.length; i++) {
        if (timeRegex.test(array[i].dt_txt)) {
            fiveDayForecasts.push(i);
        }
    }
}

function formatDate(str) {
    let year = str.slice(0, 4);
    let month = str.slice(5, 7);
    let day = str.slice(8, 10);
    return `${month}/${day}/${year}`;
}

function getCurrentDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return mm + '/' + dd + '/' + yyyy;
}