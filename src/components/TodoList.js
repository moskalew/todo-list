import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [newTodo, setNewTodo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSorted, setIsSorted] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/todos')
      .then((response) => response.json())
      .then((loadedTodos) => {
        setTodos(loadedTodos);
        setIsLoading(false);
      });
  }, []);

  const addTodo = () => {
    fetch('http://localhost:5000/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTodo, completed: false }),
    })
      .then(() => {
        setNewTodo('');
        return fetch('http://localhost:5000/todos');
      })
      .then((response) => response.json())
      .then(setTodos);
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
      <h1 className={styles.todoTitle}>Список задач</h1>
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
            <button className={styles.button} onClick={addTodo}>
              Добавить
            </button>
          </div>
          <div className={styles.inputRow}>
            <input
              type="text"
              placeholder="Поиск..."
              onChange={debouncedSearch}
            />
            <button className={styles.button} onClick={handleSortToggle}>
              {isSorted ? 'Отменить' : 'Сортировать'}
            </button>
          </div>
          <ul className={styles.todoList}>
            {sortedTodos.map((todo) => (
              <li key={todo.id} className={styles.todoItem}>
                <Link to={`/task/${todo.id}`} className={styles.todoLink}>
                  <span
                    className={`${styles.todoText} ${
                      todo.completed ? styles.completed : ''
                    }`}
                  >
                    {todo.title.length > 30
                      ? `${todo.title.substring(0, 30)}...`
                      : todo.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
