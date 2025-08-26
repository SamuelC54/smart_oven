#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Load environment variables from root directory
require("dotenv").config({ path: "../.env" });

const API_URL =
  process.env.API_URL?.replace(/\/$/, "") || "http://localhost:8081";
const OPENAPI_URL = `${API_URL}/openapi.json`;

console.log("🚀 Smart Oven API SDK Generator");
console.log("================================");

// Check if API is accessible
console.log(`📡 Checking API availability at ${API_URL}...`);
try {
  execSync(`curl -f ${API_URL}/health`, { stdio: "pipe" });
  console.log("✅ API is accessible");
} catch (error) {
  console.error(
    "❌ API is not accessible. Please make sure the Smart Oven API is running."
  );
  console.error(
    `   Start the API with: cd ../api && uvicorn app:app --host 0.0.0.0 --port 8081`
  );
  process.exit(1);
}

// Clean previous generation
console.log("🧹 Cleaning previous generated files...");
try {
  execSync("npm run clean", { stdio: "inherit" });
} catch (error) {
  console.log("No previous files to clean");
}

// Generate SDK
console.log("⚙️  Generating TypeScript SDK from OpenAPI specification...");
try {
  execSync(
    `npx openapi-generator-cli generate -i ${OPENAPI_URL} -g typescript-axios -o ./generated --additional-properties=npmName=smart-oven-api-sdk,npmVersion=1.0.0,supportsES6=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=api`,
    {
      stdio: "inherit",
    }
  );
  console.log("✅ SDK generated successfully");
} catch (error) {
  console.error("❌ Failed to generate SDK:", error.message);
  process.exit(1);
}

// Compile TypeScript
console.log("📦 Compiling TypeScript...");
try {
  execSync("npm run compile", { stdio: "inherit" });
  console.log("✅ TypeScript compiled successfully");
} catch (error) {
  console.error("❌ Failed to compile TypeScript:", error.message);
  process.exit(1);
}

// Success message
console.log("🎉 SDK generation completed successfully!");
console.log("");
console.log("📁 Generated files:");
console.log("   - ./generated/ - Generated TypeScript source");
console.log("   - ./dist/      - Compiled JavaScript");
console.log("");
console.log("🔧 Usage:");
console.log('   import { HealthApi, TemperatureApi } from "./generated";');
console.log("");
console.log("📚 See README.md for detailed usage examples.");
