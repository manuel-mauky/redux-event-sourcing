# Redux Event Sourcing

Redux Middleware to add client-side event sourcing to [redux](http://github.com/reactjs/redux) applications. It is
somewhat similar to [redux-persist](https://github.com/rt2zz/redux-persist) with the big difference that _redux-persist_
is persisting the **current state** while _redux-event-sourcing_ will persist the **actions** that led to this state.

This library was written with electron desktop apps in mind but might be useful for some browser applications too.

This library is experimental and the API is not stable. You should expect breaking changes. However, the goal is to have
a stable and production ready library at some time in the future.

## Install

This library has peer dependencies of `redux@4.x.x`.

```bash
npm install --save redux-event-sourcing
```

```bash
yarn add redux-event-sourcing
```

## Getting Started

### Setup middleware

Create an instance of the middleware by using `createEventSourcingMiddleware`.
The `key` is used as an identifier for the application. 
It depends on the actual persistence strategy how this key is used,
i.e. when using localStorage, it will be used as storage key.

```ts
import { createEventSourcingMiddleware } from "./middleware"

const eventSourcingMiddleware = createEventSourcingMiddleware({
  key: "my-event-sourcing-app",
})

// setup store with pure redux
const store = createStore(reducer, initialState, applyMiddleware(eventSourcingMiddleware))

// or with redux-toolkit

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(eventSourcingMiddleware),
})
```

### Action Creator

_redux-event-sourcing_ will only persist actions that are explicitly marked as "event" and ignore all others. Event
actions have to have a `meta` field with a `eventSourcing` object in it. This `eventSourcing` object contains some meta
information describing the event.

An event action could look like this:

```ts
const myAction = {
  type: "my-action",
  meta: {
    eventSourcing: {
      timestamp: 1635958629221,
      id: "kdsh5wsd24lka2l3",
      version: 1,
    },
  },
}
```

The ID has to be unique and is used to differentiate events. A UUID or something similar should be used. The timestamp
is the point in time when the event was created. The version can be used to support different versions of the same event.

#### `createEventAction` util

Instead of creating event actions from scratch you can use the `createEventAction` helper function. This utility
takes a normal action and produces an event action for you.

```ts
import { createEventAction } from "redux-event-sourcing"

const myAction = {
  type: "my-action",
  payload: {}, // some payload
}

const myEventAction = createEventAction(myAction)
```

This will generate the ID and timestamp for you. Optionally, you can pass a version as second parameter (`1` will be
used by default).

### Process event actions in the reducer

In your reducer you can process event actions the same way you would do with "normal" actions.

During further development of your app you may have to change the shape of your events, but as events are persisted for
a long time you may find yourself in a situation were you have to process different versions of the same event type. To
make your reducer extra robust towards these situations, you should:

- follow the [Open-closed principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle): You can add new
  things to the payload of your actions but do not change/remove parts of your payload. Your reducer should be resilient
  to unknown parts of the payload.
- if you _have_ to change your payload/shape of the event, increase the `version` of the event and keep the old one. In
  your reducer you should keep the logic for the old version(s) and add logic specific for the new version.
  

### Load persisted events on startup

When your app starts you have to load and process the persisted events from last time
to rehydrate your store/state.

For this, you will use the `loadEventActions` action creator provided by *redux-event-sourcing*.
A good place for this is directly after you've created the store.

```ts
import { loadEventActions } from "redux-event-sourcing"

// create your store with event-sourcing middleware

store.dispatch(loadEventActions())
```


## Things to keep in mind

### Events should not trigger side effects

In the redux community there are middlewares that use actions to trigger side effects
like loading data from the server, i.e. [redux-observable](https://redux-observable.js.org/) or [redux-saga](https://redux-saga.js.org/).

**You should not trigger side effects on event actions.** *redux-event-sourcing* will replay event actions
during app startup and this would trigger the side effects.


## API

### `createEventSourcingMiddleware`

Creates a redux middleware for event-sourcing.

Types:

```ts
createEventSourcingMiddleware: (options: MiddlewareOptions) => Middleware

type MiddlewareOptions = {
  key: string
  storage?: Storage
}

type Storage = {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}
```

| param     | type    | description                                                                                                                                                            |
| --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "key"     | string  | _required_. A descriptive identifier of your domain/app. Used to not mix-up the state of different apps, i.e. for local-storage this is used as a key                  |
| "storage" | Storage | _optional_. A storage strategy to persist events. Uses local-storage by default. Compatible to [redux-persist](https://github.com/rt2zz/redux-persist#storage-engines) |

### `EventAction`

Event actions are actions enhanced with some metadata. Only events that have this structure are processed and persisted
by the middleware. All other actions are ignored.

Types:

```ts
import { AnyAction } from "redux"

type EventAction = AnyAction & {
  meta: {
    eventSourcing: {
      timestamp: number
      id: string
      version: number
    }
  }
}
```

| param     | type   | description                                                                                                                 |
| --------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| timestamp | number | the timestamp when the event was created. `Date.now()` is a good choice                                                     |
| id        | string | a unique identifier for this event. Use a UUID or something similar like [nanoid](https://www.npmjs.com/package/nanoid)     |
| version   | number | the version of the event. Should be increased when the shape/structure of the event is changed in a new version of the app. |

### `createEventAction`

Takes a "normal" action object and create an event-action.

Types:

```ts
import { AnyAction } from "redux"

createEventAction: (action: AnyAction, version?: number) => EventAction
```

| param   | type        | description                                                                                                                                                    |
| ------- | ----------- |----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| action  | `AnyAction` | _required_. The action that should be "converted" to an event-action. This has to be a "normal", serializable action object and not a thunk-action or similar. |
| version | number      | _optional_. The version of the action. By default `1` is used.                                                                                                 |

## What? Why?

"Event Sourcing" is the idea to use events as the single source of truth for the application state. Instead of
persisting the application state directly you are persisting the events that led to the current state. This pattern is
often described in the context of "Domain Driven Design". Redux is using events (typically named "actions") as a central
concept to calculate the application state with a reducer function. However, those events are volatile and not persisted
in any way. They are created by the UI and disappear after they are processed.

_redux-event-sourcing_ is an addon for redux that adds features to persist events and use those events as the source of
truth for application state. When the application is opened a second time, all previously persisted events will be
loaded and pushed to the reducer to re-calculate the current state from last time.

Event Sourcing is often combined with the architecture pattern "Command Query Responsibility Segregation" (CQRS). While
it's a good idea to keep CQRS in mind when using _redux-event-sourcing_, the library is not a CQRS library and doesn't
enforce a CQRS structure. [See Relation to CQRS](#relation-to-cqrs).

### How does it compare to `redux-persist`?

[redux-persist](https://github.com/rt2zz/redux-persist) is a great tool to persist and restore the redux application
state. However, _redux-persist_ doesn't store the redux actions but only the calculated state. There is nothing wrong
with this choice and in practise this will be a good solution most of the time. _redux-event-sourcing_ on the other hand
will not persist the calculated state but only the actions/events that led to this state. When the user opens the app
later on, all persisted actions will be processed again by the reducer to calculate the current state of the
application. This approach comes with some limitations but also with some advantages depending on your type of
application, see [Benefits of event sourcing](#benefits-of-event-sourcing).

### Benefits of event sourcing

Persisting events instead of the application state has several advantages compared to only persisting the "current
state":

#### Persist the intention of the user

When you persist events you are persisting the intention of the users. You know what interactions the user has done
instead of only knowing the result of these interactions. This way you can differentiate between different interactions
that led to the same state. For example, think of an app that stores the address of a user. There is a difference
between "correcting the address" and "moving to a new place". Both are totally different interactions even though they
have the same result: a changed address.

#### Future versions can get new insights from existing data

In future versions of your app you might be able to create new insights and features from old data. In the address
example from above, a new version of your app might give you statistics on how often a user moved to a new place. These
statistics can be calculated not only starting with the new version of your app but also on historical data. This is
possible even though at the time you've written the old app version you didn't even know that this feature might come.

#### Refactor application logic without loosing existing data

In the process of adding new features to your app you might need to refactor the structure of your reducers. The shape
of your state-tree might change a lot which makes it complicated to process old instances of persisted state data. To
solve this you have to write migration-scripts but this can become complicated when multiple migrations are needed.

Sometimes it might not be sufficient to write migration from old to new data format but also the other way around, i.e.
when users are using different versions of your app, or you have to downgrade to an older version because of some issues
with a refactoring.

Event sourcing can make these use-cases a lot easier. Persisted events aren't changed in any way. The structure of your
reducers doesn't matter as long as they understand existing events.

Sometimes, for a new feature you might have to change the shape of an existing event. This is possible by versioning your
events. Your reducer will have to check for the version of the incoming event and handle it accordingly.

### Disadvantages

This library was written with desktop apps (i.e. electron) and native mobile apps (i.e. react-native) in mind. For these apps
the data-storage often happens on the local device. On the other hand, most typical web-apps are hosted on a server, and
the data persistence is done on the server. While it might be possible to use _redux-event-sourcing_ for this
kind of applications as well it's likely a better idea to implement event-sourcing on the server (a good fit might be
something like [GraphQL](https://graphql.org/)) or to not do event-sourcing at all. _This library doesn't try to be a
one-size-fits-all solution and in many cases you shouldn't use it in your application_

Some issues with event-sourcing on the client:

#### No reliable persistence in browsers

Browsers do not provide a really reliable persistence solution. Of course there is "localStorage", but you might not
want to depend on it for critical data. Therefore, for most "normal" web apps you should use server-side persistence
instead. However, for desktop and native mobile apps there are reliable persistence solutions on the local file system
which is a better fit for this library.

#### Number of events

Depending on the type of application the number of events (redux actions) might grow exponentially. With
_redux-event-sourcing_ you don't have to persist _all_ actions but declare specific actions as "event" and only those
events are persisted, which should reduce the issue. The event-sourcing community has proposed some other patterns like
"snapshots" to tackle this issue and _redux-event-sourcing_ will try to support these patterns in the future.

However, for some use-cases the number of domain events might still be an issue and event sourcing might not be a good
solution in these cases.

## Relation to CQRS

"Command Query Responsibility Segregation" (CQRS) is an architecture pattern that is based on the idea to separate
"read" and "write" operations. It is often combined with event sourcing as both are a great fit, but this is not a must:
Both event-sourcing and CQRS can be used without the other.

A typical application flow in a CQRS app looks like this:

- based on user interaction a "command" is issued by the UI that represents a "request" to do something.
- a "command handler" verifies the command and decides if it is valid. The handler can use a "command model" for its
  decision. The command model is a representation of the application state that is only used by the command handlers to
  do their job.
- if the command is valid, the command handler will update the command model and issue one or more "events". An event represents a
  fact in the past.
- the event is persisted by an event-store
- there is a "query model" that also receives events and updates its state. The query model is a representation of the
  application state that is targeted for visualization in the UI. It's possible to have multiple query models (which can
  be similar or totally different ot each other) for different use-cases.

Both the command model and the query model are transient. For performance reasons they might be persisted, but can be
destroyed and re-created from the persisted events at any time. CQRS is mainly used for big server-side applications.
There are (at least) two big advantages of CQRS compared to traditional N-tier-architectures:

The biggest advantage of CQRS is that you can scale the "command-side" and "query-side" independently and can overcome
some limitations of the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem) with this approach. Another advantage
of CQRS is that it's a natural fit for event-sourcing with all it's [benefits](#benefits-of-event-sourcing) and it's way
easier to use event-sourcing in a CQRS architecture compared to a traditional three-tier architecture.

While CQRS is usually used for server applications, there is nothing that prevents you from using it on the client-side
too. One of the goals of this library is to show that you can use event-sourcing and (with some modifications) CQRS also for desktop apps.

### CQRS vs. Redux

CQRS and Redux have many similarities but there are also many differences between both approaches:

- CQRS strictly separates between "command" and "event" while redux mixes both concepts with it's "actions".
- CQRS separates the state into 1..n "command models", and 1..n "query models" while redux only has a single state.

With _redux-event-sourcing_ you mark some specific actions as "events". Like CQRS those events have to represent a fact
in the past. There are no "commands" in redux, but you could implement your
[redux-thunk](https://github.com/reduxjs/redux-thunk) action creators in a way that is similar to CQRS commands.

There is no separate "command model" and "query model" in redux. However, as there is no way to deploy and scale the
"command side" and "query side" in a redux app anyway, this is not really a big issue. In redux there is only one single
state object for the whole application state, but you can structure this object in any way you like, and it would
be possible to have a "sub state" (sometimes called "slice") for command and query state but this is totally up to you and not
enforce by the library.
