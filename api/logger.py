import logging
import io

# Set up logging with memory handler and timestamp format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Create a memory handler to capture logs
log_buffer = io.StringIO()
memory_handler = logging.StreamHandler(log_buffer)
memory_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
memory_handler.setFormatter(formatter)
logger.addHandler(memory_handler)

def get_logs():
    """Get recent application logs for debugging"""
    log_buffer.seek(0)
    logs = log_buffer.read()
    log_lines = logs.strip().split('\n')
    formatted_logs = []
    for line in log_lines:
        if line.strip():
            formatted_logs.append(line)

    return {
        "logs": formatted_logs,
        "raw_logs": logs,
        "log_count": len(formatted_logs)
    }
