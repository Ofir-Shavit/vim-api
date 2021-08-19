const REST_PORT = process.env.REST_PORT || 3500;
const PUBSUB_PORT = process.env.PUBSUB_PORT || 3535;
const SUBSCRIBER_PORT = process.env.SUBSCRIBER_PORT || 3838;

module.exports = { REST_PORT, PUBSUB_PORT, SUBSCRIBER_PORT };