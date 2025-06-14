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

/*
app.get("/", (c) => {
  return c.text("Hello Hono!");
});
*/

// Log all HTTP requests to the terminal where the server is running.
app.use('/*', logger());

// This serves static files from the public directory.
app.use('/*', serveStatic({root: './public'}));

// Return HTML for a dialog to edit button properties.
app.get('/button-info', (c: Context) => {
  return c.html(
    <>
      <form hx-post="/button-info">
        <div class="column">
          <div class="row">
            <label class="mb1" for="cardSize">
              Button Name:
            </label>
            <input name="buttonName" required />
          </div>
          <div class="row">
            <div class="column">
              <label>Card button number:</label>
              <label>Card part number:</label>
              <label>Card button ID:</label>
            </div>
            <div class="column">
              <label>Style:</label>
              <label>Family:</label>
            </div>
          </div>
          <div class="row">
            <div class="column">
              <div class="row">
                <input type="checkbox" id="showName" name="showName" />
                <label for="showName">Show name</label>
              </div>
              <div class="row">
                <input type="checkbox" id="authHilite" name="authHilite" />
                <label for="autoHilite">Auto Hilite</label>
              </div>
              <div class="row">
                <input type="checkbox" id="enabled" name="enabled" />
                <label for="enabled">Enabled</label>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="grid3Columns">
            <button>Text Style...</button>
            <button>Icon...</button>
            <button>LinkTo...</button>
            <button>Script...</button>
            <button>Contents...</button>
            <button>Tasks...</button>
          </div>
          <div class="column gap2">
            <button id="okBtn" disabled={true} onclick="closeDialog(this)">
              OK
            </button>
            <button autofocus onclick="closeDialog(this)">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </>
  );
});

app.get('/new-button', (c: Context) => {
  // TODO: Add a button to the stack in the database.
  c.header('HX-Trigger', 'new-button');
  return c.body(null, 204); // No Content
});

// Return HTML for a dialog to collection
// information needed to create a new stack.
app.get('/new-stack', (c: Context) => {
  return c.html(
    <>
      <form
        hx-post="/stack"
        hx-target="main"
        hx-swap="beforeend"
        id="new-stack-form"
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
            autofocus
            id="name"
            name="name"
            required
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
            <input type="checkbox" checked id="openNew" name="openNew" />
            <label for="openNew">Open stack in new window</label>
          </div>
        </div>
        <div class="border-right-dotted column gap2">
          <button autofocus onclick="closeDialog(this)">
            Cancel
          </button>
          <button id="saveBtn" onclick="newStack(this)">
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
    const trigger = {'new-stack': {cardSize, stackName}};
    c.header('HX-Trigger', JSON.stringify(trigger));
    return c.html(
      <dialog id={'dialog-' + stackName} class="stack">
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
