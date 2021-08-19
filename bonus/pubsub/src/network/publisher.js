const request = require('request-promise');

function sendToListener(listener, payload, metadata) {
    if (!listener.startsWith('http')) listener = `http://${listener}`;
    return request({
        method: 'POST',
        uri: listener,
        body: { payload, metadata },
        json: true,
        timeout: 200
    }).catch(err => {
        if (err.error.code === `ESOCKETTIMEDOUT`) {
            console.error(`Listener [${listener}] did not return response. Closing connection.`);
        } else {
            throw err;
        }
    })
}

module.exports = {sendToListener};
