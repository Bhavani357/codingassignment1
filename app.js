const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dateFns = require("date-fns/addDays");
const app = express();
app.use(express.json());
module.exports = app;

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
const priorityArray = ["HIGH", "MEDIUM", "LOW"];
const categoryArray = ["WORK", "HOME", "LEARNING"];

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasPriorityAndCategoryProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
            SELECT
                id,todo,priority,status,category,due_date as dueDate 
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND priority = '${priority}';`;
      break;
    case hasCategoryAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
            SELECT
                id,todo,priority,status,category,due_date as dueDate 
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND category = '${category}';`;
      break;
    case hasPriorityAndCategoryProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
            SELECT
                id,todo,priority,status,category,due_date as dueDate 
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND category = '${category}'
                AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
            SELECT
                id,todo,priority,status,category,due_date as dueDate 
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
            SELECT
                id,todo,priority,status,category,due_date as dueDate 
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND status = '${status}';`;
      break;
    case hasCategoryProperty(request.query):
      getTodosQuery = `
            SELECT
                id,todo,priority,status,category,due_date as dueDate 
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND category = '${category}';`;
      break;
    default:
      getTodosQuery = `
            SELECT
                id,todo,priority,status,category,due_date as dueDate 
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getSpecifiedTodo = `
    SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE id = '${todoId}';`;
  const getTodo = await db.get(getSpecifiedTodo);
  response.send(getTodo);
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  //const formattedDate = format(new Date(date), "yyyy-MM-dd");
  const allTodosAtSpecifiedDate = `
    SELECT id,todo,priority,status,category,due_date as dueDate 
    FROM todo 
    WHERE due_date = '${date}';`;
  const todosArray = await db.all(allTodosAtSpecifiedDate);
  response.send(todosArray);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  //format(new Date(2014, 1, 11), "MM/dd/yyyy");

  const postTodo = `
  INSERT INTO todo(id,todo,priority,status,category,due_date)
  VALUES (
      '${id}',
      '${todo}',
      '${priority}',
      '${status}',
      '${category}',
      '${dueDate}'
  );`;
  const result = await db.run(postTodo);
  response.send("Todo Successfully Added");
});

