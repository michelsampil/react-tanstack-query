// 1. Installation
// 👇 To get started, install TanStack:

// npm install @tanstack/react-query

// 2. Setting Up QueryClient
// 👇 Create a QueryClient and wrap your app with QueryClientProvider.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourAppComponents />
    </QueryClientProvider>
  );
}

// 3. Fetching Data with useQuery
// 👇 Use useQuery to fetch data. It automatically caches the results and manages the loading state.

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchTodos = async () => {
  const { data } = await axios.get("/api/todos");
  return data;
};

function Todos() {
  const { data, error, isLoading } = useQuery(["todos"], fetchTodos);
  // we can pass the queryKey and the queryFn as 👆 two separated params
  // or we can pass an query configuration object if
  // we want to set additional query settings 👇

  //   const { data, error, isLoading } = useQuery({
  //     queryKey: ['todos'],
  //     queryFn: fetchTodos,
  //     staleTime: 1000 * 60 * 5, // 5 minutes
  //     cacheTime: 1000 * 60 * 10, // 10 minutes
  //     refetchOnWindowFocus: true,
  //   });

  if (isLoading) return "Loading...";
  if (error) return "An error occurred: " + error.message;

  return (
    <div>
      {data.map((todo) => (
        <p key={todo.id}>{todo.title}</p>
      ))}
    </div>
  );
}

// NOTE:

// - queryKey: Unique key to identify the query. It's used for caching and managing query instances.
// - queryFn: The function that fetches the data.
// - staleTime: Time in milliseconds for how long the data is considered fresh. During this time, it won't refetch.
// - cacheTime: Time in milliseconds for how long unused/inactive query data stays in memory.
// - refetchOnWindowFocus: Boolean or function indicating if the query should refetch on window focus.

// 4. Mutating Data with useMutation
// 👇 Use useMutation for creating, updating, or deleting data.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const addTodo = async (newTodo) => {
  const { data } = await axios.post("/api/todos", newTodo);
  return data;
};

function AddTodo() {
  const queryClient = useQueryClient();
  const mutation = useMutation(addTodo, {
    onSuccess: () => {
      queryClient.invalidateQueries(["todos"]);
    },
  });

  const handleSubmit = () => {
    mutation.mutate({ title: "New Todo" });
  };

  return <button onClick={handleSubmit}>Add Todo</button>;
}

// 5. Prefetching Data
// 👇 Prefetching allows you to load data in the background before it’s needed.

import { useQueryClient } from "@tanstack/react-query";

function PrefetchTodos() {
  const queryClient = useQueryClient();

  const prefetchTodos = async () => {
    await queryClient.prefetchQuery(["todos"], fetchTodos);
  };

  return <button onClick={prefetchTodos}>Prefetch Todos</button>;
}

// 6. Query Invalidation
// 👇 Invalidate queries to refetch data.

import { useQueryClient } from "@tanstack/react-query";

function InvalidateTodos() {
  const queryClient = useQueryClient();

  const invalidateTodos = () => {
    queryClient.invalidateQueries(["todos"]);
  };

  return <button onClick={invalidateTodos}>Invalidate Todos</button>;
}

// 7. Optimistic Updates
// 👇 Optimistic updates allow immediate UI updates while the server request is in progress.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const updateTodo = async (updatedTodo) => {
  const { data } = await axios.put(`/api/todos/${updatedTodo.id}`, updatedTodo);
  return data;
};

function UpdateTodo() {
  const queryClient = useQueryClient();
  const mutation = useMutation(updateTodo, {
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries(["todos"]);

      const previousTodos = queryClient.getQueryData(["todos"]);

      queryClient.setQueryData(["todos"], (old) =>
        old.map((todo) =>
          todo.id === newTodo.id ? { ...todo, ...newTodo } : todo
        )
      );

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["todos"], context.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["todos"]);
    },
  });

  const handleUpdate = () => {
    mutation.mutate({ id: 1, title: "Updated Todo" });
  };

  return <button onClick={handleUpdate}>Update Todo</button>;
}

// 8. Paginated and Infinite Queries
// 👇 For handling pagination or infinite scrolling.

import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchProjects = async ({ pageParam = 1 }) => {
  const { data } = await axios.get(`/api/projects?page=${pageParam}`);
  return data;
};

function Projects() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
    ["projects"],
    fetchProjects,
    {
      getNextPageParam: (lastPage, pages) => lastPage.nextPage ?? false,
    }
  );

  return (
    <div>
      {data.pages.map((page, index) => (
        <div key={index}>
          {page.projects.map((project) => (
            <p key={project.id}>{project.name}</p>
          ))}
        </div>
      ))}
      <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
        Load More
      </button>
    </div>
  );
}

// 9. Background Refetching
// 👇 Refetch queries in the background when certain events occur (e.g., window focus, network reconnect).

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchUser = async () => {
  const { data } = await axios.get("/api/user");
  return data;
};

function User() {
  const { data, error, isLoading } = useQuery(["user"], fetchUser, {
    refetchOnWindowFocus: true,
  });

  if (isLoading) return "Loading...";
  if (error) return "An error occurred: " + error.message;

  return (
    <div>
      <h1>{data.name}</h1>
    </div>
  );
}
