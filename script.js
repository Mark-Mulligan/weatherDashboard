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

            $('.weather-info-container').removeClass('hidden');

            let today = new Date();
            let dd = today.getDate();
            let mm = today.getMonth() + 1;
            let yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            //today = mm + '-' + dd + '-' + yyyy;
            today = mm + '/' + dd + '/' + yyyy;
        
            $('#location').text(response.name + ' ' + today);
            let icon = response.weather[0].icon;
            $('#main-icon').attr('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
            $('#temperature').html('Temperature: ' + response.main.temp + ' &#176;F');
            $('#humidity').text('Humidity: ' + response.main.humidity + '%');
            $('#wind-speed').text('Wind Speed: ' + response.wind.speed + ' MPH');

            let lat = response.coord.lat;
            let lon = response.coord.lon;

            let uviURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`

            $.ajax({
                url: uviURL,
                method: "GET"
            }).then(function (data) {
                $('#uv-index').text('UV Index: ' + data.value);
                
            })
        });


        const fiveDayURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=${units}`

        $.ajax({
            url: fiveDayURL,
            method: "GET"
        }).then(function (data) {

            $('.weekly-forecast-container').removeClass('hidden');
            let res = data.list;
            find3pmTimes(res);
            let index = 0;

            for (let i = 0; i < fiveDayForecasts.length; i++) {
                index = fiveDayForecasts[i];

                let card = $('<div>').addClass('card');
                let cardBody1 = $('<div>').addClass('card-body');
                cardBody1.addClass('border-bottom');
                let dateEl = $('<h5>').text(formatDate(res[index].dt_txt));
                let icon = res[index].weather[0].icon;
                let iconEl = $('<img>').attr('src', `http://openweathermap.org/img/wn/${icon}@2x.png`);
                let iconWrapper = $('<div>').addClass('icon-wrapper');
                //iconEl.addClass('img-fluid');
                let cardBody2 = $('<div>').addClass('card-body');
                cardBody2.addClass('border-top');
                let tempEl = $('<p>').html('temp: ' + res[index].main.temp + ' &#176;F');
                let humidityEl = $('<p>').text('humidity: ' + res[index].main.humidity);

                cardBody1.append(dateEl);
                iconWrapper.append(iconEl);
                cardBody2.append(tempEl, humidityEl);
                card.append(cardBody1, iconWrapper, cardBody2);

                $('.five-day-container').append(card);
            }



        })


        /*
        <div class="card" style="width: 17rem;">
                            <div class="card-body">
                                <h5 class="card-title">Card title</h5>
                            </div>
                            <img class="card-img-top" src="" alt="Card image cap">
                            <div class="card-body">
                                <p>Item 1</p>
                                <p>Item 2</p>
                            </div>
                        </div>

        */


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

function formatDate(str) {
    let year = str.slice(0, 4);
    let month = str.slice(5, 7);
    let day = str.slice(8,10);
    console.log(year);
    console.log(month);
    console.log(day);
    return `${month}/${day}/${year}`;
}