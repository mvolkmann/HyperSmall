import {Database} from 'bun:sqlite';
import {type Context, Hono} from 'hono';
import {serveStatic} from 'hono/bun';
import {logger} from 'hono/logger';

import Button from './Button';
import ButtonStyle from './ButtonStyle';
import CardSize from './CardSize';
import Stack from './Stack';

const buttonMap = new Map<number, Button>();

//TODO: Store these in the stack database so
//TODO: they aren't reset when the server is restarted.
let lastButtonId = 0;
let lastFieldId = 0;

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

function enumValue(anEnum: unknown, key: unknown) {
  // @ts-ignore
  for (const [k, v] of Object.entries(anEnum)) {
    if (k === key) return v;
  }
  return null;
}

// Log all HTTP requests to the terminal where the server is running.
app.use('/*', logger());

// This serves static files from the public directory.
app.use('/*', serveStatic({root: './public'}));

app.get('/button-contents/:id', async (c: Context) => {
  const id = Number(c.req.param('id'));
  const button = buttonMap.get(id);
  if (!button) return c.body(null, 404); // Not Found

  const trigger = {'button-contents-dialog': {id}};
  c.header('HX-Trigger', JSON.stringify(trigger));

  return c.html(
    <dialog
      class="dialog-with-title-bar button-contents-dialog"
      id={`button-contents-dialog-${id}`}
    >
      <basic-title-bar>Button Contents</basic-title-bar>
      <form hx-post={`/button-contents/${id}`}>
        <label>Contents of card button {id}</label>
        <textarea name="contents">{button.contents}</textarea>
        <div class="row gap4">
          <button class="defaultButton">OK</button>
          <button onclick="closeDialog(this, true)" type="button">
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
});

app.post('/button-contents/:id', async (c: Context) => {
  const id = Number(c.req.param('id'));
  const button = buttonMap.get(id);
  if (!button) return c.body(null, 404); // Not Found

  const formData = await c.req.formData();
  const contents = formData.get('contents') as string;
  console.log('index.tsx: contents =', contents);
  button.contents = contents;

  //TODO: Update the contents of the button in the database.

  const trigger = {'button-contents': {id}};
  c.header('HX-Trigger', JSON.stringify(trigger));
  return c.body(null, 204);
});

app.get('/button-info/:id', (c: Context) => {
  const id = Number(c.req.param('id'));
  const button = buttonMap.get(id);
  if (!button) {
    return c.body(null, 404); // Not Found
  }

  // This is a workaround that enables
  // using attribute names that contain colons.
  const formAttributes = {
    'hx-on:htmx:after-request': 'closeDialog(this, true)'
  };
  c.header('HX-Trigger', 'button-info-dialog');
  return c.html(
    <dialog class="dialog-with-title-bar" id="button-info-dialog">
      <basic-title-bar>Button Info</basic-title-bar>
      <form hx-post="/button-info" {...formAttributes}>
        <div class="row gap1">
          <label class="mb1" for="cardSize">
            Button Name:
          </label>
          <input
            autofocus
            id="buttonName"
            name="buttonName"
            required
            value={button.name}
          />
        </div>

        <div class="row-align-start gap2">
          <div class="column gap2">
            <div class="row">
              <label>Card button number:</label>
            </div>
            <div class="row">
              <label>Card part number:</label>
            </div>
            <div class="row">
              <label>Card button ID:</label>
              <input
                id="cardButtonId"
                name="cardButtonId"
                class="value"
                readonly
                value={button.id}
              ></input>
            </div>
          </div>
          <div class="column gap2">
            <div class="row">
              <label>Style:</label>
              <select id="style" name="style">
                {Object.keys(ButtonStyle).map(key => {
                  const value = enumValue(ButtonStyle, key);
                  const attributes =
                    button.style === value ? {selected: true} : {};
                  return <option {...attributes}>{value}</option>;
                })}
              </select>
            </div>
            <div class="row">
              <label>Family:</label>
              <select id="family" name="family">
                <option>None</option>
                {Array.from({length: 15}).map((_, i) => (
                  <option>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="column">
            <div class="row">
              <input
                type="checkbox"
                id="showName"
                name="showName"
                checked={button.showName}
              />
              <label for="showName">Show name</label>
            </div>
            <div class="row">
              <input
                type="checkbox"
                id="authHilite"
                name="authHilite"
                checked={button.autoHilite}
              />
              <label for="autoHilite">Auto Hilite</label>
            </div>
            <div class="row">
              <input
                type="checkbox"
                id="enabled"
                name="enabled"
                checked={button.enabled}
              />
              <label for="enabled">Enabled</label>
            </div>
          </div>
        </div>

        <div class="row gap4">
          <div class="grid-3-columns gap2">
            <button type="button">Text Style...</button>
            <button type="button">Icon...</button>
            <button type="button">LinkTo...</button>
            <button
              hx-get={`/script/${id}`}
              hx-target="main"
              hx-swap="beforeend"
              type="button"
            >
              Script...
            </button>
            <button
              hx-get={`/button-contents/${id}`}
              hx-target="main"
              hx-swap="beforeend"
              type="button"
            >
              Contents...
            </button>
            <button type="button">Tasks...</button>
          </div>
          <div class="column gap2">
            <button class="defaultButton">OK</button>
            <button onclick="closeDialog(this, true)" type="button">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
});

app.post('/button-info', async (c: Context) => {
  const formData = await c.req.formData();
  const buttonName = formData.get('buttonName') as string;
  const cardButtonId = formData.get('cardButtonId');
  const family = formData.get('family');

  const button = buttonMap.get(Number(cardButtonId));
  if (!button) return c.body(null, 404); // Not Found

  button.name = buttonName;
  button.autoHilite = formData.get('autoHilite') === 'on';
  button.enabled = formData.get('enabled') === 'on';
  button.family = Number(family);
  button.showName = formData.get('showName') === 'on';
  const style = (formData.get('style') as string).replace(/ /g, '');
  button.style = ButtonStyle[style as keyof typeof ButtonStyle];

  // TODO: Update the button in the database.

  const trigger = {'button-info': button};
  c.header('HX-Trigger', JSON.stringify(trigger));
  return c.body(null, 204); // No Content
});

app.get('/new-button', (c: Context) => {
  // TODO: Add a button to the current stack in the database.

  lastButtonId += 1;
  const button = new Button(lastButtonId);
  buttonMap.set(button.id, button);

  const trigger = {'new-button': {buttonId: lastButtonId}};
  c.header('HX-Trigger', JSON.stringify(trigger));
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

app.get('/script/:id', async (c: Context) => {
  const id = Number(c.req.param('id'));
  const button = buttonMap.get(id);
  if (!button) return c.body(null, 404); // Not Found

  const trigger = {'script-dialog': {id}};
  c.header('HX-Trigger', JSON.stringify(trigger));

  return c.html(
    <dialog
      class="dialog-with-title-bar script-dialog"
      id={`script-dialog-${id}`}
    >
      <fancy-title-bar>Script of card button id {id}</fancy-title-bar>
      {/*
      TODO: Submit this form on cmd-s.
      TODO: Warn if closing dialog without saving.
      TODO: Add a Save button?
      */}
      <form hx-post={`/script/${id}`}>
        <div class="top">
          <div class="row gap2">
            <div class="column gap2">
              <div class="row">
                <label>Scripting language:</label>
                <select>
                  <option>HyperTalk</option>
                  <option>AppleScript</option>
                </select>
              </div>
              <div class="row">
                <label>Length:</label>
                <div id="length">0</div>
              </div>
            </div>
            <div class="column">
              <div class="row">
                <label>Handlers:</label>
                <select></select>
              </div>
              <div class="row">
                <label>Functions:</label>
                <select></select>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <textarea name="script">{button.script}</textarea>
        </div>
      </form>
    </dialog>
  );
});

app.post('/script/:id', async (c: Context) => {
  const id = Number(c.req.param('id'));
  //TODO: Also handle fields.
  const button = buttonMap.get(id);
  if (!button) return c.body(null, 404); // Not Found

  const formData = await c.req.formData();
  const script = formData.get('script') as string;
  button.script = script;

  //TODO: Update the script of the button in the database.

  return c.body(null, 204);
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
        <fancy-title-bar>{stackName}</fancy-title-bar>
        <section></section>
      </dialog>
    );
  } else {
    c.header('HX-Trigger', 'replace-stack');
    return c.body(null, 204); // No Content
  }
});

export default app;
