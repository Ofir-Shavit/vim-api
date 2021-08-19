const assert = require('assert');
const request = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('../config');

const restUrl = `http://localhost:${config.REST_PORT}`;
const pubsubUrl = `http://localhost:${config.PUBSUB_PORT}`;

function publishMessage(channel, payload, metadata) {
    return request({
        method: 'POST',
        uri: `${pubsubUrl}/publish`,
        json: true,
        body: {channel, payload, metadata}
    })
}

function getAppointments(specialty, date) {
    return request({
        uri: `${restUrl}/appointments`,
        qs: {specialty, date, minScore: 0},
        json: true
    })
}

function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

const supermanProvider = {
    name: "Clark Kent",
    score: 1000,
    specialties: [
        "Supertreatment"
    ],
    availableDates: [
        {
            from: 814172400000,
            to: 814172400000
        }
    ]
};

function addSuperman() {
    const specialty = supermanProvider.specialties[0];
    const date = supermanProvider.availableDates[0].to;
    return publishMessage(`addProvider`, supermanProvider)
        .then(() => wait(100))
        .then(() => getAppointments(specialty, date))
        .then(result => assert.deepStrictEqual(result, [supermanProvider.name]));
}

function removeSuperman() {
    const specialty = supermanProvider.specialties[0];
    const date = supermanProvider.availableDates[0].to;
    return publishMessage(`deleteProvider`, {name: supermanProvider.name})
        .then(() => wait(100))
        .then(() => getAppointments(specialty, date))
        .then(result => assert.deepStrictEqual(result, []));
}


describe(`# Test part B of the coding interview`, () => {
    describe(`# Test POST /appointments`, () => {
        let handler;
        let server;

        function subscribeToNewAppointments() {
            const app = express();
            const port = config.SUBSCRIBER_PORT;
            app.use(bodyParser.json());
            app.route('/newAppointment').post((request, response) => handler ? handler(request.body) : response.status(200).send());
            server = app.listen(port);
            return request({
                method: 'POST',
                uri: `${pubsubUrl}/subscribe`,
                body: {channel: 'newAppointments', address: `http://localhost:${port}/newAppointment`},
                json: true
            })
        }

        function shutDownSubscriber() {
            server.close();
        }

        before(subscribeToNewAppointments);
        beforeEach(() => handler = null);
        after(shutDownSubscriber);

        function postAppointment(name, date) {
            return request({
                uri: `${restUrl}/appointments`,
                method: 'POST',
                body: {name, date},
                json: true,
            })
        }

        it(`# should successfully update an appointment and publish the appointment to the pubsub`, done => {
                handler = message => {
                    if (message.payload.name === "Roland Deschain" && message.payload.date === 1571569200000) done();
                    else done(new Error(`Unexpected message received from pubsub: ${JSON.stringify(message)}`));
                };
                postAppointment("Roland Deschain", 1571569200000)
                    .catch(done);
            }
        )
    });

    describe(`# Test addProvider`, () => {
        afterEach(removeSuperman);

        it(`# Should add a provider`, addSuperman);

        it(`# Should update a provider`, () => {
            const differentSuperman = {
                name: "Clark Kent",
                score: 1000,
                specialties: [
                    "Measles"
                ],
                availableDates: [
                    {
                        from: 2524633200000,
                        to: 2524640400000
                    }
                ]
            };
            return addSuperman()
                .then(() => publishMessage(`addProvider`, differentSuperman))
                .then(() => wait(100))
                .then(() => getAppointments(supermanProvider.specialties[0], supermanProvider.availableDates[0].to))
                .then(result => assert.deepStrictEqual(result, []))
                .then(() => getAppointments(differentSuperman.specialties[0], differentSuperman.availableDates[0].to))
                .then(result => assert.deepStrictEqual(result, [differentSuperman.name]));
        })
    });

    describe(`# Test deleteProvider`, () => {
        // Make sure we have a provider to delete
        before(addSuperman);

        // Make sure the provider is deleted no matter what happened in the test
        after(removeSuperman);

        it(`# Should delete a provider`, () => {
            return publishMessage(`deleteProvider`, {name: supermanProvider.name})
                .then(() => wait(100))
                .then(() => getAppointments(supermanProvider.specialties[0], supermanProvider.availableDates[0].to))
                .then(result => assert.deepStrictEqual(result, []));
        });
    });
});