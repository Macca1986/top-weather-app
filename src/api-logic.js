// functions to make requests to the API
const apiKey = 'Y43FRSHKC6G9U393FST2NQSZ3';
const unitGroup = 'metric';
const contentType = 'json';
const include = 'current';

// Function to fetch weather data for a specific location
export function fetchWeatherData(location) {
  // Construct the API URL
  const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=${unitGroup}&key=${apiKey}&contentType=${contentType}&include=${include}`;
  console.log('API URL: ' + apiUrl);

  // Fetch weather data
  return fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Weather data:', data);
      // Log commonly accessed properties for convenience
      if (data.currentConditions) {
        console.log(`\n📍 ${data.resolvedAddress}`);
        console.log(`🌡️  Current: ${data.currentConditions.temp}°C (feels like ${data.currentConditions.feelslike}°C)`);
        console.log(`☁️  Conditions: ${data.currentConditions.conditions}`);
        console.log(`💨 Wind: ${data.currentConditions.windspeed} km/h`);
      }
      if (data.days && data.days.length > 0) {
        console.log(`📅 Today: ${data.days[0].tempmax}°C / ${data.days[0].tempmin}°C - ${data.days[0].conditions}`);
      }
      return data;
    })
    .catch(error => {
      console.error('Error fetching the weather data:', error);
      throw error;
    });
}

// Default behavior: fetch weather for London
const defaultLocation = 'London,UK';
export default fetchWeatherData(defaultLocation);