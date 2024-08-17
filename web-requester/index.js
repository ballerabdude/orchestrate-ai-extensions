const redis = require('redis');
const fetch = require('node-fetch');

const {
  WORKFLOW_INSTANCE_ID,
  WORKFLOW_EXTENSION_ID,
  REDIS_HOST_URL,
  REDIS_USERNAME,
  REDIS_PASSWORD,
  REDIS_CHANNEL_IN,
  REDIS_CHANNEL_OUT,
  REDIS_CHANNEL_READY
} = process.env;

const publisher = redis.createClient({
  url: REDIS_HOST_URL,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
});

const subscriber = redis.createClient({
  url: REDIS_HOST_URL,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
});

async function main() {
  await publisher.connect();
  await subscriber.connect();

  await publisher.publish(REDIS_CHANNEL_READY, '');

  await subscriber.subscribe(REDIS_CHANNEL_IN, async (message) => {
    try {
      const result = await processMessage(message);

      const output = {
        type: 'completed',
        workflowInstanceId: WORKFLOW_INSTANCE_ID,
        workflowExtensionId: WORKFLOW_EXTENSION_ID,
        output: result
      };
      await publisher.publish(REDIS_CHANNEL_OUT, JSON.stringify(output));
    } catch (error) {
      const errorOutput = {
        type: 'failed',
        workflowInstanceId: WORKFLOW_INSTANCE_ID,
        workflowExtensionId: WORKFLOW_EXTENSION_ID,
        error: error.message
      };
      await publisher.publish(REDIS_CHANNEL_OUT, JSON.stringify(errorOutput));
    } finally {
      await subscriber.unsubscribe(REDIS_CHANNEL_IN);
      await subscriber.quit();
      await publisher.quit();
    }
  });
}

async function processMessage(message) {
  const { inputs } = JSON.parse(message);
  
  if (!inputs.url) {
    throw new Error('URL is required in the inputs');
  }

  const response = await fetch(inputs.url, {
    method: inputs.method || 'GET',
    headers: inputs.headers || {},
    body: inputs.body ? JSON.stringify(inputs.body) : undefined,
  });

  const responseData = await response.text();
  let parsedData;
  try {
    parsedData = JSON.parse(responseData);
  } catch (error) {
    parsedData = responseData;
  }

  return {
    status: response.status,
    headers: Object.fromEntries(response.headers),
    data: parsedData,
  };
}

main().catch(console.error);