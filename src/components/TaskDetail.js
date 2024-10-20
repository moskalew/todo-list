import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './TaskDetail.module.css';

export const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); // Новое состояние

  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:5000/todos/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setTask(data);
        setIsLoading(false);
        setIsCompleted(data.completed); // Установка начального состояния
      });
  }, [id]);

  const handleDelete = () => {
    setIsDeleting(true);
    fetch(`http://localhost:5000/todos/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        navigate('/');
      })
      .finally(() => setIsDeleting(false));
  };

  const handleComplete = () => {
    fetch(`http://localhost:5000/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, completed: true }),
    }).then(() => {
      setTask((prevTask) => ({ ...prevTask, completed: true }));
      setIsCompleted(true); // Изменение состояния после завершения
    });
  };

  return (
    <div className={styles.taskDetailContainer}>
      {isLoading ? (
        <div className={styles.loader}></div>
      ) : (
        task && (
          <>
            <h2 className={styles.taskTitle}>{task.title}</h2>
            <p className={styles.taskDescription}>
              {task.description || 'Описание отсутствует.'}
            </p>
            <div className={styles.buttonRow}>
              <button onClick={() => navigate(-1)} className={styles.button}>
                Назад
              </button>
              <button
                onClick={handleComplete}
                className={`${styles.button} ${
                  isCompleted ? styles.completedButton : ''
                }`} // Применение класса, если задача завершена
                disabled={task.completed}
              >
                Завершить
              </button>
              <button
                onClick={handleDelete}
                className={styles.button}
                disabled={isDeleting}
              >
                Удалить
              </button>
            </div>
          </>
        )
      )}
    </div>
  );
};
