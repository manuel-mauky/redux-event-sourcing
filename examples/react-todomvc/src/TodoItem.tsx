import React, { FC, useRef, useState } from "react"
import { completeTodo, deleteTodo, editTodo, resetCompleteTodo, TodoItem } from "./todoSlice"
import { useAppDispatch } from "./store"
import classNames from "classnames"

type Props = {
  item: TodoItem
}

export const TodoItemView: FC<Props> = ({ item }) => {
  const appDispatch = useAppDispatch()
  const inputRef = useRef<HTMLInputElement>(null)

  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(item.title)

  const onDelete = () => {
    appDispatch(deleteTodo({ id: item.id }))
  }

  const onCompleted = () => {
    if (item.completed) {
      appDispatch(resetCompleteTodo({ id: item.id }))
    } else {
      appDispatch(completeTodo({ id: item.id }))
    }
  }

  const onSubmit = () => {
    const value = editText.trim()
    if (value) {
      appDispatch(editTodo({ id: item.id, title: value }))
      setEditing(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setEditText(item.title)
    } else if (e.key === "Enter") {
      onSubmit()
    }
  }

  const onLabelClicked = () => {
    setEditing(true)
  }

  return (
    <li
      className={classNames({
        completed: item.completed,
        editing: editing,
      })}
    >
      {editing ? (
        <>
          <input
            autoFocus
            ref={inputRef}
            className="edit"
            value={editText}
            onBlur={onSubmit}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </>
      ) : (
        <>
          <div className="view">
            <input className="toggle" type="checkbox" checked={item.completed} onChange={onCompleted} />
            <label onDoubleClick={onLabelClicked}>{item.title}</label>
            <button className="destroy" onClick={onDelete} />
          </div>
        </>
      )}
    </li>
  )
}
