# Frontend Services

This directory contains all the service hooks for the Smart Oven frontend, organized into two main categories:

## 📁 Structure

```
services/
├── api/                    # Hardware/oven control services
│   ├── useOvenApi.ts      # All oven API calls
│   └── index.ts           # API services exports
├── db/                    # Database services (Convex)
│   ├── useRecipes.ts      # Recipe management
│   ├── useCookingSessions.ts # Cooking session management
│   ├── useOvenSettings.ts # User settings management
│   └── index.ts           # Database services exports
├── index.ts               # Main services exports
└── README.md              # This file
```

## 🔧 API Services (`/api`)

Services that interact with the Python API for hardware control:

### `useOvenApi.ts`

- **`useHealth()`** - Check API health status
- **`useTemperature()`** - Get current temperature (auto-refreshes every 5s)
- **`useGpioStatus()`** - Get GPIO pin status
- **`useSetGpio()`** - Set GPIO pin state
- **`useSensorDebug()`** - Get sensor debug information
- **`useDebugMax31865()`** - Debug MAX31865 temperature sensor
- **`useSpiTest()`** - Test SPI communication
- **`useGpioTest()`** - Test GPIO functionality
- **`useCorsTest()`** - Test CORS configuration
- **`useDebugInfo()`** - Get system debug information
- **`useLogs()`** - Get system logs
- **`useRoot()`** - Root API endpoint

## 🗄️ Database Services (`/db`)

Services that interact with the Convex database:

### `useRecipes.ts`

- **`useRecipes(options)`** - Get recipes with filtering
- **`useRecipe(id)`** - Get single recipe by ID
- **`useSearchRecipes(term, limit)`** - Search recipes
- **`usePopularRecipes(limit)`** - Get popular recipes
- **`useCreateRecipe()`** - Create new recipe
- **`useUpdateRecipe()`** - Update recipe
- **`useToggleFavorite()`** - Toggle favorite status
- **`useDeleteRecipe()`** - Delete recipe

### `useCookingSessions.ts`

- **`useActiveSession()`** - Get current active session
- **`useCookingSessions(options)`** - Get sessions with filtering
- **`useCookingSession(id)`** - Get single session by ID
- **`useCookingStats()`** - Get session statistics
- **`useStartCookingSession()`** - Start new session
- **`useUpdateCookingSession()`** - Update session
- **`usePauseCookingSession()`** - Pause session
- **`useResumeCookingSession()`** - Resume session
- **`useCompleteCookingSession()`** - Complete session
- **`useCancelCookingSession()`** - Cancel session
- **`useNextPhase()`** - Move to next phase

### `useOvenSettings.ts`

- **`useOvenSettings(userId)`** - Get user settings
- **`useTemperatureUnit(userId)`** - Get temperature unit preference
- **`useAllOvenSettings()`** - Get all settings
- **`useUpdateOvenSettings()`** - Update settings
- **`useResetOvenSettings()`** - Reset to defaults
- **`useUpdateSetting()`** - Update specific setting
- **`useRemoveOvenSettings()`** - Remove settings
- **`useConvertTemperature()`** - Convert between units

## 🚀 Usage Examples

### API Services (Hardware Control)

```typescript
import { useTemperature, useSetGpio } from "@/services";

function OvenControl() {
  const { data: temp } = useTemperature();
  const setGpio = useSetGpio();

  const turnOnHeating = () => {
    setGpio.mutate({ pin: 18, state: true });
  };

  return <div>Current temp: {temp?.temperature}°C</div>;
}
```

### Database Services (Recipes & Settings)

```typescript
import { useRecipes, useOvenSettings } from "@/services";

function RecipeList() {
  const { data: recipes } = useRecipes({ category: "Main Course" });
  const { data: settings } = useOvenSettings("user123");

  return (
    <div>
      {recipes?.map(recipe => (
        <div key={recipe._id}>{recipe.name}</div>
      ))}
    </div>
  );
}
```

## 🔗 Integration

### Convex Setup

Make sure to wrap your app with the Convex provider:

```typescript
import { ConvexClientProvider } from "@/clients/convex";

function App() {
  return (
    <ConvexClientProvider>
      <YourApp />
    </ConvexClientProvider>
  );
}
```

### Environment Variables

Add to your `.env` file:

```
VITE_CONVEX_URL=http://localhost:8000
```

## 📝 Notes

- **API Services** use React Query for caching and state management
- **Database Services** use Convex hooks for real-time updates
- All services are fully typed with TypeScript
- Database services automatically handle real-time subscriptions
- API services include automatic refetching where appropriate
