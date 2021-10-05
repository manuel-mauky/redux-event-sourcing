import { Storage } from "./types"

export class WebStorage implements Storage {
  async getItem(key: string): Promise<string | null> {
    return new Promise((resolve) => resolve(localStorage.getItem(key)))
  }

  async removeItem(key: string): Promise<void> {
    return new Promise((resolve) => resolve(localStorage.removeItem(key)))
  }

  async setItem(key: string, value: string): Promise<void> {
    return new Promise((resolve) => resolve(localStorage.setItem(key, value)))
  }
}
