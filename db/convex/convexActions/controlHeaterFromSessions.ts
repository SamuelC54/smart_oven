import { internalAction } from "../_generated/server";
import { api } from "../_generated/api";

// Internal action to control heater based on active cooking sessions
export default internalAction({
  handler: async (ctx) => {
    // Get API URL from Convex environment variables
    const API_BASE_URL = process.env.API_URL;

    if (!API_BASE_URL) {
      console.error("API_URL environment variable not set");
      return;
    }

    try {
      // Get active cooking sessions
      const activeSessions = await ctx.runQuery(
        api.queries.getActiveCookingSession.default
      );

      if (!activeSessions) {
        // No active cooking session, turn off heater
        console.log("No active cooking session found, turning off heater");
        await turnOffHeater(API_BASE_URL);
        return;
      }

      console.log(
        `Active cooking session found: ${activeSessions.recipeName}, target temp: ${activeSessions.targetTemp}°C`
      );

      // Call heater control API to determine if heater should be on
      const heaterControlResponse = await fetch(
        `${API_BASE_URL}/heater/control`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target_temperature: activeSessions.targetTemp,
          }),
        }
      );

      if (!heaterControlResponse.ok) {
        console.error(
          `Heater control API failed: ${heaterControlResponse.status}`
        );
        return;
      }

      const heaterControlData = await heaterControlResponse.json();
      console.log(
        `Heater control response: heater_should_be_on=${heaterControlData.heater_should_be_on}, current_temp=${heaterControlData.current_temperature}°C`
      );

      // Control heater based on PID controller decision
      if (heaterControlData.heater_should_be_on) {
        await turnOnHeater(API_BASE_URL);
      } else {
        await turnOffHeater(API_BASE_URL);
      }
    } catch (error) {
      console.error("Failed to control heater from cooking sessions:", error);
    }
  },
});

async function turnOnHeater(apiBaseUrl: string) {
  try {
    const response = await fetch(`${apiBaseUrl}/heater`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "both",
      }),
    });

    if (response.ok) {
      console.log("Heater turned on successfully");
    } else {
      console.error(`Failed to turn on heater: ${response.status}`);
    }
  } catch (error) {
    console.error("Error turning on heater:", error);
  }
}

async function turnOffHeater(apiBaseUrl: string) {
  try {
    const response = await fetch(`${apiBaseUrl}/heater`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "off",
      }),
    });

    if (response.ok) {
      console.log("Heater turned off successfully");
    } else {
      console.error(`Failed to turn off heater: ${response.status}`);
    }
  } catch (error) {
    console.error("Error turning off heater:", error);
  }
}
