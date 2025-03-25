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

async function getWeather(lat, lon, slideElement) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url); // Use the fetch API to get data
    const data = await response.json();

    // Read weather data and increase temperature by 5 degrees
    const temp = Math.round(data.main.temp);
    const adjustedTemp = temp + 5;
    const tempElement = slideElement.querySelector('.temp');

    tempElement.innerHTML = `${adjustedTemp}°C`; // Display increased temperature
  } catch (error) {
    console.log('Error fetching weather data:', error);
  }
}

// Fetch weather for each city
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.swiper-slide');

  slides.forEach((slide, index) => {
    const city = cities[index];

    // Load temperature
    getWeather(city.lat, city.lon, slide);
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
const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00008b });
cities.forEach((city) => {
  const { lat, lon, name } = city;

  // Convert to radians with Europe-centered map adjustment
  const latRad = lat * (Math.PI / 180);
  // No longitude shift needed as Europe is already centered
  const lonRad = lon * (Math.PI / 180);

  // Radius of globe is 2
  const radius = 2;

  // Calculate 3D position (z-axis points to front where Europe is centered)
  const x = radius * Math.cos(latRad) * Math.sin(lonRad);
  const y = radius * Math.sin(latRad);
  const z = -radius * Math.cos(latRad) * Math.cos(lonRad);

  const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.position.set(x, y, z);
  globe.add(marker);

  // Create city label using CanvasTexture instead of DOM elements
  const canvas = document.createElement('canvas');
  const size = 256; // canvas size can be adjusted
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
  sprite.position.set(x, y + 0.3, z); // moved label further up
  globe.add(sprite);
});

// Set initial rotation for proper alignment
globe.rotation.y = 0; // Europe centered - no initial rotation needed

function animate() {
  globe.rotation.y += 0.005;
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
