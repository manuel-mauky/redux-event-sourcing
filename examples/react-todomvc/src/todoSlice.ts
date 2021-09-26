import { createSelector, createSlice, PayloadAction, Selector, ThunkAction } from "@reduxjs/toolkit"
import { RootState } from "./store"
import { AnyAction } from "redux"
import { nanoid } from "nanoid"

export type TodoItem = {
  id: string
  title: string
  completed: boolean
}

export type FilterOptions = "all" | "active" | "completed"

export type TodoState = {
  items: ReadonlyArray<TodoItem>
  itemsFilter: FilterOptions
}

export const initialState: TodoState = {
  items: [],
  itemsFilter: "all",
}

export const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    addNewTodo: (state, action: PayloadAction<{ id: string; title: string }>) => {
      state.items.push({
        id: action.payload.id,
        title: action.payload.title,
        completed: false,
      })
    },
    editTodo: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (item) {
        item.title = action.payload.title
      }
    },
    completeTodo: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (item) {
        item.completed = true
      }
    },
    resetCompleteTodo: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (item) {
        item.completed = false
      }
    },
    deleteTodo: (state, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id)
    },
    changeItemsFilter: (state, action: PayloadAction<{ filter: FilterOptions }>) => {
      state.itemsFilter = action.payload.filter
    },
    clearCompleted: (state) => {
      state.items = state.items.filter((i) => !i.completed)
    },
    toggleAll: (state) => {
      const allItemsCompleted = state.items.every((item) => item.completed)

      state.items.forEach((item) => (item.completed = !allItemsCompleted))
    },
  },
})

export const { editTodo, completeTodo, resetCompleteTodo, deleteTodo, changeItemsFilter, clearCompleted, toggleAll } =
  todoSlice.actions

export const addNewTodo = (title: string): ThunkAction<void, RootState, unknown, AnyAction> => {
  return async (dispatch) => {
    const id = nanoid()

    dispatch(todoSlice.actions.addNewTodo({ id, title }))
  }
}

export const reducer = todoSlice.reducer

export const selectTodoState: Selector<RootState, TodoState> = (rootState) => rootState.todo
export const selectFilteredItems = createSelector<RootState, TodoState, ReadonlyArray<TodoItem>>(
  [selectTodoState],
  (todoState) => {
    switch (todoState.itemsFilter) {
      case "active":
        return todoState.items.filter((item) => !item.completed)
      case "completed":
        return todoState.items.filter((item) => item.completed)
      default:
        return todoState.items
    }
  }
)

export const selectAllItemsCompleted = createSelector<RootState, TodoState, boolean>([selectTodoState], (todoState) =>
  todoState.items.every((item) => item.completed)
)
