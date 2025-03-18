import './reset.css';
import './style.css';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { apiKey } from './secret.js';

// Steden met hun coördinaten
const cities = [
  { name: 'Dubai', lat: 25.276987, lon: 55.296249 },
  { name: 'Londen', lat: 51.507351, lon: -0.127758 },
  { name: 'New York', lat: 40.712776, lon: -74.005974 },
  { name: 'Sydney', lat: -33.86882, lon: 151.20929 },
  { name: 'Tokyo', lat: 35.689487, lon: 139.691711 },
];

async function getWeather(lat, lon, slideElement) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url); // hier gerbuik je de fetch api om data op te halen
    const data = await response.json();

    // Weerdata uitlezen
    const temp = Math.round(data.main.temp);
    const tempElement = slideElement.querySelector('.temp');

    tempElement.innerHTML = `${temp}°C`; // Toon temperatuur
  } catch (error) {
    console.log('Fout bij ophalen weerdata:', error);
  }
}

// Weer ophalen voor elke stad
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.swiper-slide');

  slides.forEach((slide, index) => {
    const city = cities[index];
    //const loader = slide.querySelector('.temp');

    // Laad temperatuur op
    getWeather(city.lat, city.lon, slide);
  });
});

// Init Swiper
new Swiper('.swiper', {
  modules: [Navigation, Pagination],
  direction: 'horizontal',
  loop: true,
  pagination: { el: '.swiper-pagination' },
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
});
