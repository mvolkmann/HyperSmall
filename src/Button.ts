import ButtonStyle from './ButtonStyle';
import Container from './Container';

class Button extends Container {
  autoHilite = false;
  contents = ''; // only used when style is Popup?
  enabled = true;
  family = 0; // only used when style is RadioButton
  icon = '';
  showName = true;
  style: ButtonStyle = ButtonStyle.RoundRect;

  constructor(id: number) {
    super(id);
    this.name = 'New Button';
  }

  toHTML(): string {
    return `<button>${this.name}</button>`;
  }
}

export default Button;
