import React from "react"
import "./App.css"
import "todomvc-app-css/index.css"
import "todomvc-common/base.css"
import { TodoList } from "./TodoList"
import { AddNewTodo } from "./AddNewTodo"
import { Footer } from "./Footer"

function App() {
  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <AddNewTodo />
      </header>
      <section className="main">
        <TodoList />
      </section>
      <Footer />
    </section>
  )
}

export default App
