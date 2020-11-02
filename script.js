let fiveDayForecasts = [];

$('#search-btn').click(function () {
    event.preventDefault();
    $('.five-day-container').empty();
    fiveDayForecasts = [];

    if ($('#cityNameInput').val() !== '') {
        let cityName = $('#cityNameInput').val().trim();
        $('#citynameInput').val('');

        const apiKey = "af81902a8a73c933aeffc3228ff6f7f1"
        const units = "imperial"
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${units}`

        //`https://api.openweathermap.org/data/2.5/weather?q=dallas&appid=af81902a8a73c933aeffc3228ff6f7f1&units=imperial`

        $.ajax({
            url: url,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            $('#location').text(response.name);
            let icon = response.weather[0].icon;
            $('#main-icon').attr('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
            $('#temperature').html(response.main.temp + ' &#176;F');
            $('#humidity').text(response.main.humidity + '%');
            $('#wind-speed').text(response.wind.speed + ' MPH');

            let lat = response.coord.lat;
            let lon = response.coord.lon;

            let uviURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`

            $.ajax({
                url: uviURL,
                method: "GET"
            }).then(function (data) {
                $('#uv-index').text(data.value);
            })
        });


        const fiveDayURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=${units}`

        $.ajax({
            url: fiveDayURL,
            method: "GET"
        }).then(function (data) {
            let res = data.list;
            find3pmTimes(res);
            let index = 0;

            for (let i = 0; i < fiveDayForecasts.length; i++) {
                index = fiveDayForecasts[i];

                let dateEl = $('<h2>').text(formatDate(res[index].dt_txt));
                let icon = res[index].weather[0].icon;
                let iconEl = $('<img>').attr('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
                let tempEl = $('<p>').html('temp: ' + res[index].main.temp + ' &#176;F');
                let humidityEl = $('<p>').text('humidity: ' + res[index].main.humidity);

                $('.five-day-container').append(dateEl, iconEl, tempEl, humidityEl);
            }



        })

            //http://openweathermap.org/img/wn/10d@2x.png

        //https://api.openweathermap.org/data/2.5/forecast?q=dallas&appid=af81902a8a73c933aeffc3228ff6f7f1&units=imperial`




        /* 
        date 
        picture
        temp 
        humidity
        */

    }
})

function find3pmTimes(array) {
    let timeRegex = /15:00:00/

    for (let i = 0; i < array.length; i++) {
        if (timeRegex.test(array[i].dt_txt)) {
            fiveDayForecasts.push(i);
        }
    }
}

function formatDate (str) {
    let year = str.slice(0, 4);
    let dayMonth = str.slice(5,10);
    return dayMonth + '-' + year;
}