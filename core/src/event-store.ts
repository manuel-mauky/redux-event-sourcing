import { EventAction, Storage } from "./types"

export class EventStore {
  constructor(private storage: Storage, private key: string) {}

  private async _load(): Promise<Array<EventAction> | null> {
    const storageString = await this.storage.getItem(this.key)
    if (storageString) {
      const events: Array<EventAction> = JSON.parse(storageString)
      return events
    } else {
      return null
    }
  }

  private async _store(events: Array<EventAction>) {
    await localStorage.setItem(this.key, JSON.stringify(events))
  }

  async store(event: EventAction): Promise<void> {
    let events = await this._load()
    if (events) {
      events.push(event)
    } else {
      events = [event]
    }
    await this._store(events)
  }

  async loadSingleEvent(id: string): Promise<EventAction | undefined> {
    let events = await this._load()

    if (events) {
      return events.find((event) => event.meta.eventSourcing.id === id)
    } else {
      return undefined
    }
  }

  async loadAllEvents(): Promise<Array<EventAction>> {
    const events = await this._load()
    if (events) {
      return events
    } else {
      return []
    }
  }
}
