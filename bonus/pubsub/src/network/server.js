const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const pubsub = require('../pubsub/pubsub');

function runServer(port) {
    const app = express();
    app.use(morgan('common'))
    app.use(bodyParser.json());
    app.route('/subscribe')
        .post(subscribeHandler);
    app.route('/publish')
        .post(publishHandler);
    app.route('/reset')
        .get(resetHandler);
    app.listen(port);
}

function subscribeHandler(request, response) {
    const requestPayload = request.body;
    if (requestPayload.address && requestPayload.channel) {
        pubsub.subscribe(requestPayload.channel, requestPayload.address);
        console.log(`Subscribed [${requestPayload.address}] to [${requestPayload.channel}]`)
        response.status(200).send();
    } else {
        response.status(400).send('/subscribe payload must be a JSON with fields: address, channel')
    }
}

function publishHandler(request, response) {
    const requestPayload = request.body;
    if (requestPayload.payload && requestPayload.channel) {
        console.log(`Publishing message on channel [${requestPayload.channel}]`);
        pubsub.publish(requestPayload.channel, requestPayload.payload, requestPayload.metadata)
            .then(() => response.status(200).send())
            .catch(err => response.status(500).send(JSON.stringify(err)));
    } else {
        response.status(400).send('/publish payload must be a JSON with fields: payload, channel')
    }
}

function resetHandler(request, response) {
    pubsub.reset();
    response.status(200).send();
}

module.exports = { runServer };
