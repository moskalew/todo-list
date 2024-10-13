import React, { useEffect, useState } from 'react';
import styles from './TodoList.module.css';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

export const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSorted, setIsSorted] = useState(false);
  const [refreshTodosFlag, setRefreshTodosFlag] = useState(false);

  const refreshTodos = () => {
    setRefreshTodosFlag((prev) => !prev);
  };

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/todos')
      .then((response) => response.json())
      .then((loadedTodos) => {
        setTodos(loadedTodos);
        setIsLoading(false);
      });
  }, [refreshTodosFlag]);

  const addTodo = () => {
    setIsCreating(true);
    fetch('http://localhost:5000/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTodo, completed: false }),
    })
      .then((response) => response.json())
      .then(() => {
        refreshTodos();
        setNewTodo('');
      })
      .finally(() => setIsCreating(false));
  };

  const deleteTodo = (id) => {
    setIsDeleting(true);
    fetch(`http://localhost:5000/todos/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        refreshTodos();
      })
      .finally(() => setIsDeleting(false));
  };

  const toggleComplete = (id) => {
    const todo = todos.find((todo) => todo.id === id);
    fetch(`http://localhost:5000/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...todo, completed: !todo.completed }),
    }).then(() => {
      refreshTodos();
    });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const debouncedSearch = debounce(handleSearch, 300);

  const filteredTodos = todos.filter((todo) =>
    todo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTodos = isSorted
    ? [...filteredTodos].sort((a, b) => a.title.localeCompare(b.title))
    : filteredTodos;

  const handleSortToggle = () => {
    setIsSorted((prev) => !prev);
  };

  return (
    <div className={styles.todoContainer}>
      <h1 className={styles.todoTitle}>Список дел</h1> {/* Заголовок */}
      {isLoading ? (
        <div className={styles.loader}></div>
      ) : (
        <>
          <div className={styles.inputRow}>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Добавить новую задачу"
            />
            <button disabled={isCreating} onClick={addTodo}>
              Добавить
            </button>
          </div>
          <div className={styles.inputRow}>
            <input
              type="text"
              placeholder="Поиск..."
              onChange={debouncedSearch}
            />
            <button onClick={handleSortToggle}>
              {isSorted ? 'Отменить' : 'Сортировать'}
            </button>
          </div>
          <ul className={styles.todoList}>
            {sortedTodos.map((todo) => (
              <li key={todo.id} className={styles.todoItem}>
                <span
                  style={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                  }}
                  onClick={() => toggleComplete(todo.id)}
                >
                  {todo.title}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  disabled={isDeleting}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
