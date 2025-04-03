import './reset.css';
import './style.css';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { apiKey } from './secret.js';
import * as THREE from 'three';

const cities = [
  { name: 'Dubai', lat: 25.276987, lon: 55.296249 },
  { name: 'London', lat: 51.507351, lon: -0.127758 },
  { name: 'New York', lat: 40.712776, lon: -74.005974 },
  { name: 'Sydney', lat: -33.86882, lon: 151.20929 },
  { name: 'Tokyo', lat: 35.689487, lon: 139.691711 },
];

async function getWeather(lat, lon, slideElement, cityName) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url); // Use the fetch API to get data
    const data = await response.json();

    // Read weather data and increase temperature by 5 degrees
    const temp = Math.round(data.main.temp);
    const adjustedTemp = temp + 5;
    const tempElement = slideElement.querySelector('.temp');

    tempElement.innerHTML = `${adjustedTemp}°C`; // Display increased temperature

    // Add temperature to the 3D globe marker
    addTemperatureToMarker(cityName, adjustedTemp);
  } catch (error) {
    console.log('Error fetching weather data:', error);
  }
}

function addTemperatureToMarker(cityName, temp) {
  const city = cities.find((city) => city.name === cityName);
  if (!city) return;

  const { lat, lon } = city;

  // Convert latitude and longitude to radians
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(-lon);

  const radius = 2; // Globe radius

  // Convert spherical coordinates to Cartesian
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  // Create label canvas for the temperature
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);
  ctx.font = '50px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(`${temp}°C`, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.6, 0.6, 0.6);

  // For cities in the southern hemisphere, set the temperature label underneath the city name.
  // Adjust the y-offset: use a larger positive offset for northern hemisphere cities.
  const tempYOffset = lat < 0 ? -0.4 : 0.4; // Increased offset for the northern hemisphere

  sprite.position.set(x, y + tempYOffset, z);

  globe.add(sprite);
}

// Fetch weather for each city
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.swiper-slide');

  slides.forEach((slide, index) => {
    const city = cities[index];

    // Load temperature and position on globe
    getWeather(city.lat, city.lon, slide, city.name);
  });
});

// Initialize Swiper
new Swiper('.swiper', {
  modules: [Navigation, Pagination],
  direction: 'horizontal',
  loop: true,
  pagination: { el: '.swiper-pagination' },
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

document.body.style.overflowX = 'hidden'; // Prevent horizontal scrollbar

// Create the globe
const textureLoader = new THREE.TextureLoader();
const globeTexture = textureLoader.load('./public/images/Wereldkaart.jpeg');
const geometry = new THREE.SphereGeometry(2, 64, 64);
const material = new THREE.MeshBasicMaterial({ map: globeTexture });
const globe = new THREE.Mesh(geometry, material);
scene.add(globe);

camera.position.z = 5;

// Add markers
new THREE.MeshBasicMaterial({ color: 0x00008b });
// Corrected Marker Positioning
cities.forEach((city) => {
  const { lat, lon, name } = city;

  // Convert latitude and longitude to radians
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(-lon); // Negative to correct map orientation

  const radius = 2; // Globe radius

  // Correct spherical to Cartesian conversion
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  // Marker
  const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00008b });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.position.set(x, y, z);
  globe.add(marker);

  // City label
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.font = '50px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(name, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.7, 0.7, 0.7); // Increased from 0.5

  // Use a conditional offset: if the city's latitude is below 0, subtract the offset to place the label underneath.
  const labelYOffset = lat < 0 ? -0.2 : 0.2;
  sprite.position.set(x, y + labelYOffset, z);
  globe.add(sprite);
});

// Set initial rotation for proper alignment
globe.rotation.y = 0; // Europe centered - no initial rotation needed

function animate() {
  globe.rotation.y += 0.003;
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
