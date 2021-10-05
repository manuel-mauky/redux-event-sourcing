import { Middleware } from "redux"
import { isEvent, Storage } from "./types"
import { EventStore } from "./event-store"
import { WebStorage } from "./web-storage"

export type MiddlewareOptions = {
  key: string
  storage?: Storage
}

export const EVENT_SOURCING_LOAD_EVENTS_ACTION_TYPE = "EVENT-SOURCING/load-events"
export const EVENT_SOURCING_LOAD_EVENTS_DONE_ACTION_TYPE = "EVENT-SOURCING/load-events-done"
export const EVENT_SOURCING_PERSIST_EVENT_FAILED_ACTION_TYPE = "EVENT-SOURCING/persist-event-failed"

export type EventSourcingLoadEventsAction = {
  type: typeof EVENT_SOURCING_LOAD_EVENTS_ACTION_TYPE
}

export type EventSourcingLoadEventsDoneAction = {
  type: typeof EVENT_SOURCING_LOAD_EVENTS_DONE_ACTION_TYPE
}

export type EventSourcingPersistEventFailedAction = {
  type: typeof EVENT_SOURCING_PERSIST_EVENT_FAILED_ACTION_TYPE
  error: any
}

export const loadEventActions = (): EventSourcingLoadEventsAction => ({
  type: EVENT_SOURCING_LOAD_EVENTS_ACTION_TYPE,
})

export const createEventSourcingMiddleware = (options: MiddlewareOptions): Middleware => {
  const esStorage = new EventStore(options.storage || new WebStorage(), options.key)

  let isLoading: boolean

  return ({ dispatch, getState }) =>
    (next) =>
    (action: any) => {
      if (action.type === EVENT_SOURCING_LOAD_EVENTS_ACTION_TYPE) {
        isLoading = true
        esStorage.loadAllEvents().then((events) => {
          events.forEach((event) => {
            dispatch(event)
          })

          dispatch({
            type: EVENT_SOURCING_LOAD_EVENTS_DONE_ACTION_TYPE,
          })
        })
      }

      if (action.type === EVENT_SOURCING_LOAD_EVENTS_DONE_ACTION_TYPE) {
        isLoading = false
      }

      if (isEvent(action)) {
        if (!isLoading) {
          esStorage
            .store(action)
            .then(() => {})
            .catch((reason) => {
              dispatch({
                type: EVENT_SOURCING_PERSIST_EVENT_FAILED_ACTION_TYPE,
                error: reason,
              })
            })
        }
      }

      return next(action)
    }
}
