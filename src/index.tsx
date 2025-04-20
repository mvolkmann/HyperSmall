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
      <button autofocus onclick="parentElement.close()">
        Close
      </button>
      <form hx-post="/stack">
        <div>
          <label for="name">New stack name:</label>
          <input type="text" id="name" name="name" />
        </div>
        <div>
          <input type="checkbox" name="cpBg" />
          <label for="name">Copy current background</label>
        </div>
        <div>
          <input type="checkbox" name="openNew" />
          <label for="name">Open stack in new window</label>
        </div>
        <div>
          <label for="cardSize">Card size:</label>
          <select id="cardSize" name="cardSize">
            <option value="small">Small</option>
            <option value="classic">Classic</option>
            <option value="powerbook">PowerBook</option>
            <option value="large">Large</option>
            <option value="macpaint">MacPaint</option>
            <option value="window">Window</option>
          </select>
        </div>
        <button>Cancel</button>
        <button type="submit">Save</button>
      </form>
    </>
  );
});

export default app;
