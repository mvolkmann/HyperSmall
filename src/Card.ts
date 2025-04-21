import Background from './Background';
import Button from './Button';
import Field from './Field';

class Card {
  private index: number = 0;
  background?: Background;
  buttons: Button[] = [];
  fields: Field[] = [];
  script = '';

  addButton(button: Button) {
    this.buttons.push(button);
  }

  addField(field: Field) {
    this.fields.push(field);
  }

  deleteButton(button: Button) {
    this.buttons.splice(this.buttons.indexOf(button), 1);
  }

  deleteField(field: Field) {
    this.fields.splice(this.fields.indexOf(field), 1);
  }

  toHTML(): string {
    return `<div></div>`;
  }
}

export default Card;
