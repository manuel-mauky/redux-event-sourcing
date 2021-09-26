import React, { FC } from "react"
import { useAppDispatch, useAppSelector } from "./store"
import { TodoItemView } from "./TodoItem"
import { selectAllItemsCompleted, selectFilteredItems, toggleAll } from "./todoSlice"

export const TodoList: FC = () => {
  const appDispatch = useAppDispatch()
  const items = useAppSelector(selectFilteredItems)
  const allItemsCompleted = useAppSelector(selectAllItemsCompleted)

  const onToggleAll = (e: React.FormEvent) => {
    appDispatch(toggleAll())
  }

  return (
    <>
      <input
        id="toggle-all"
        className="toggle-all"
        type="checkbox"
        checked={allItemsCompleted}
        onChange={onToggleAll}
      />
      <label htmlFor="toggle-all">Mark all as completed</label>
      <ul className="todo-list">
        {items.map((item) => (
          <TodoItemView key={item.id} item={item} />
        ))}
      </ul>
    </>
  )
}
