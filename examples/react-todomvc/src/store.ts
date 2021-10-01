import { configureStore } from "@reduxjs/toolkit"
import { reducer as todoReducer } from "./todoSlice"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

import { createEventSourcingMiddleware, loadEventActions } from "redux-event-sourcing";

const eventSourcingMiddleware = createEventSourcingMiddleware({
  key:"todomvc-event-sourcing",
})

export const store = configureStore({
  reducer: {
    todo: todoReducer,
  },
  middleware: (getDefaultMiddleware => [...getDefaultMiddleware(), eventSourcingMiddleware])
})


store.dispatch(loadEventActions())

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
