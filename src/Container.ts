import TextStyle from './TextStyle';

class Container {
  height = 480;
  id = 0;
  name = '';
  script = '';
  textStyle = new TextStyle();
  width = 640;

  constructor(id: number) {
    this.id = id;
  }
}

export default Container;
