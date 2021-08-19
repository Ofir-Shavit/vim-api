# Welcome to Vim!
These are instructions for your coding exercise. Please read them carefully and make sure to ask whatever question pops into your mind.

### Goal
We would like to create a system for scheduling appointments with providers (doctors), which would able to:
- Search for providers to set up an appointment with.
- Select an appointment date from the search results & notifying the provider of the new appointment.
- Receive requests for adding, updating or deleting providers

Our system supports both synchronous queries and async queries. We use synchronous queries where possible, but sometimes when we rely on slow/unreliable external systems or when we need an event-based workflow we use an async system.

* The synchronous queries use REST APIs - one of which you will build.
* The asynchronous queries use a publish-subscribe (pub-sub) system based on “channels”. You will connect to this system as both a subscriber and a publisher. (bonus part)

### What are we looking for?
- There is no “right” solution! As long as your code works, is readable and extensible- it’s great!
- You may use whatever external library you need.
- We’re looking for big picture stuff:
  * Is your code architecture clean?
  * Is it easy to add new functionality?
  * Is your code testable?
  * Is your code readable?
  * Does your code handle errors well?
  * Does your code have good logging?
- We’re not looking to find unimportant mistakes:
  * Don’t get stuck if you don’t understand the instructions. We will help you!
  * Don’t get stuck on silly syntax errors in libraries you have no experience with. We will help you!
  * Don’t get stuck on coding environment / bootstrapping issues. We will help you!
- We want you to be able to finish this exercise so we can talk about your solution.
- You are not expected to finish any bonus from part C. They are there if you happen to have enough time and to open up discussion points.
- You are not expected to use any specific framework or even any framework at all - work with what you like.
- We encourage you to execute each part of this exercise independently. For each part - read the instructions, make sure you understand them with your interviewer, implement the part, verify the tests pass and call your interviewer before moving on to the next part.

### What’s a Provider?
A provider is a doctor. Its Object model looks like this:
```
{
    “name”: “Roland Deschain”, //Provider’s name
    “specialties”: [“Neurologist”, “Cardiologist”], //The provider’s specialties
    “availableDates”: [ //Available time slots for appointments
        {“from”:1548932400000,”to”:1548943200000},
        {“from”:1549000800000,”to”:1549031400000}
    ]
    “score”: 9.3 //Vim’s “secret sauce” - a provider’s score
}
```
We take the **provider's name** as **unique**, which we can differentiate between providers - you can rely on that when you think about data modeling.

**Dates:** The dates (all dates in our system) are formatted as [Milliseconds since epoch](https://currentmillis.com/?now#unix-timestamp) (Which means that a date like this - `31/11/1990 16:30` is written like this - `660061800000` ).
The dates are inclusive, meaning that if a provider has an availability of `{"from":100, "to":200}` then acceptable dates for an appointment would be: `150`, `100`, `200` but not `99`, `201`. 

**Scores:** The scores are between 0 and 10.0

**Datasource:** For the purpose of this exercise, you will get a Provider list from a .json file and all reading/writing from/to it should be done **in memory**. Design your system in a way that supports millions of Providers, each with thousands of Specialties and AvailableDates, all in memory.

## Exercise
### Preparation and running the tests
- Make sure you have node.js, npm and git installed.
  - https://nodejs.org/en/download/
  - https://git-scm.com/downloads
- Clone this repository and create a new branch.
- The relevant folders for this part:
  * `./providers` contains mock data
  * `./test` contains the pre-written tests for your code
  * `./src` will contain your answer
- Run `npm install` inside `./test`.
- To run the tests for this part, you will need to have the server that you will implement running in the background.
  * Your server should be running on port `3500`. You can change this in `./test/config.js`.
  * In `./test` execute `npm run test`.

### Exercise
The goal of this part is to create a REST endpoint to allow users to set up appointments. Users look for a provider with a specific specialty (e.g ‘Neurologist’, ‘Cardiologist’) and with availability for a certain date. They should receive a list of providers ordered by relevance, and should be able to select one and set up an appointment with them.

Use the mock info under `/providers/providers.json` as your data source, but write your code such that it will be easy to switch this mock for an actual data source like a database / another HTTP endpoint.

- Create a REST server with the following endpoint:
   `GET /appointments?specialty=<SPECIALTY>&date=<DATE>&minScore=<SCORE>`
   * The results should take into account:
     * **Threshold:** They should only get providers whose scores are matching that threshold <SCORE> (inclusive, if `minScore=9.0` then a provider with score 9.0 should be valid)
     * **Specialty:** They should only get providers that specialize in that specific specialty. Specialty is not case sensitive.
     * **Availability:** They should only get providers that are available in the specific time requested
     * **Ordering:** The providers should be ordered by score from highest to lowest
  * The endpoint should return an array of **provider names** according to the order defined above.
  * If there are no suitable providers the endpoint should return an **empty array**.
  * If the user gave bad parameters, like a missing specialty, or a bad date format (should be [milliseconds since epoch](https://currentmillis.com/?now#unix-timestamp)), the server should return a `400 (BAD REQUEST)` code.

- Create an endpoint to set up an appointment:
`POST /appointments`
	`BODY: { “name”: string, “date”: date }`:
  * The server should validate that such an availability exists. If it doesn’t, the server should return `400 (BAD REQUEST)`.
  * If such an availability does exist, the server should return a `200 (OK)` response to the client.
  * This endpoint does not actually change the providers data, they will be mutated in the bonus part ;).

# Good luck from all of us at Vim!
