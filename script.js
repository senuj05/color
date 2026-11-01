const ICON_PATH = "src/weather-icon/";

const weatherCodeMap = {
    0: ["Clear Sky", "sun.svg"],
    1: ["Mainly Clear", "sun.svg"],
    2: ["Partly Cloudy", "sun-behind-cloud.svg"],
    3: ["Overcast", "cloud.svg"],
    45: ["Fog", "fog.svg"],
    48: ["Depositing Rime Fog", "fog.svg"],
    51: ["Light Drizzle", "cloud-with-rain.svg"],
    53: ["Moderate Drizzle", "cloud-with-rain.svg"],
    55: ["Dense Drizzle", "cloud-with-rain.svg"],
    56: ["Light Freezing Drizzle", "cloud-with-rain.svg"],
    57: ["Dense Freezing Drizzle", "cloud-with-rain.svg"],
    61: ["Slight Rain", "cloud-with-rain.svg"],
    63: ["Moderate Rain", "cloud-with-rain.svg"],
    65: ["Heavy Rain", "cloud-with-rain.svg"],
    66: ["Light Freezing Rain", "cloud-with-rain.svg"],
    67: ["Dense Freezing Rain", "cloud-with-rain.svg"],
    71: ["Light Snow", "snowflake.svg"],
    73: ["Moderate Snow", "snowflake.svg"],
    75: ["Heavy Snow", "snowflake.svg"],
    77: ["Snow Grains", "snowflake.svg"],
    80: ["Slight Rain Showers", "cloud-with-rain.svg"],
    81: ["Moderate Rain Showers", "cloud-with-rain.svg"],
    82: ["Violent Rain Showers", "cloud-with-rain.svg"],
    85: ["Slight Snow Showers", "snowflake.svg"],
    86: ["Heavy Snow Showers", "snowflake.svg"],
    95: ["Thunderstorm", "cloud-with-lightning.svg"],
    96: ["Thunderstorm With Slight Hail", "cloud-with-lightning.svg"],
    99: ["Thunderstorm With Heavy Hail", "cloud-with-lightning.svg"]
};
const cityInput = document.getElementById("input-city");
const searchButton = document.getElementById("search-btn");
searchButton.addEventListener("click",getWeather);


async function getWeather(){
    const city = cityInput.value.trim();
    console.log(city)

    //  geo coding API
    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    const geoResponse = await fetch(geoURL);
    const geoData = await geoResponse.json();
    console.log(geoData)

    const latitude = geoData.results[0].latitude;
    const longitude = geoData.results[0].longitude;
    const country = geoData.results[0].country;
    
    // weather API
    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
    const weatherResponse = await fetch(weatherURL);
    const weatherData = await weatherResponse.json();
    console.log(weatherData)

    const temperature = weatherData.current_weather.temperature;
    const windSpeed = weatherData.current_weather.windspeed;
    const weatherCode = weatherData.current_weather.weathercode;
    const timezone = weatherData.timezone;
    const isDay = weatherData.current_weather.is_day;
    let [weatherCondition, weatherImage] = weatherCodeMap[weatherCode] || ["Unknown", "cloud.svg"];

    // show the moon instead of the sun at night
    if (!isDay && weatherImage === "sun.svg") {
        weatherImage = "moon.svg";
    }

    if (country && city != country) {
        document.getElementById("city").innerText = `${city}, ${country}`;
    }
    else {
        document.getElementById("city").innerText = city;
    }


    document.getElementById("weather-icon").src = ICON_PATH + weatherImage;
    document.getElementById("temp").innerText = `${temperature}`;
    document.getElementById("weather").innerText = weatherCondition;
    document.getElementById("wind-speed").innerText = windSpeed;
    document.getElementById("local-time-value").innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

//  function to get the current location and display it
function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // reverse geocoding API to get the city name from latitude and longitude
        const geoURL = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        const geoResponse = await fetch(geoURL);
        const geoData = await geoResponse.json();
        console.log(geoData)

        const city = geoData.city || geoData.locality;
        const country = geoData.countryName;
        document.getElementById("current-location").innerText = `${city}, ${country}`;
    }, (error) => {
        // user blocked location access or it's unavailable
        console.log(error);
        document.getElementById("current-location").innerText = "Location not available";
    });
}
getCurrentLocation(); // Call the function to get the current location and display it

//  function to get the current time in a specific timezone
function getTime(zone){
    return new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', timeZone: zone});
}

function updateCityTimes() {
    document.getElementById("local-time-value").innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById("new-york-time").innerText = getTime("America/New_York");
    document.getElementById("london-time").innerText = getTime("Europe/London");
    document.getElementById("tokyo-time").innerText = getTime("Asia/Tokyo");
    document.getElementById("sydney-time").innerText = getTime("Australia/Sydney");
    document.getElementById("paris-time").innerText = getTime("Europe/Paris");
    document.getElementById("colombo-time").innerText = getTime("Asia/Colombo");
}

updateCityTimes();
setInterval(updateCityTimes, 1000); // Update every second
