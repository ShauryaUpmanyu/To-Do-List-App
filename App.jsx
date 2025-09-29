// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Style.css';

function App() {
  // State variables to manage the application's data and UI
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('All');
  const [activeCount, setActiveCount] = useState(0);

  // The base URL for the backend API
  const API_URL = 'http://localhost:5000';

  // useEffect hook to fetch todos when the component mounts or the category changes
  useEffect(() => {
    fetchTodos();
  }, [newTodoCategory]);

  // Function to fetch all todos from the backend API
  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
      // Filter todos to count only active items in the current category
      const filteredTodos = response.data.filter(item =>
        !item.disabled && (newTodoCategory === 'All' || item.category === newTodoCategory)
      );
      setActiveCount(filteredTodos.length);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // Function to add a new todo to the database
  const addTodo = async (e) => {
    e.preventDefault();
    if (newTodoText.trim() === '' || newTodoCategory === 'All') {
      alert("Please select a valid category and enter a task.");
      return;
    }

    try {
      // Fetching post(create) function from backend 
      const response = await axios.post(`${API_URL}/todos`, {
        text: newTodoText,
        category: newTodoCategory,
        disabled: false
      });
      setTodos([...todos, response.data]);
      setNewTodoText('');
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  // Function to toggle a todo's status (completed/not completed)
  const toggleTask = async (todoId) => {
    try {
      const todoToUpdate = todos.find(todo => todo._id === todoId);
      const updatedState = { disabled: !todoToUpdate.disabled };

      const response = await axios.put(`${API_URL}/todos/${todoId}`, updatedState);
      
      // If the task is marked as disabled (completed), delete it from the database
      if (response.data.disabled === false) {
          await axios.delete(`${API_URL}/todos/${todoId}`);
      }
      fetchTodos();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  // Function to delete all tasks in the current category
  const deleteAllTasks = async () => {
    const todosToDelete = newTodoCategory === 'All' ? todos : todos.filter(todo => todo.category === newTodoCategory);

    if (todosToDelete.length === 0) {
      alert("No tasks to delete.");
      return;
    }

    if (!window.confirm("Delete ALL tasks? This cannot be undone.")) return;

    try {
      for (const todo of todosToDelete) {
        await axios.delete(`${API_URL}/todos/${todo._id}`);
      }
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todos:', error);
    }
  };

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
    const themeButton = document.getElementById("theme-toggle");
    if (document.body.classList.contains("dark-mode")) {
      themeButton.textContent = "☀️ Light Mode";
    } else {
      themeButton.textContent = "🌙 Dark Mode";
    }
  };

  // Function to handle key presses on the input field
  const handleKeyDown = (e) => {
    // Check if the pressed key is "Enter"
    if (e.key === 'Enter') {
      addTodo(e);
    }
  };

  // JSX to render the UI
  return (
    <>
      <section className="todo">
        <h2>To-Do List</h2>
        <div className="input">
          <input
            type="text"
            className="input-field"
            id="todoInput"
            placeholder="Add New Task"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={handleKeyDown} // New event handler for "Enter" key press
          />
          <select
            id="taskCategory"
            value={newTodoCategory}
            onChange={(e) => setNewTodoCategory(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Urgent">Urgent</option>
          </select>
          <button className="btn" onClick={addTodo}>
            ADD
          </button>
        </div>
        <ul className="scroll">
          {todos
            .filter(todo => newTodoCategory === 'All' || todo.category === newTodoCategory)
            .map((todo) => (
              <li key={todo._id}>
                <div className="todo-container">
                  <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={todo.disabled}
                    onChange={() => toggleTask(todo._id)}
                  />
                  <p className={todo.disabled ? 'disabled' : ''}>
                    {todo.text}
                  </p>
                </div>
              </li>
            ))}
        </ul>
        <div>
          <hr className="counter" />
          <div className="counter-container">
            <p>
              <span id="todoCount">{activeCount}</span> Items Total
            </p>
            <button id="deleteButton" onClick={deleteAllTasks}>
              Delete All
            </button>
          </div>
        </div>
      </section>
      <footer>
        <div className="footer">
          <p className="made-by">Made-By</p>
          <p className="author"> Shaurya Upmanyu</p>
        </div>
      </footer>
      <button id="theme-toggle" onClick={toggleTheme}>
        🌙 Dark Mode
      </button>
    </>
  );
}

export default App;