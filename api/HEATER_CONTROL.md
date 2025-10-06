# Heater Control API

This API provides intelligent heater control using PID (Proportional-Integral-Derivative) control algorithm to maintain precise temperature control.

## Features

- **PID Control**: Uses the `simple-pid` library for precise temperature control
- **Real-time Temperature Reading**: Reads current temperature from the MAX31865 sensor
- **Configurable Parameters**: Adjustable PID parameters (Kp, Ki, Kd)
- **Multiple Endpoints**: Both POST and GET endpoints for different use cases
- **Status Monitoring**: Get current heater control status

## Endpoints

### 1. POST /heater/control

Control the heater using a JSON request body.

**Request Body:**

```json
{
  "target_temperature": 200.0,
  "kp": 1.0,
  "ki": 0.1,
  "kd": 0.05,
  "sample_time": 1.0,
  "output_limits": [0, 1]
}
```

**Response:**

```json
{
  "heater_should_be_on": true,
  "current_temperature": 150.5,
  "target_temperature": 200.0,
  "pid_output": 0.75,
  "error": 49.5,
  "pid_parameters": {
    "kp": 1.0,
    "ki": 0.1,
    "kd": 0.05,
    "sample_time": 1.0,
    "output_limits": [0, 1]
  }
}
```

### 2. GET /heater/control

Control the heater using query parameters.

**Example:**

```
GET /heater/control?target_temperature=200&kp=1.0&ki=0.1&kd=0.05
```

### 3. GET /heater/status

Get current heater control status and PID controller information.

**Response:**

```json
{
  "current_temperature": 150.5,
  "pid_controller_active": true,
  "last_update_time": 1640995200.0,
  "target_temperature": 200.0,
  "pid_tunings": [1.0, 0.1, 0.05],
  "sample_time": 1.0,
  "output_limits": [0, 1],
  "last_output": 0.75
}
```

### 4. POST /heater/reset

Reset the PID controller to clear accumulated integral error.

**Response:**

```json
{
  "message": "PID controller reset successfully"
}
```

## PID Parameters

- **Kp (Proportional Gain)**: Controls how aggressively the system responds to the current error
  - Higher values = faster response but potential overshoot
  - Lower values = slower response but more stable
  - Default: 1.0

- **Ki (Integral Gain)**: Eliminates steady-state error by accumulating past errors
  - Higher values = faster elimination of steady-state error
  - Lower values = slower elimination but more stable
  - Default: 0.1

- **Kd (Derivative Gain)**: Reduces overshoot by predicting future error
  - Higher values = more damping, less overshoot
  - Lower values = less damping, potential overshoot
  - Default: 0.05

- **Sample Time**: Time between PID calculations in seconds
  - Default: 1.0 second

- **Output Limits**: Minimum and maximum PID output values
  - Default: [0, 1] (0 = heater off, 1 = heater on)

## How It Works

1. **Temperature Reading**: The API reads the current temperature from the MAX31865 sensor
2. **Error Calculation**: Calculates the difference between target and current temperature
3. **PID Calculation**: Uses PID algorithm to determine the control output
4. **Heater Decision**: If PID output > 0.5, heater should be ON; otherwise OFF
5. **Continuous Control**: The PID controller maintains state between calls for smooth control

## Usage Examples

### Basic Temperature Control

```bash
# Set target temperature to 200°C
curl -X POST "http://localhost:8000/heater/control" \
  -H "Content-Type: application/json" \
  -d '{"target_temperature": 200.0}'
```

### Custom PID Parameters

```bash
# Use custom PID parameters for more aggressive control
curl -X POST "http://localhost:8000/heater/control" \
  -H "Content-Type: application/json" \
  -d '{
    "target_temperature": 180.0,
    "kp": 2.0,
    "ki": 0.2,
    "kd": 0.1
  }'
```

### Quick GET Request

```bash
# Simple GET request for quick control
curl "http://localhost:8000/heater/control?target_temperature=150"
```

### Check Status

```bash
# Check current heater control status
curl "http://localhost:8000/heater/status"
```

## Installation

Make sure the `simple-pid` library is installed:

```bash
pip install simple-pid
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

## Error Handling

The API includes comprehensive error handling:

- **Hardware Errors**: If the temperature sensor is not available
- **Invalid Parameters**: If PID parameters are out of reasonable ranges
- **Sensor Errors**: If temperature reading fails
- **GPIO Errors**: If hardware communication fails

All errors return appropriate HTTP status codes with descriptive error messages.

## Integration

This heater control system can be integrated with:

- **GPIO Control**: Use the `/gpio/set` endpoint to actually control heater hardware
- **Temperature Monitoring**: Use the `/temperature` endpoint for temperature readings
- **Logging**: All operations are logged for debugging and monitoring
- **Web Interface**: Can be integrated with the frontend for user control

## Safety Considerations

- The API only determines if the heater _should_ be on - actual hardware control must be implemented separately
- Always implement safety limits and emergency shutoffs in your hardware control system
- Monitor temperature readings for sensor failures
- Consider implementing temperature limits to prevent overheating
