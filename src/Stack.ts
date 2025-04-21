import Card from './Card';
import CardSize from './CardSize';

class Stack {
  cards: Card[] = [];
  cardSize: CardSize = CardSize.Large;
  copyBg = false;
  id = 0;
  name: string = '';
  openNew = false;
  script = '';

  constructor(name: string) {
    this.name = name;
  }

  addCard(card: Card) {
    this.cards.push(card);
  }

  deleteCard(card: Card) {
    this.cards.splice(this.cards.indexOf(card), 1);
  }
}

export default Stack;
