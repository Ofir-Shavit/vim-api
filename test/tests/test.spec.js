const assert = require('assert');
const request = require('request-promise');
const config = require('../config');

describe(`# Test part A of the coding interview`, () => {
    const restUrl = `http://localhost:${config.REST_PORT}`;
    const pubsubUrl = `http://localhost:${config.PUBSUB_PORT}`;

    function getAppointments(specialty, date, minScore) {
        return request({
            uri: `${restUrl}/appointments`,
            qs: {specialty, date, minScore},
            json: true
        })
    }

    function postAppointment(name, date) {
        return request({
            uri: `${restUrl}/appointments`,
            method: 'POST',
            body: {name, date},
            json: true,
        })
    }

    describe(`# Test GET /appointments`, () => {
            it(`# Should get a provider that has a matching specialty and date`, () =>
                getAppointments('Neuropathy', 1571572800000, 0)
                    .then(result => assert.deepStrictEqual(result, ['Susannah Dean'])));

            it(`# Should get a provider that has a matching specialty and date, specialty isn't case sensitive`, () =>
                getAppointments('neuropathy', 1571572800000, 0)
                    .then(result => assert.deepStrictEqual(result, ['Susannah Dean'])));

            it(`# Should get several providers that have matching specialty and date ordered by score`, () =>
                getAppointments('Cardiologist', 1571637660000, 8.9)
                    .then(result => assert.deepStrictEqual(result, ['Roland Deschain', 'Jake Chambers'])));

            it(`# Should not get a provider if their score is not at least "minScore"`, () =>
                getAppointments('Cardiologist', 1571637660000, 9)
                    .then(result => assert.deepStrictEqual(result, ['Roland Deschain']))
            );

            it(`# Should not get a provider if they do not have a matching time slot, even if they have matching specialty`, () =>
                getAppointments('Internist', 1571637660000, 0)
                    .then(result => assert.deepStrictEqual(result, [])));

            it(`# Should not get a provider if they do not have a matching specialty, even if they have matching time slots`, () =>
                getAppointments('Internist', 1590048000000, 0)
                    .then(result => assert.deepStrictEqual(result, [])));

            it(`# Should get a provider that has a matching specialty and date even if given a different time zone`, () =>
                getAppointments('Physiologist', 1808982000000, 0)
                    .then(result => assert.deepStrictEqual(result, ['Randall Flagg'])));

            it(`# Should return code 400 if no specialty was supplied`, () =>
                getAppointments('', 1808982000000, 0)
                    .then(() => assert.fail(`Promise should've rejected!`))
                    .catch(error => assert.deepStrictEqual(error.statusCode, 400)));

            it(`# Should return code 400 if bad date format was supplied`, () =>
                getAppointments('Physiologist', 'abcdefg', 0)
                    .then(() => assert.fail(`Promise should've rejected!`))
                    .catch(error => assert.deepStrictEqual(error.statusCode, 400)));
        }
    );

    describe(`# Test POST /appointments`, () => {
        it(`# should return 400 when providing name and date that don't have an availability`, done => {
            handler = () => {
                done(new Error(`Expected postAppointment to throw error and not reach this stage!`));
            };
            postAppointment("Roland Deschain", 1808982000000)
                .then(() => done(new Error(`Expected postAppointment to throw error and not reach this stage!`)))
                .catch(error => done(assert.deepStrictEqual(error.statusCode, 400)));
        });

        it(`# should receive code 200 when trying to schedule appointment with correct details`, () =>
            postAppointment("Roland Deschain", 1571569200000)
        );
    })
});