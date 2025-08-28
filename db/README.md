# Smart Oven Convex Database

This directory contains the Convex database functions and schema for the Smart Oven project.

## 📁 Structure

```
db/
├── convex/
│   ├── schema.ts              # Database schema definition
│   ├── recipes.ts             # Recipe CRUD operations
│   ├── seedData.ts            # Sample data seeding
│   ├── convex.json            # Convex configuration
│   └── _generated/            # Auto-generated types (don't edit)
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   cd db
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Seed the database:**
   ```bash
   npm run seed
   ```

## 📊 Database Schema

### Tables

- **`recipes`** - Cooking recipes with metadata
- **`recipePhases`** - Individual cooking steps for each recipe
- **`cookingSessions`** - Active and historical cooking sessions
- **`temperatureHistory`** - Time-series temperature and sensor data
- **`ovenSettings`** - User preferences and oven configurations
- **`users`** - User profiles (for future multi-user support)
- **`recipeCollections`** - User-created recipe groups
- **`systemLogs`** - Application logs for debugging
- **`deviceStatus`** - Hardware device status monitoring

### Key Features

- **Real-time updates** - All data syncs automatically
- **Type safety** - Full TypeScript support
- **Optimized queries** - Indexed for performance
- **Scalable** - Built for production use

## 🛠️ Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run codegen` - Generate TypeScript types
- `npm run dashboard` - Open Convex dashboard

### Database Operations

- `npm run seed` - Seed database with sample data
- `npm run seed:reset` - Reset and reseed database
- `npm run clean:temp` - Clean old temperature data
- `npm run clean:logs` - Clean old system logs

### Deployment

- `npm run deploy` - Deploy to production
- `npm run status` - Check deployment status
- `npm run logs` - View function logs

### Maintenance

- `npm run health` - Check system health
- `npm run clean` - Clean dependencies and rebuild
- `npm run fresh` - Complete fresh setup

## 🔧 API Functions

### Recipes

- `recipes.list()` - Get all recipes with filtering
- `recipes.get(id)` - Get single recipe with phases
- `recipes.search(term)` - Search recipes by name/ingredients
- `recipes.create(data)` - Create new recipe
- `recipes.update(id, data)` - Update recipe
- `recipes.toggleFavorite(id)` - Toggle favorite status
- `recipes.remove(id)` - Delete recipe and phases
- `recipes.popular()` - Get popular recipes

### Cooking Sessions

- `cookingSessions.getActive()` - Get current active session
- `cookingSessions.list()` - Get all sessions
- `cookingSessions.start(data)` - Start new cooking session
- `cookingSessions.update(id, data)` - Update session
- `cookingSessions.complete(id)` - Mark session as complete

### Temperature History

- `temperatureHistory.getBySession(sessionId)` - Get session data
- `temperatureHistory.getRecent()` - Get recent readings
- `temperatureHistory.record(data)` - Record new reading
- `temperatureHistory.cleanup()` - Clean old data

### Oven Settings

- `ovenSettings.get(userId)` - Get user settings
- `ovenSettings.update(userId, data)` - Update settings
- `ovenSettings.reset(userId)` - Reset to defaults

### System Logs

- `systemLogs.list()` - Get all logs
- `systemLogs.getErrors()` - Get error logs only
- `systemLogs.add(data)` - Add new log entry
- `systemLogs.cleanup()` - Clean old logs

### Device Status

- `deviceStatus.list()` - Get all device statuses
- `deviceStatus.update(deviceId, data)` - Update device status
- `deviceStatus.getSystemHealth()` - Get overall system health

## 🌱 Sample Data

The database comes with sample recipes including:

- Classic Roasted Chicken
- Chocolate Chip Cookies
- Artisan Sourdough Bread

Each recipe includes:

- Complete ingredient lists
- Step-by-step cooking phases
- Temperature and timing data
- Cooking tips and techniques

## 🔗 Integration

### Frontend Usage

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// Query recipes
const recipes = useQuery(api.recipes.list);

// Create recipe
const createRecipe = useMutation(api.recipes.create);
```

### Backend Integration

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "./_generated/api";

const convex = new ConvexHttpClient(process.env.CONVEX_URL!);
const recipes = await convex.query(api.recipes.list);
```

## 🚨 Important Notes

- **Never edit `_generated/` files** - They're auto-generated
- **Use TypeScript** - All functions are fully typed
- **Test locally first** - Use `npm run dev` for development
- **Backup before reset** - `seed:reset` deletes all data
- **Monitor logs** - Use `npm run logs` for debugging

## 📈 Performance Tips

- Use indexes for filtering (already configured)
- Limit query results with `take()`
- Use `order("desc")` for recent data
- Clean old data regularly with cleanup functions
- Monitor function execution times in dashboard

## 🔐 Security

- All functions run in isolated environment
- No direct database access from client
- Input validation on all functions
- Rate limiting built-in
- Audit logs for all mutations

## 📞 Support

For issues or questions:

1. Check the Convex dashboard logs
2. Review function execution times
3. Verify schema changes are deployed
4. Check TypeScript compilation errors

---

**Happy Cooking! 🍳**
