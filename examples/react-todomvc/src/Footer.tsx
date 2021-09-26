import React, { FC } from "react"
import { useAppDispatch, useAppSelector } from "./store"
import { changeItemsFilter, clearCompleted, FilterOptions, selectTodoState } from "./todoSlice"
import classNames from "classnames"

export const Footer: FC = () => {
  const appDispatch = useAppDispatch()
  const items = useAppSelector((rootState) => selectTodoState(rootState).items)
  const currentFilter = useAppSelector((rootState) => selectTodoState(rootState).itemsFilter)
  const notCompletedItems = items.filter((item) => !item.completed)

  const onChangeFilter = (filterOption: FilterOptions) => {
    appDispatch(changeItemsFilter({ filter: filterOption }))
  }

  const onClearCompleted = () => {
    appDispatch(clearCompleted())
  }

  return items.length > 0 ? (
    <footer className="footer">
      <span className="todo-count">
        <strong>{notCompletedItems.length}</strong> item{notCompletedItems.length !== 1 ? "s" : ""}
      </span>
      <ul className="filters">
        <li>
          <button
            className={classNames({
              selected: currentFilter === "all",
            })}
            onClick={() => onChangeFilter("all")}
          >
            All
          </button>
          <button
            className={classNames({
              selected: currentFilter === "active",
            })}
            onClick={() => onChangeFilter("active")}
          >
            Active
          </button>
          <button
            className={classNames({
              selected: currentFilter === "completed",
            })}
            onClick={() => onChangeFilter("completed")}
          >
            Completed
          </button>
        </li>
      </ul>
      {notCompletedItems.length > 0 && (
        <button className="clear-completed" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  ) : null
}
