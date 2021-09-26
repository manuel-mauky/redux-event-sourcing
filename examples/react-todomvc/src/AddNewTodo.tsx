import React, { FC, useState } from "react"
import { useAppDispatch } from "./store"
import { addNewTodo } from "./todoSlice"

export const AddNewTodo: FC = () => {
  const appDispatch = useAppDispatch()
  const [text, setText] = useState("")

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const title = text.trim()
      if (title) {
        appDispatch(addNewTodo(title))
        setText("")
      }
    }
  }

  return (
    <input
      className="new-todo"
      placeholder="What needs to be done?"
      autoFocus
      onKeyDown={onKeyDown}
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  )
}
