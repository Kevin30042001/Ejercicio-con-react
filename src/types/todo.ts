export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
  }
  
  export interface TodoInput {
    text: string;
    completed: boolean;
    createdAt: string;
  }