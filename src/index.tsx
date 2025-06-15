import {Database} from 'bun:sqlite';
import {type Context, Hono} from 'hono';
import {serveStatic} from 'hono/bun';
import {logger} from 'hono/logger';

import CardSize from './CardSize';
import Stack from './Stack';

const db = new Database('hypersmall.db');
db.exec('PRAGMA journal_mode = WAL;');

const app = new Hono();

const deleteStackPS = db.prepare('delete from stacks where id = ?');
const getStackByIdPS = db.prepare('select * from stacks where id = ?');
const getStacksPS = db.prepare('select * from stacks');
const insertStackPS = db.prepare(
  'insert into stacks (cardSize, copyBg, name, openNew, script) values (?, ?, ?, ?, ?)'
);

let stack: Stack | undefined = undefined;

// Log all HTTP requests to the terminal where the server is running.
app.use('/*', logger());

// This serves static files from the public directory.
app.use('/*', serveStatic({root: './public'}));

app.get('/new-button', (c: Context) => {
  // TODO: Add a button to the stack in the database.
  c.header('HX-Trigger', 'new-button');
  return c.body(null, 204); // No Content
});

// Return HTML for a dialog to select a stack to open.
app.get('/open-stack', (c: Context) => {
  const stacks = getStacksPS.all() as Stack[];
  stacks.sort((a: Stack, b: Stack) => a.name.localeCompare(b.name));

  return c.html(
    <>
      <form hx-post="/select-stack" x-data="{stackId: 0}">
        <div class="column">
          <label class="mb1" for="cardSize">
            Stack Name:
          </label>
          <select
            class="mb4"
            id="id"
            name="id"
            size={7}
            x-model="stackId"
            x-on:change="onStackSelected($event)"
          >
            {stacks.map((stack: Stack) => (
              <option value={stack.id}>{stack.name}</option>
            ))}
          </select>
          <div class="row">
            <input type="checkbox" id="openNew" name="openNew" />
            <label for="openNew">Open stack in new window</label>
          </div>
        </div>
        <div class="column gap2">
          <button autofocus onclick="closeDialog(this)">
            Cancel
          </button>
          <button id="openBtn" disabled={true} onclick="closeDialog(this)">
            Open
          </button>
        </div>
      </form>
    </>
  );
});

// Make the stack with a given name be the active stack.
app.post('/select-stack', async (c: Context) => {
  const formData = await c.req.formData();
  const id = Number(formData.get('id'));
  stack = getStackByIdPS.get(id) as Stack;
  return c.body(null, stack ? 204 : 404); // No Content or Not Found
});

// Return HTML for a dialog to confirm the delete.
app.delete('/stack', (c: Context) => {
  if (!stack) return c.body(null, 404); // Not Found

  return c.html(
    <>
      <p>
        Delete all n cards in the
        <br />
        stack named "{stack.name}"?
      </p>
      <div class="gap2 right-aligned row">
        <button hx-delete={`/stack/${stack.id}`} onclick="closeDialog(this)">
          Delete
        </button>
        <button autofocus onclick="closeDialog(this)">
          Cancel
        </button>
      </div>
    </>
  );
});

// Delete the stack with a given ID from the database.
app.delete('/stack/:id', (c: Context) => {
  const id = Number(c.req.param('id'));
  const result = deleteStackPS.run(id);
  return c.body(null, result.changes > 0 ? 204 : 404); // No Content or Not Found
});

// Create a new stack using data from an HTML form..
app.post('/stack', async (c: Context) => {
  const formData = await c.req.formData();

  const stackName = formData.get('name') as string;
  const stack = new Stack(stackName);
  stack.copyBg = Boolean(formData.get('copyBg'));
  stack.openNew = Boolean(formData.get('openNew'));
  const cardSize = formData.get('cardSize') as string;
  stack.cardSize = CardSize[cardSize as keyof typeof CardSize];
  stack.script = '';

  const result = insertStackPS.run(
    stack.cardSize,
    stack.copyBg,
    stack.name,
    stack.openNew,
    stack.script
  );
  stack.id = result.lastInsertRowid as number;

  if (stack.openNew) {
    //TODO: Does this need to change now that the GET /new-stack endpoint was removed?
    const trigger = {'new-stack': {cardSize, stackName}};
    c.header('HX-Trigger', JSON.stringify(trigger));
    return c.html(
      <dialog id={'stack-' + stackName} class="stack">
        <div class="title-bar">
          <input type="checkbox" onclick="closeDialog(this)" />
          <div>{stackName}</div>
          <div>
            <button>Zoom</button>
            <button>Collapse</button>
          </div>
        </div>
        <section></section>
      </dialog>
    );
  } else {
    c.header('HX-Trigger', 'replace-stack');
    return c.body(null, 204); // No Content
  }
});

export default app;
