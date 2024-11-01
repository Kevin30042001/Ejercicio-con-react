import React, { useState, useEffect } from 'react';
import { 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc 
  } from 'firebase/firestore';
  import { db } from '../config';
import { Todo, TodoInput } from '../types/todo';
// import { Button } from './ui/button';
import { CheckCircle, Circle, Trash2 } from 'lucide-react';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTodos = async (): Promise<void> => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'todos'));
      const todosData: Todo[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as TodoInput)
      }));
      setTodos(todosData);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
    setLoading(false);
  };

  const addTodo = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    console.log("Evento de envío detectado"); // Verificar si el evento se dispara

    if (!newTodo.trim()) return;
  
    const todoData: TodoInput = {
      text: newTodo,
      completed: false,
      createdAt: new Date().toISOString()
    };
  
    try {
      console.log("Intentando agregar tarea a Firebase..."); // Confirmar ejecución
      const docRef = await addDoc(collection(db, 'todos'), todoData);
      console.log("Tarea agregada con ID: ", docRef.id); // Confirmar si Firebase devuelve el ID
      setTodos([...todos, { id: docRef.id, ...todoData }]);
      setNewTodo('');
    } catch (error) {
      console.error("Error al agregar tarea:", error); // Ver errores en la consola
    }
  };

  const toggleTodo = async (id: string): Promise<void> => {
    const todoToToggle = todos.find(todo => todo.id === id);
    if (!todoToToggle) return;

    try {
      await updateDoc(doc(db, 'todos', id), {
        completed: !todoToToggle.completed
      });
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const deleteTodo = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'todos', id));
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Verificación de conexión a Firebase
  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        const testSnapshot = await getDocs(collection(db, 'todos'));
        console.log("Conexión a Firebase exitosa:", testSnapshot.size, "documentos encontrados.");
      } catch (error) {
        console.error("Error de conexión a Firebase:", error);
      }
    };
    testFirebaseConnection();
  }, []);

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md mb-6 p-4">
        <form onSubmit={addTodo} className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Nueva tarea..."
            className="flex-grow rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Usamos un botón HTML estándar para probar el envío */}
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Agregar
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-4">Cargando tareas...</div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div 
              key={todo.id} 
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {todo.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
