# Smart Oven

A smart oven control system with a React frontend and Python backend, designed for Raspberry Pi deployment.

## Development

### Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run deadcode` - Find dead code using Knip
- `npm run deadcode:strict` - Strict dead code analysis
- `npm run deadcode:summary` - Compact dead code summary

### Code Quality

The project includes several tools for maintaining code quality:

- **ESLint** - Code linting and style enforcement
- **TypeScript** - Static type checking
- **Knip** - Dead code detection and unused dependency analysis

For detailed information about dead code analysis, see [frontend/DEADCODE.md](frontend/DEADCODE.md).

---

# Raspberry Pi Deployment Setup (With Github runner)

This document explains the **one-time setup** needed so GitHub Actions can deploy updates automatically to your Raspberry Pi a github runner.

---

## 1. Prepare the Raspberry Pi to become a runner

follow the step here: https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/add-runners
for ARM architecture

the runner must have the label: self-hosted

## 7. Done! Deploy via GitHub Runner workflow

Once the GitHub Actions workflow is in place:

- `git push` to the `main` branch
