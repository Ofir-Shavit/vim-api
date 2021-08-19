

## Bonus Part
Before moving forward, let's just make sure - did you finish part A? Did you go over it with your interviewer? Good job :)

### Pubsub system
Our pubsub system is an HTTP server that listens on two endpoints: `publish`, `subscribe`.

The system is based on channels, which according to their name you can either publish messages and subscribe to. It is up to the publishers and subscribers to decide which channels to define and how to use and name them.
When a message is sent to a specific channel, the pubsub system sends that message to all of the listeners that subscribed to that specific channel. The pubsub system sends a message to a listener by executing a `POST` request to an endpoint that was given to it by the subscriber.

__Publishing a message:__
```
POST /publish
{	“channel”: string,
	“payload”: object,
	“metadata”: object (optional)	}
```
* **Channel** _(Required)_**:** The channel name you’re publishing a message to.
* **Payload** _(Required)_**:** The message content. Must be a JSON object.
* **Metadata** _(Optional)_**:** Any metadata you want to add. Must be a JSON object. This could include, for example, the publisher’s name, or the date of the published message, or a random id. It is it up to the publisher to decide which metadata is relevant.
  The server will return `200 (OK)` on successful publish, `400 (BAD REQUEST)` if it received a bad parameter and `5XX` on failed publish.

__Subscribing to a channel:__
```
  POST /subscribe
{	“channel”: string,
	“address”: string	}
```
* **Channel** _(Required)_**:** The channel name you’re publishing a message to.
* **Address** _(Required)_**:** The address to which the pubsub system will send messages that are published on the channel. For example, if you’re interested in the channel “providerUpdates”, you might want to create a REST endpoint at `localhost:port/providerUpdates` and send that address to the pubsub system when subscribing.
  The server will return `200 (OK)` on successful subscription, `400 (BAD REQUEST)` if it received a bad parameter and `5XX` on failed subscription.

__Receiving messages:__

Once you’re subscribed to a specific channel, when a message is published on this channel your defined endpoint will receive a `POST` request with the following body:
```
{	“payload”: object,
	“metadata”: object (optional)	}
```
Both parameters are JSON objects and are completely defined by the message’s publisher. Metadata is optional.

__Cancelling subscriptions:__

To delete the listeners you can call `GET /reset`. This will delete all subscriptions from all channels.

### Preparing for the exercise and running the tests
- Make sure you've completed part A of this exercise.
- Run `npm install` inside `./pubsub`.
- Running the pubsub server:
    * To run the pubsub server, run `npm start` inside `./pubsub`. By default it runs on port 3535. Change it using the `PORT` env variable. For example: `PORT=6700 npm start`.
    * The tests expect the pubsub server and your server on default ports 3535 and 3500 respectively. They also need port 3838 to be available. You can change all of these in `./test/config.js`.
    * In `./test` execute `npm run test-a`, `npm run test-b` or `npm run test` to test part A, part B or both.

### Exercise
The goal of this part is to support sending/receiving messages to/from the providers' applications by using the pubsub system. Your server should support:
- Setting a new appointment
- Adding / Updating providers' info
- Removing providers

These changes are given to you asynchronously using the pubsub system.
For this part, as we said before, assume providers are identified by their name, there are no duplicates in name. You should support **'upserting'**, which means that if a name doesn't exist - add as new provider, if it does - update it. The update will be a complete update and not a deep one (this means objects and arrays in the provided provider's update will be replaced completely and not updated).

**All the changes for the providers’ info should happen in memory, not on disk. Restarting your server should revert them.**
1. Whenever a user sets a new appointment using the `POST /appointments` endpoint you wrote in Part A, use the pubsub system to publish a new message to a channel called ‘newAppointments’. The message should contain a payload: `{“name”: string, “date”: date}`
2. Subscribe to the channel called ‘addProvider’. The messages on this channel have a payload that’s a provider according to the object model described above. Your server should receive updates on this channel and add/update your data model according to the changes received.
3. Subscribe to the channel called ‘deleteProvider’. The messages on this channel have a payload that looks like this: `{“name”: string}`. Your server should delete the provider according to the deletions received.

### Bonus Part 2 (Not ordered by priority, feel free to choose)
- Create a simple web interface that allows searching for providers and setting appointments according to part A.
- Create a simple web interface that allows creating/updating/deleting providers’ information according to part B.
- We’re interested in analytics - your CTO wrote a service that subscribes to the pubsub system on the channel “analytics”. Design and implement messages on this channel that would support:
    * Understanding when and which service received/published messages on certain channel
    * Performance - How much time each subscriber/publisher worked on each message?
    * Understanding a workflow - If a specific request from the client creates a chain of messages moving from channel to channel, how can we easily tell what the workflow is?
- Create a wrapper library for the pubsub system. It should be used as a native client ,in the language you chose to implement the code interview with, for people who want to use the pubsub system without executing HTTP requests by themselves. It should find an available port, spin up a server to listen on that port and use that port to listen to published messages.
