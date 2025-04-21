import Container from './Container';
import FieldStyle from './FieldStyle';
import TextStyle from './TextStyle';

class Field extends Container {
  autoSelect = false;
  autoTab = false;
  doNotSearch = false;
  doNotWrap = false;
  fieldStyle: FieldStyle = FieldStyle.Rectangle;
  fixedLineHeight = false;
  lockText = false;
  multipleLines = false;
  showLines = false;
  wideMargins = false;

  toHTML(): string {
    return `<textarea></textarea>`;
  }
}

export default Field;
