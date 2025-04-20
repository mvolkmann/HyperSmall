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
          cardSize: 'Small',
          name: '',
          onCardSizeChange,
          onStackNameChange
        }"
      >
        <div class="column">
          <label class="mb1" for="name">
            New stack name:
          </label>
          <input
            id="name"
            name="name"
            style="margin-bottom: 1rem"
            type="text"
            x-model="name"
            x-on:keyup="onStackNameChange($event)"
          />
          <div class="row">
            <input type="checkbox" id="copyBg" name="copyBg" />
            <label for="copyBg">Copy current background</label>
          </div>
          <div class="row">
            <input type="checkbox" id="openNew" name="openNew" />
            <label for="openNew">Open stack in new window</label>
          </div>
        </div>
        <div class="border-right-dotted column gap2">
          <button autofocus onclick="this.closest('dialog').close()">
            Cancel
          </button>
          <button disabled={true} type="submit">
            Save
          </button>
        </div>
        <div class="column">
          <label class="mb1" for="cardSize">
            Card size:
          </label>
          <select
            class="mb4"
            id="cardSize"
            name="cardSize"
            x-model="cardSize"
            x-on:change="onCardSizeChange($event)"
          >
            <option>Small</option>
            <option>Classic</option>
            <option>PowerBook</option>
            <option>Large</option>
            <option>MacPaint</option>
            <option>Window</option>
          </select>
          <div>
            <label>Width: </label>
            <span id="cardWidth">416</span>
          </div>
          <div>
            <label>Height: </label>
            <span id="cardHeight">240</span>
          </div>
        </div>
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
