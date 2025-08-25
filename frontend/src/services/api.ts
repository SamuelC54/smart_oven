// API configuration using environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/";

// Remove trailing slash if present
export const API_URL = API_BASE_URL.endsWith("/")
  ? API_BASE_URL.slice(0, -1)
  : API_BASE_URL;

// Helper function to make API calls
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        `Network error: Unable to connect to ${API_URL}. Please check if the API server is running and CORS is configured.`
      );
    }
    throw error;
  }
}
