import { type Context, Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";

const app = new Hono();

/*
app.get("/", (c) => {
  return c.text("Hello Hono!");
});
*/

// This logs all HTTP requests to the terminal where the server is running.
app.use("/*", logger());

// This serves static files from the public directory.
app.use("/*", serveStatic({ root: "./public" }));

app.get("/new-stack", (c: Context) => {
  return c.html(
    <>
      <form
        hx-post="/stack"
        x-data="{
          name: '',
          onNameChange(event) {
            const submitButton = document.querySelector('button[type=submit]');
           submitButton.disabled = event.target.value === '';
          }
        }"
      >
        <div>
          <label for="name">New stack name:</label>
          <input
            type="text"
            id="name"
            name="name"
            x-model="name"
            x-on:keyup="onNameChange($event)"
          />
        </div>
        <div>
          <input type="checkbox" id="copyBg" name="copyBg" />
          <label for="copyBg">Copy current background</label>
        </div>
        <div>
          <input type="checkbox" id="openNew" name="openNew" />
          <label for="openNew">Open stack in new window</label>
        </div>
        <div>
          <label for="cardSize">Card size:</label>
          <select id="cardSize" name="cardSize">
            <option>Small</option>
            <option>Classic</option>
            <option>PowerBook</option>
            <option>Large</option>
            <option>MacPaint</option>
            <option>Window</option>
          </select>
        </div>
        <button autofocus onclick="parentElement.parentElement.close()">
          Cancel
        </button>
        <button disabled={true} type="submit">
          Save
        </button>
      </form>
    </>
  );
});

app.post("/stack", async (c: Context) => {
  const formData = await c.req.formData();
  const name = formData.get("name");
  const copyBg = Boolean(formData.get("copyBg"));
  const openNew = Boolean(formData.get("openNew"));
  const cardSize = formData.get("cardSize");

  console.log("index.tsx post /stack: name =", name);
  console.log("index.tsx post /stack: copyBg =", copyBg);
  console.log("index.tsx post /stack: openNew =", openNew);
  console.log("index.tsx post /stack: cardSize =", cardSize);

  return c.body(null, 204); // No Content
});

export default app;
