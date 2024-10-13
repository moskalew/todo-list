import React, { useEffect, useState } from 'react';
import styles from './TodoList.module.css';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { db } from './firebase';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSorted, setIsSorted] = useState(false);

  useEffect(() => {
    const todoListDbRef = ref(db, 'todos');

    const unsubscribe = onValue(todoListDbRef, (snapshot) => {
      const loadedTodos = snapshot.val();
      const todosArray = loadedTodos
        ? Object.entries(loadedTodos).map(([id, todo]) => ({ id, ...todo }))
        : [];
      setTodos(todosArray);
      setIsLoading(false);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  const addTodo = () => {
    if (!newTodo.trim()) return; // Проверка на пустую задачу
    setIsCreating(true);
    const newTodoRef = ref(db, `todos/${Date.now()}`);
    set(newTodoRef, { title: newTodo, completed: false })
      .then(() => {
        setNewTodo('');
      })
      .finally(() => setIsCreating(false));
  };

  const deleteTodo = (id) => {
    setIsDeleting(true);
    const todoRef = ref(db, `todos/${id}`);
    remove(todoRef).finally(() => setIsDeleting(false));
  };

  const toggleComplete = (id) => {
    const todo = todos.find((todo) => todo.id === id);
    const todoRef = ref(db, `todos/${id}`);
    update(todoRef, { completed: !todo.completed }).then(() => {});
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
