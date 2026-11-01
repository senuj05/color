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


// the city picked in the last search, used by every tab
let selectedPlace = null;
let activeTab = "current";

const searchError = document.getElementById("search-error");
const tabStatus = document.getElementById("tab-status");

// search with the Enter key as well as the button
cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") getWeather();
});

async function getWeather(){
    const city = cityInput.value.trim();
    searchError.innerText = "";

    // empty search
    if (city === "") {
        searchError.innerText = "Please enter a city name.";
        return;
    }

    try {
        //  geo coding API
        const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
        const geoResponse = await fetch(geoURL);
        if (!geoResponse.ok) {
            throw new Error(`Geocoding request failed (${geoResponse.status})`);
        }
        const geoData = await geoResponse.json();
        console.log(geoData)

        // city not found
        if (!geoData.results || geoData.results.length === 0) {
            searchError.innerText = `No city found called "${city}". Check the spelling and try again.`;
            return;
        }

        const place = geoData.results[0];
        selectedPlace = {
            name: place.name,
            country: place.country,
            latitude: place.latitude,
            longitude: place.longitude
        };

        if (place.country && place.name != place.country) {
            document.getElementById("city").innerText = `${place.name}, ${place.country}`;
        }
        else {
            document.getElementById("city").innerText = place.name;
        }

        // reload whichever tab is open for the new city
        showTab(activeTab);
    } catch (error) {
        console.log(error);
        searchError.innerText = "Could not reach the weather service. Check your internet connection and try again.";
    }
}

// switching tabs shows that panel and sends a new GET request for only its data
const tabButtons = document.querySelectorAll(".tab-btn");
tabButtons.forEach(button => {
    button.addEventListener("click", () => showTab(button.dataset.tab));
});

async function showTab(tab) {
    activeTab = tab;

    tabButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.tab === tab);
    });
    document.getElementById("current-panel").hidden = tab !== "current";
    document.getElementById("forecast-panel").hidden = tab !== "forecast";
    document.getElementById("air-panel").hidden = tab !== "air";

    if (!selectedPlace) {
        tabStatus.innerText = "Search for a city first.";
        return;
    }

    tabStatus.innerText = "Loading...";
    try {
        if (tab === "current") await getCurrentWeather();
        if (tab === "forecast") await getForecast();
        if (tab === "air") await getAirQuality();
        tabStatus.innerText = "";
    } catch (error) {
        console.log(error);
        tabStatus.innerText = "Could not load this data. Please try again.";
    }
}

// fetch JSON and throw if the server returns an error
async function getJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
    }
    return response.json();
}

// end-point 1: current weather
async function getCurrentWeather() {
    const { latitude, longitude } = selectedPlace;
    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
    const weatherData = await getJSON(weatherURL);
    console.log(weatherData)

    const temperature = weatherData.current_weather.temperature;
    const windSpeed = weatherData.current_weather.windspeed;
    const weatherCode = weatherData.current_weather.weathercode;
    const isDay = weatherData.current_weather.is_day;
    let [weatherCondition, weatherImage] = weatherCodeMap[weatherCode] || ["Unknown", "cloud.svg"];

    // show the moon instead of the sun at night
    if (!isDay && weatherImage === "sun.svg") {
        weatherImage = "moon.svg";
    }

    document.getElementById("weather-icon").src = ICON_PATH + weatherImage;
    document.getElementById("temp").innerText = `${temperature}`;
    document.getElementById("weather").innerText = weatherCondition;
    document.getElementById("wind-speed").innerText = windSpeed;
}

// end-point 2: 7-day forecast
async function getForecast() {
    const { latitude, longitude } = selectedPlace;
    const forecastURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`;
    const forecastData = await getJSON(forecastURL);
    console.log(forecastData)

    const daily = forecastData.daily;
    const forecastList = document.getElementById("forecast-list");
    forecastList.innerHTML = "";

    daily.time.forEach((date, i) => {
        const [condition, image] = weatherCodeMap[daily.weather_code[i]] || ["Unknown", "cloud.svg"];
        const dayName = new Date(date + "T00:00").toLocaleDateString([], { weekday: "short" });

        const item = document.createElement("li");
        item.innerHTML = `<img src="${ICON_PATH + image}" alt="" width="20" height="20" />`;
        item.append(` ${dayName}: ${daily.temperature_2m_min[i]}° / ${daily.temperature_2m_max[i]}°C, ${condition}`);
        forecastList.appendChild(item);
    });
}

// end-point 2: air quality
async function getAirQuality() {
    const { latitude, longitude } = selectedPlace;
    const airURL = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10`;
    const airData = await getJSON(airURL);
    console.log(airData)

    const aqi = airData.current.us_aqi;
    document.getElementById("aqi").innerText = aqi ?? "N/A";
    document.getElementById("aqi-level").innerText = getAqiLevel(aqi);
    document.getElementById("pm25").innerText = airData.current.pm2_5 ?? "N/A";
    document.getElementById("pm10").innerText = airData.current.pm10 ?? "N/A";
}

// turn the AQI number into a description
function getAqiLevel(aqi) {
    if (aqi == null) return "No data";
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for sensitive groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very unhealthy";
    return "Hazardous";
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
