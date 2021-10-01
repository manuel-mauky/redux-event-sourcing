import { AnyAction } from "redux"

export type EventAction = AnyAction & {
  meta: {
    eventSourcing: {
      timestamp: number
      id: string
      version: number
    }
  }
}

const hasField = (obj: any, name: string, type: string): boolean => name in obj && typeof obj[name] === type

export const isEvent = (action: any): action is EventAction =>
  hasField(action, "meta", "object") &&
  hasField(action.meta, "eventSourcing", "object") &&
  hasField(action.meta.eventSourcing, "id", "string") &&
  hasField(action.meta.eventSourcing, "timestamp", "number") &&
  hasField(action.meta.eventSourcing, "version", "number")

export type Storage = {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}
