import { type Context, Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import CardSize from "./CardSize";
import Stack from "./Stack";

const app = new Hono();

const stacks: Stack[] = [];

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
            &#x2194;
            <span id="cardWidth">416</span>
            &nbsp; &#x2195;
            <span id="cardHeight">240</span>
          </div>
        </div>
      </form>
    </>
  );
});

app.post("/stack", async (c: Context) => {
  const formData = await c.req.formData();

  const stack = new Stack(formData.get("name") as string);
  stack.copyBg = Boolean(formData.get("copyBg"));
  stack.openNew = Boolean(formData.get("openNew"));
  const cardSize = formData.get("cardSize") as string;
  stack.size = CardSize[cardSize as keyof typeof CardSize];
  console.log("index.tsx post /stack: stack =", stack);
  stacks.push(stack);

  return c.body(null, 204); // No Content
});

export default app;
