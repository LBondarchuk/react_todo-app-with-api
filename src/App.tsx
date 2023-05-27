/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useState } from 'react';
import { Header } from './components/header/Header';
import { List } from './components/list/List';
import { Footer } from './components/footer/Footer';
import { UserWarning } from './UserWarning';
import { Warnings } from './components/warnings/Warnings';
import { deleteTodo, getTodos, updateTodo } from './api/todos';
import { Todo } from './types/Todo';
import { TodoFilter } from './types/TodoFilter';
import { ErrorMessage } from './types/ErrorMessage';

const USER_ID = 10514;

const { All, Active, Completed } = TodoFilter;

export const App: React.FC = () => {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [filterBy, setFilterBy] = useState(All);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<number[]>([]);

  const loadTodos = () => {
    getTodos(USER_ID)
      .then((todos) => setTodoList(todos))
      .catch(() => setError(ErrorMessage.Get));
  };

  useEffect(() => loadTodos(), []);

  useEffect(() => {
    setTimeout(() => setError(''), 3000);
  }, [error]);

  const completedTodos = useMemo(() => todoList
    .filter(todo => todo.completed).length, [todoList]);

  const leftItems = todoList.length - completedTodos;

  if (!USER_ID) {
    return <UserWarning />;
  }

  function filterList() {
    switch (filterBy) {
      case Active:
        return todoList.filter((todo: Todo) => !todo.completed);

      case Completed:
        return todoList
          .filter((todo: Todo) => !todo.id || todo.completed);

      default:
        return todoList;
    }
  }

  function addTodoToProcesing(id : number | null) {
    !id ? setProcessing([]) : setProcessing(prev => [...prev, id]);
  }

  function removeTodo(id: number, sortBy: string) {
    addTodoToProcesing(id);
    deleteTodo(id)
      .then(() => {
        sortBy === 'completed'
          ? setTodoList(todoList.filter(todo => !todo.completed))
          : setTodoList(todoList.filter(todo => todo.id !== id));
      })
      .catch(() => setError(ErrorMessage.Delete))
      .finally(() => addTodoToProcesing(null));
  }

  function editTodo(id: number, itemToEdit: object, changeTodo: string) {
    addTodoToProcesing(id);
    updateTodo(id, itemToEdit)
      .then(() => setTodoList(todoList.map(currentTodo => {
        if (changeTodo === 'All') {
          return { ...currentTodo, ...itemToEdit };
        }

        return id === currentTodo.id
          ? { ...currentTodo, ...itemToEdit }
          : currentTodo;
      })))
      .catch(() => setError(ErrorMessage.Patch))
      .finally(() => addTodoToProcesing(null));
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          setTodoList={setTodoList}
          todoList={todoList}
          setError={setError}
          addTodoToProcesing={(id:number | null) => addTodoToProcesing(id)}
          editTodo={
            (id: number, itemToEdit: object) => editTodo(id, itemToEdit, 'All')
          }
        />

        <List
          setTodoList={setTodoList}
          todoList={filterList()}
          setError={setError}
          processing={processing}
          removeTodo={(id: number) => removeTodo(id, 'id')}
          editTodo={
            (id: number, itemToEdit: object) => editTodo(id, itemToEdit, 'id')
          }
        />

        {todoList.length !== 0 && (
          <Footer
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            todoList={todoList}
            removeTodo={(id: number) => removeTodo(id, 'completed')}
            completedTodos={completedTodos}
            leftItems={leftItems}
          />
        )}
      </div>
      <Warnings error={error} setError={setError} />
    </div>
  );
};
