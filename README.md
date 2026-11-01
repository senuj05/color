# Color

A small web page that pairs a piece of art with the weather and time around the world. The main stage shows Claude Monet's *Water Lilies* (1906), and a sidebar shows the weather for any city you search plus clocks for major cities.

## Features

- **Your location:** detects your city and country from the browser's location (you'll be asked for permission).
- **Weather search:** type a city name to see its current temperature, weather condition and wind speed, with an icon that switches to a moon at night.
- **Local time and world clocks:** shows your local time plus live times for New York, London, Tokyo, Sydney, Paris and Colombo, updated every second.
- **Featured artwork:** Monet's *Water Lilies* with its artist, description, medium, dimensions and credit line.

## Getting started

No build step or API keys are needed. Clone the repo and open the page:

```bash
git clone https://github.com/senuj05/color.git
cd color
open index.html
```

## Project structure

```
index.html          Page layout: sidebar and artwork stage
style.css           Styles
script.js           Weather search, location and clocks
src/waterlilies.png Artwork image
src/weather-icon/   Weather condition icons
```

## Built with

- HTML, CSS and plain JavaScript
- [Open-Meteo](https://open-meteo.com/) for city search (geocoding) and current weather
- [BigDataCloud](https://www.bigdatacloud.com/) for turning your coordinates into a city name

## Credits

Artwork information for *Water Lilies* (1906) by Claude Monet is from the [Art Institute of Chicago](https://www.artic.edu/artworks/16568/water-lilies), Mr. and Mrs. Martin A. Ryerson Collection, 1933.1157.

© 2026 Senuvi Jayasinghe
