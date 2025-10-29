import './styles.css';
import './api-logic.js';
import { fetchWeatherData } from './api-logic.js';

console.log('Hello World');

// Make fetchWeatherData available globally for console access
window.fetchWeatherData = fetchWeatherData;

// Helper functions for UI updates
function displayWeather(data) {
  const weatherDisplay = document.getElementById('weather-display');
  const locationName = document.getElementById('location-name');
  const currentTime = document.getElementById('current-time');
  const currentTemp = document.getElementById('current-temp');
  const feelsLike = document.getElementById('feels-like');
  const conditions = document.getElementById('conditions');
  const tempMax = document.getElementById('temp-max');
  const tempMin = document.getElementById('temp-min');
  const humidity = document.getElementById('humidity');
  const windSpeed = document.getElementById('wind-speed');
  
  // Set location and timezone
  locationName.textContent = data.resolvedAddress;
  const timezone = data.timezone || 'UTC';
  const now = new Date();
  currentTime.textContent = now.toLocaleString('en-US', { 
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Current conditions
  if (data.currentConditions) {
    const current = data.currentConditions;
    currentTemp.textContent = `${Math.round(current.temp)}°C`;
    feelsLike.textContent = `Feels like ${Math.round(current.feelslike)}°C`;
    conditions.textContent = current.conditions;
    
    // Determine if it's night time (8pm - 6am)
    const isNight = isNightTime(timezone);
    
    // Set body class for background changes based on weather and time
    const weatherCondition = current.icon || current.conditions;
    const classes = getWeatherClass(weatherCondition, isNight);
    document.body.className = classes;
    
    // Add weather effects (rain, sun rays)
    updateWeatherEffects(weatherCondition, document.body, isNight);
    
    // Additional details
    humidity.textContent = `${Math.round(current.humidity)}%`;
    windSpeed.textContent = `${Math.round(current.windspeed)} km/h`;
  }
  
  // Today's forecast
  if (data.days && data.days.length > 0) {
    const today = data.days[0];
    tempMax.textContent = `${Math.round(today.tempmax)}°C`;
    tempMin.textContent = `${Math.round(today.tempmin)}°C`;
  }
  
  // Weather display is always visible to prevent layout shift
  // Data is now populated so content will appear
}

function isNightTime(timezone) {
  // Determine if it's night time (8pm - 6am local time)
  const now = new Date();
  // Get the hour in the specified timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
        hour12: false
  });
  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find(part => part.type === 'hour').value);
  return hour >= 20 || hour < 6;
}

function getWeatherClass(iconOrConditions, isNight) {
  // Helper function to determine weather class for background changes
  const condition = iconOrConditions.toLowerCase();
  const timeClass = isNight ? 'night' : 'day';
  
  let weatherClass = '';
  if (condition.includes('clear') || condition.includes('sunny')) {
    weatherClass = 'weather-clear';
  } else if (condition.includes('rain')) {
    weatherClass = 'weather-rain';
  } else if (condition.includes('cloud')) {
    weatherClass = 'weather-cloudy';
  } else if (condition.includes('snow')) {
    weatherClass = 'weather-snow';
  } else if (condition.includes('storm') || condition.includes('thunder')) {
    weatherClass = 'weather-storm';
  } else if (condition.includes('fog') || condition.includes('mist')) {
    weatherClass = 'weather-fog';
  } else {
    weatherClass = 'weather-default';
  }
  
  return `${weatherClass} ${timeClass}`.trim();
}

function updateWeatherEffects(iconOrConditions, bodyElement, isNight) {
  // Remove existing effect classes
  bodyElement.classList.remove('has-rain-effect', 'has-sun-rays-effect');
  
  const condition = iconOrConditions.toLowerCase();
  
  // Add rain effect for rainy/stormy conditions
  if (condition.includes('rain') || condition.includes('storm') || condition.includes('thunder')) {
    bodyElement.classList.add('has-rain-effect');
  }
  
  // Add sun rays for clear/sunny conditions during day
  if (!isNight && (condition.includes('clear') || condition.includes('sunny'))) {
    bodyElement.classList.add('has-sun-rays-effect');
  }
}

function showLoading(show) {
  const loading = document.getElementById('loading');
  if (show) {
    loading.classList.remove('hidden');
  } else {
    loading.classList.add('hidden');
  }
}

function showError(message) {
  const errorMsg = document.getElementById('error-message');
  errorMsg.textContent = message;
  errorMsg.classList.remove('hidden');
}

function hideError() {
  const errorMsg = document.getElementById('error-message');
  errorMsg.classList.add('hidden');
}

function hideWeather() {
  // Don't hide the weather display - just leave it showing previous data
  // This prevents the layout shift/jank when loading new data
}

// Form handling
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('weather-form');
  const locationInput = document.getElementById('location-input');
  
  // Load London weather on page load
  const defaultLocation = 'London,UK';
  showLoading(true);
  try {
    const data = await fetchWeatherData(defaultLocation);
    displayWeather(data);
  } catch (error) {
    console.error('Failed to load initial weather:', error);
    showError('Failed to load initial weather data.');
  } finally {
    showLoading(false);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page refresh
    
    const location = locationInput.value.trim();
    
    if (!location) {
      console.log('Please enter a location');
      return;
    }

    console.log(`Fetching weather for: ${location}`);
    
    // Show loading state but keep previous weather visible to prevent layout shift
    showLoading(true);
    hideError();
    
    try {
      const data = await fetchWeatherData(location);
      console.log('Weather results:', data);
      displayWeather(data);
      // Clear the input after submitting
      locationInput.value = '';
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      showError('Failed to fetch weather data. Please try again.');
    } finally {
      showLoading(false);
    }
  });
});

