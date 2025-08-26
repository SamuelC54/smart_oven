# Smart Oven API SDK

A TypeScript SDK for the Smart Oven API, automatically generated from the OpenAPI specification.

## Features

- 🔧 **Auto-generated** from FastAPI's OpenAPI 3.1 specification
- 🎯 **Type-safe** TypeScript interfaces and API clients
- 📦 **Axios-based** HTTP client with interceptors support
- 🔄 **Easy regeneration** when API changes
- 📚 **Complete API coverage** - all endpoints included

## Installation

```bash
npm install smart-oven-api-sdk
```

## Quick Start

### Basic Usage

```typescript
import {
  Configuration,
  HealthApi,
  TemperatureApi,
  GpioApi,
} from "smart-oven-api-sdk";

// Configure the SDK
const config = new Configuration({
  basePath: "http://192.168.0.71:8081",
});

// Create API instances
const healthApi = new HealthApi(config);
const temperatureApi = new TemperatureApi(config);
const gpioApi = new GpioApi(config);

// Use the APIs
async function example() {
  try {
    // Check API health
    const health = await healthApi.health();
    console.log("API Status:", health.data);

    // Get current temperature
    const temp = await temperatureApi.getTemp();
    console.log("Temperature:", temp.data);

    // Control GPIO pin
    await gpioApi.setGpioEndpoint({
      pin: 18,
      state: true,
    });
    console.log("GPIO pin 18 set to HIGH");
  } catch (error) {
    console.error("API Error:", error);
  }
}
```

### Available APIs

The SDK provides the following API classes:

- **`HealthApi`** - Health check and system status endpoints
- **`TemperatureApi`** - Temperature sensor monitoring
- **`GpioApi`** - GPIO pin control and status
- **`DebugApi`** - Debug and diagnostic endpoints

### Type-Safe Models

All request/response models are fully typed:

```typescript
import { GPIORequest, TemperatureResponse } from "smart-oven-api-sdk";

const gpioRequest: GPIORequest = {
  pin: 18,
  state: true,
};

const handleTemperature = (response: TemperatureResponse) => {
  console.log(`Temperature: ${response.temperature}°${response.unit}`);
};
```

## Development

### Prerequisites

- Node.js 16+
- Running Smart Oven API at `http://localhost:8081`

### Setup

1. Clone and navigate to the SDK directory:

```bash
cd api-sdk
npm install
```

2. Make sure your Smart Oven API is running:

```bash
cd ../api
uvicorn app:app --host 0.0.0.0 --port 8081
```

3. Generate the SDK:

```bash
npm run generate
```

4. Build the SDK:

```bash
npm run build
```

### Scripts

- **`npm run generate`** - Generate TypeScript client from OpenAPI spec
- **`npm run build`** - Generate and compile TypeScript
- **`npm run compile`** - Compile TypeScript to JavaScript
- **`npm run clean`** - Clean generated files and build output
- **`npm run dev`** - Generate and watch for changes

### Regenerating the SDK

When the API changes, regenerate the SDK:

```bash
# Make sure API is running first
cd ../api
uvicorn app:app --host 0.0.0.0 --port 8081 &

# Generate new SDK
cd ../api-sdk
npm run generate
npm run build
```

## Configuration Options

### Custom Base URL

```typescript
const config = new Configuration({
  basePath: "http://your-api-server:8081",
});
```

### Request Interceptors

```typescript
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://192.168.0.71:8081",
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token, logging, etc.
    console.log("Making request to:", config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

const healthApi = new HealthApi(undefined, undefined, axiosInstance);
```

## API Reference

### Health API

- `root()` - Get API status
- `health()` - Health check with hardware status
- `corsTest()` - CORS test endpoint

### Temperature API

- `getTemp()` - Get current temperature reading
- `debugSensor()` - Get detailed sensor debug information

### GPIO API

- `setGpioEndpoint(request)` - Set GPIO pin state
- `testGpioAccess()` - Test GPIO access
- `getGpioStatus()` - Get GPIO status information

### Debug API

- `testSpiDirect()` - Test SPI access
- `getLogsEndpoint()` - Get application logs
- `debugMax31865()` - Debug MAX31865 sensor

## Error Handling

The SDK uses Axios for HTTP requests and includes proper error handling:

```typescript
import { AxiosError } from "axios";

try {
  const response = await temperatureApi.getTemp();
  console.log(response.data);
} catch (error) {
  if (error instanceof AxiosError) {
    console.error("API Error:", error.response?.data);
    console.error("Status Code:", error.response?.status);
  } else {
    console.error("Network Error:", error.message);
  }
}
```

## Contributing

1. Make changes to the Smart Oven API
2. Regenerate the SDK: `npm run generate`
3. Test the changes
4. Build: `npm run build`
5. Update version in `package.json`

## License

MIT License - see LICENSE file for details.
