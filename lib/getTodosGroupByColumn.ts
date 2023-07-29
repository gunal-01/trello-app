import { databases } from "@/appwrite";

export const getTodosGroupByColumn = async () => {
    const data = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
    );

    const todos = data.documents;

    const columns = todos.reduce((acc, todo) => {
        if (!acc.get(todo.status)) {
            acc.set(todo.status, {
                id: todo.status,
                todos: []
            })
        }

        acc.get(todo.status)!.todos.push({
            $id: todo.$id,
            $createdAt: todo.$createdAt,
            title: todo.title,
            status: todo.status,
            // get the image if it exist on the todo
            ...(todo.image && { image: JSON.parse(todo.Image) })
        });

        return acc;

    }, new Map<TypedColumn, Column>)

    // if columns doesn't have inprogress. todo and done, add them with empty todos
    const columnTypes: TypedColumn[] = ["todo","inprogress","done"];
    for (const columnType of columnTypes) {
        if (!columns.get(columnType)) {
            columns.set(columnType, {
                id: columnType,
                todos: [],
            });
        }
    }

// sort columns by columnTypes
    const sortedColumns = new Map(
        Array.from(columns.entries()).sort(
            (a,b) => columnTypes.indexOf(a[0]) - columnTypes.indexOf(b[0])
        )
    );

    const board: Board = {
        columns: sortedColumns,
    }

    return board;
};