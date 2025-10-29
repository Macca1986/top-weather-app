import './styles.css';
import './api-logic.js';
import { fetchWeatherData } from './api-logic.js';

console.log('Hello World');

// Make fetchWeatherData available globally for console access
window.fetchWeatherData = fetchWeatherData;

