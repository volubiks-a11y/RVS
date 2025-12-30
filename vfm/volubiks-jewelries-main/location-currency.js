// Utility script to detect user's location, language, and currency, and provide currency conversion

const BASE_CURRENCY = 'NGN'; // Assuming base currency is Nigerian Naira

// Function to detect location using IP geolocation
async function detectLocation() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    const data = await response.json();
    return {
      country: data.country_name,
      countryCode: data.country_code,
      currency: data.currency,
      language: data.languages ? data.languages[0].split('-')[0] : 'en' // Take first language, e.g., 'en' from 'en-US'
    };
  } catch (error) {
    console.error('Error detecting location:', error);
    // Fallback to defaults
    return {
      country: 'Nigeria',
      countryCode: 'NG',
      currency: 'NGN',
      language: 'en'
    };
  }
}

// Function to fetch exchange rates
async function fetchExchangeRates(base = BASE_CURRENCY) {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}

// Function to convert price to user's currency
async function convertCurrency(price, targetCurrency) {
  const rates = await fetchExchangeRates();
  if (!rates || !rates[targetCurrency]) {
    console.warn(`Exchange rate for ${targetCurrency} not available`);
    return price; // Return original price if conversion fails
  }
  return price * rates[targetCurrency];
}

// Main function to get user preferences and conversion function
export async function getUserLocalization() {
  const location = await detectLocation();
  const convertPrice = (price) => convertCurrency(price, location.currency);
  return {
    ...location,
    convertPrice
  };
}

// Example usage (uncomment to test in browser console):
// getUserLocalization().then(data => console.log(data));

// To convert a price: data.convertPrice(1000).then(converted => console.log(converted));