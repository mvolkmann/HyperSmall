import Button from './Button';
import Field from './Field';

class Background {
  private id: number = 0;
  buttons: Button[] = [];
  fields: Field[] = [];

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
}

export default Background;
