// Set global variables, 
var owmAPI = "788d5638d7c8e354a162d6c9747d1bdf";
var currentCity = "";
var lastCity = "";

// Error handler for fetch, 
var handleErrors = (response) => {
  if (!response.ok) {
      throw Error(response.statusText);
  }
  return response;}

// Function to get and display the current conditions on Open Weather Maps
var getCurrentConditions = (event) => {
    // get city name from the search area
    let city = $('#search-city').val();
    currentCity= $('#search-city').val();
    // Set the queryURL to fetch from API 
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + owmAPI;
    fetch(queryURL)
    .then(handleErrors)
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        // Save city to local storage
     saveCity(city);
    $('#search-error').text("");
    // Create icon for the current weather
    let currentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
    // Offset UTC timezone - using moment.js
     let currentTimeUTC = response.dt;
     let currentTimeZoneOffset = response.timezone;
     let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
     let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
     // cities list
    renderCities();
    // Get the 5day forecast for the searched city
     getFiveDayForecast(event);
    // Set the header text to the found city name
    $('#header-text').text(response.name);
    // HTML for the results of search
    let currentWeatherHTML = `
    <h3>${response.name} ${currentMoment.format("(MMMM-DD-YYYY)")}<img src="${currentWeatherIcon}"></h3>
    <ul class="list-unstyled">
    <li>Temperature: ${response.main.temp}&#8457;</li>
    <li>Humidity: ${response.main.humidity}%</li>
    <li>Wind Speed: ${response.wind.speed} mph</li>
                
    </ul>`;

   
    // Get the results to the DOM
  $('#current-weather').html(currentWeatherHTML);
   
   let latitude = response.coord.lat;
   let longitude = response.coord.lon;
   let uvQueryURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + owmAPI;
        
   uvQueryURL = "https://cors-anywhere.herokuapp.com/" + uvQueryURL;
  // Fetch the UV information and build the color display for the UV index
    fetch(uvQueryURL)
    .then(handleErrors)
    .then((response) => {
    return response.json();
    })
   
    });}

// Function to obtain the five day forecast and display to HTML
var getFiveDayForecast = (event) => {
    let city = $('#search-city').val();
    // Set up URL for API search using forecast search
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + owmAPI;
    // Fetch from API
    fetch(queryURL)
        .then (handleErrors)
        .then((response) => {
            return response.json();
        })
    .then((response) => {
    // HTML template
    let fiveDayForecastHTML = `
    <h2>5-Day Forecast </h2>
    <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
    // Loop over the 5 day forecast 
     for (let i = 0; i < response.list.length; i++) 
     {
    let dayData = response.list[i];
    let dayTimeUTC = dayData.dt;
    let timeZoneOffset = response.city.timezone;
    let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
    let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
    let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            
            
            
  // Only displaying mid-day forecasts 11:00 to 13:00
    const validTimes = ["11:00:00", "12:00:00", "13:00:00"];

    if (validTimes.includes(thisMoment.format("HH:mm:ss")))
    {
    fiveDayForecastHTML += `
    <div class="weather-card card m-2 p0">
    <ul class="list-unstyled p-3">
    <li>${thisMoment.format("MM/DD/YY")}</li>
    <li class="weather-icon"><img src="${iconURL}"></li>
    <li>Temp: ${dayData.main.temp}&#8457;</li>
    <br>
    <li>Humidity: ${dayData.main.humidity}%</li>
    </ul>
    </div>`; }
    }
    // Build the HTML template
    fiveDayForecastHTML += `</div>`;
    // Append the five-day forecast to the DOM
             $('#five-day-forecast').html(fiveDayForecastHTML);
            })
             }

// Function to save the city to localStorage
var saveCity = (newCity) => {
    let cityExists = false;
    // Check if City exists in local storage
    for (let i = 0; i < localStorage.length; i++) {
       if (localStorage["cities" + i] === newCity) {
            cityExists = true;
           break;
      }
    }
    // Save to localStorage if city is new
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
  }


const renderCities = () => {
    const cityResults = document.querySelector('#city-results');
    cityResults.innerHTML = '';
  // when nothing in localStorage 
    if (localStorage.length === 0) 
    {
      const lastCity = lastCity || 'Charlotte';
      document.querySelector('#search-city').value = lastCity;
    } 
    // make key of last city in localStorage
    else {
      const lastCityKey = `cities${localStorage.length - 1}`;
      
      const lastCity = localStorage.getItem(lastCityKey);
      document.querySelector('#search-city').value = lastCity;
  
      for (let i = 0; i < localStorage.length; i++) {
        const city = localStorage.getItem(`cities${i}`);
        // active for currentCity
        const isActive = city === currentCity ? 'active' : '';
        const cityEl = `<button type="button" class="list-group-item list-group-item-action ${isActive}">${city}</button>`;
        cityResults.insertAdjacentHTML('afterbegin', cityEl);
      }
      // Add a "clear" button to page if there is a cities list
      const clearStorage = document.querySelector('#clear-storage');
      clearStorage.innerHTML = localStorage.length > 0 ? '<a id="clear-storage" href="#">clear</a>' : '';
    }
  };


// The button of New city search - event listener

document.querySelector('#search-button').addEventListener('click', function(event) 
     {
    event.preventDefault();
    var currentCity = document.querySelector('#search-city').value;
    getCurrentConditions(event);
     });
  // The button of searched city - event listener
  document.querySelector('#city-results').addEventListener('click', function(event) 
    {
    event.preventDefault();
    document.querySelector('#search-city').value = event.target.textContent;
    var currentCity = document.querySelector('#search-city').value;
    getCurrentConditions(event);
    });
  // Clear old searched cities 
  document.querySelector('#clear-storage').addEventListener('click', function(event) 
    {
    localStorage.clear();
    renderCities();
    });



// Render the searched cities
renderCities();

// Get the current conditions 
getCurrentConditions();