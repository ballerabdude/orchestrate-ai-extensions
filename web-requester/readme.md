# Web Request Extension

This extension allows you to make web requests to external APIs or websites and return the response data. It supports various HTTP methods and custom headers, making it versatile for different types of web interactions within your workflow.

## Inputs

The extension accepts the following inputs:

1. `url` (required):
   - Type: string
   - Description: The URL to send the request to
   - Example: "https://api.example.com/data"

2. `method` (optional):
   - Type: string
   - Description: The HTTP method to use for the request
   - Default: "GET"
   - Accepted values: "GET", "POST", "PUT", "DELETE", "PATCH", etc.

3. `headers` (optional):
   - Type: object
   - Description: An object containing custom headers to send with the request
   - Example: `{"Content-Type": "application/json", "Authorization": "Bearer your-token-here"}`

4. `body` (optional):
   - Type: object
   - Description: The body of the request for POST, PUT, etc. methods
   - Example: `{"key": "value"}`

## Outputs

The extension provides the following outputs:

1. `status`:
   - Type: number
   - Description: The HTTP status code of the response

2. `headers`:
   - Type: object
   - Description: An object containing the response headers

3. `data`:
   - Type: object or string
   - Description: The response body, parsed as JSON if possible, otherwise returned as text

## Usage Example

Here's an example of how to use the Web Request Extension:

```javascript
const inputs = {
  url: "https://api.example.com/data",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-token-here"
  },
  body: {
    key: "value"
  }
};

const result = await processMessage(JSON.stringify({ inputs }));

console.log(`Status Code: ${result.status}`);
console.log(`Response Headers:`, result.headers);
console.log(`Response Data:`, result.data);
```

## Notes

- The extension uses the `node-fetch` library to make HTTP requests.
- If the response body is valid JSON, it will be parsed and returned as an object. Otherwise, it will be returned as a string.
- The extension is designed to work within a larger workflow system that uses Redis for communication. In a standalone environment, you may need to modify the code to remove Redis dependencies.

## Error Handling

The extension will handle errors in the following ways:
- If the request fails (e.g., network error, invalid URL), an error will be thrown and published to the Redis output channel.
- HTTP errors (4xx, 5xx status codes) are not treated as exceptions. The status code will be returned in the `status` field of the output.

## Customization

You can customize the extension by modifying the `processMessage` function in the `index.js` file. Some potential customizations include:
- Adding support for request timeouts
- Implementing automatic retries for failed requests
- Adding support for file uploads
- Implementing caching for GET requests

## Dependencies

This extension requires the following npm packages:
- `redis`: For communication within the workflow system
- `dotenv`: For loading environment variables
- `node-fetch`: For making HTTP requests

Make sure to install these dependencies before running the extension:

```bash
npm install redis dotenv node-fetch@2
```

## Environment Variables

The extension expects the following environment variables to be set:
- `WORKFLOW_INSTANCE_ID`: The ID of the current workflow instance
- `WORKFLOW_EXTENSION_ID`: The ID of this extension
- `REDIS_HOST_URL`: The URL of the Redis server
- `REDIS_USERNAME`: The username for Redis authentication
- `REDIS_PASSWORD`: The password for Redis authentication
- `REDIS_CHANNEL_IN`: The Redis channel to listen for incoming messages
- `REDIS_CHANNEL_OUT`: The Redis channel to publish outgoing messages
- `REDIS_CHANNEL_READY`: The Redis channel to signal that the extension is ready

Ensure these environment variables are properly set in your deployment environment or in a local `.env` file for testing.