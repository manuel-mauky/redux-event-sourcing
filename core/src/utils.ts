import { AnyAction } from "redux"
import { EventAction } from "./types"
import { nanoid } from "nanoid"

export const createEventAction = (action: AnyAction, version?: number): EventAction => ({
  ...action,
  meta: {
    ...action.meta,
    eventSourcing: {
      id: nanoid(),
      timestamp: Date.now(),
      version: version || 1,
    },
  },
})
