const publisher = require('../network/publisher');

let listeners = {};

function subscribe(channel, listener) {
    if (!listeners[channel]) {
        listeners[channel] = new Set();
    }
    listeners[channel].add(listener);
}

function publish(channel, payload, metadata) {
    if (listeners[channel]) {
        return Promise.all(
            [...listeners[channel]].map(
                listener => publisher.sendToListener(listener, payload, metadata)
                    .then(() => console.log(`Published message to [${listener}] on channel [${channel}]`))
                    .catch(err => console.error(`Failed to send message to listener [${listener}] on channel [${channel}]`, err))
            )
        )
    } else return Promise.resolve();
}

function reset() {
    listeners = {};
}

module.exports = {subscribe, publish, reset};
