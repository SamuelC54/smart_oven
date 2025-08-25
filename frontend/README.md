# Smart Oven Frontend

A React-based frontend for the Smart Oven application with TanStack Router, Jotai state management, and TanStack Query for API calls.

## Environment Variables

The application uses environment variables to configure the API endpoint. Create a `.env` or `.env.local` file in the frontend directory with the following variables:

```env
VITE_API_URL=http://192.168.0.71:8081/
```

### Available Environment Variables

- `VITE_API_URL`: The base URL for the API server (defaults to `http://localhost:8081/`)

### Environment Files

- `.env`: Local environment variables (not committed to git)
- `.env.local`: Local environment variables with higher priority (not committed to git)
- `.env.example`: Example environment file (committed to git)

### Troubleshooting Environment Variables

If the environment variables are not being loaded:

1. **Restart the development server** after creating/modifying .env files
2. **Use .env.local** instead of .env for local development
3. **Check the file format** - ensure no extra spaces or quotes
4. **Verify the variable name** starts with `VITE_` for client-side access

### CORS Issues

If you encounter CORS errors when connecting to your API:

1. **API Server CORS**: Ensure your API server has CORS middleware configured
2. **Allowed Origins**: The API should allow requests from your frontend origin
3. **Network Access**: Verify the API server is accessible from your frontend
4. **Port Configuration**: Check that the API server is running on the correct port

### Environment Variable Priority

Vite loads environment variables in this order (highest to lowest priority):

1. `.env.local` (always loaded, ignored by git)
2. `.env.development` (when NODE_ENV=development)
3. `.env` (always loaded)

## API Services

The application uses TanStack Query for API calls, organized in a services folder structure. Each API endpoint has its own service file with queries and mutations.

### Services Structure

```
src/services/
├── api.ts              # Base API configuration
├── health.ts           # Health check service
├── temperature.ts      # Temperature control service
├── gpio.ts            # GPIO control service
├── debug.ts           # Debug information service
└── index.ts           # Service exports
```

### Usage Examples

#### Health Check

```typescript
import { useHealth } from '../services/health';

function MyComponent() {
  const { data: health, isLoading, error } = useHealth();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Status: {health?.status}</div>;
}
```

#### Temperature Control

```typescript
import { useTemperature, useSetTemperature } from '../services/temperature';

function TemperatureControl() {
  const { data: temp, isLoading } = useTemperature();
  const setTempMutation = useSetTemperature();

  const handleSetTemp = () => {
    setTempMutation.mutate(180); // Set to 180°C
  };

  return (
    <div>
      <p>Current: {temp?.current}°C</p>
      <p>Target: {temp?.target}°C</p>
      <button onClick={handleSetTemp} disabled={setTempMutation.isPending}>
        Set to 180°C
      </button>
    </div>
  );
}
```

#### GPIO Control

```typescript
import { useGpioStatus, useSetGpio } from '../services/gpio';

function GpioControl() {
  const { data: gpioStatus } = useGpioStatus();
  const setGpioMutation = useSetGpio();

  const handleTogglePin = (pin: string) => {
    const currentValue = gpioStatus?.[pin] || false;
    setGpioMutation.mutate({ pin, value: !currentValue });
  };

  return (
    <div>
      {Object.entries(gpioStatus || {}).map(([pin, value]) => (
        <div key={pin}>
          Pin {pin}: {value ? 'ON' : 'OFF'}
          <button onClick={() => handleTogglePin(pin)}>Toggle</button>
        </div>
      ))}
    </div>
  );
}
```

### Available Services

- **Health**: `useHealth()` - Check API health status
- **Temperature**:
  - `useTemperature()` - Get current and target temperature
  - `useSetTemperature()` - Set target temperature
- **GPIO**:
  - `useGpioStatus()` - Get GPIO pin status
  - `useSetGpio()` - Set GPIO pin value
- **Debug**: `useDebugInfo()` - Get debug information

### Features

- **Automatic Refetching**: Services automatically refetch data at appropriate intervals
- **Cache Management**: TanStack Query handles caching and invalidation
- **Error Handling**: Built-in error states and retry logic
- **Loading States**: Automatic loading states for better UX
- **Optimistic Updates**: Mutations can trigger immediate UI updates
- **DevTools**: React Query DevTools for debugging

## Real-Time Temperature Integration

The application now uses real temperature data from the API instead of simulated values. The temperature service automatically:

- **Fetches real-time data** every 5 seconds from your oven's temperature sensors
- **Updates the UI** with current and target temperature values
- **Handles temperature adjustments** through the API when you change the target temperature
- **Provides error handling** and loading states for better user experience

### Temperature Features

- **Real-time Updates**: Temperature data refreshes automatically every 5 seconds
- **API Integration**: All temperature changes are sent to your oven's API
- **Error Handling**: Displays error messages if the API is unavailable
- **Loading States**: Shows loading indicators during API calls
- **Fallback Support**: Falls back to local state if API is not available

### Usage in Components

The `OvenDashboard` component now uses real temperature data:

```typescript
// Real temperature data from API
const {
  data: temperatureData,
  isLoading: tempLoading,
  error: tempError,
} = useTemperature();
const setTempMutation = useSetTemperature();

// Use real temperature data if available, fallback to atoms
const realCurrentTemp = temperatureData?.current ?? currentTemp;
const realTargetTemp = temperatureData?.target ?? targetTemp;
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Project Structure

```
src/
├── components/          # React components
├── routes/             # TanStack Router routes
├── services/           # API services with TanStack Query
├── store/              # Jotai atoms and state
├── providers/          # React providers (Query, Jotai)
└── styles/             # Global styles
```

## API Testing

Use the `ServicesExample` component to test API connectivity:

```typescript
import { ServicesExample } from './components/ServicesExample';

// Add to any route to test API connection
<ServicesExample />
```
