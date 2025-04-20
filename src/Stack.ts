import Card from "./Card";
import CardSize from "./CardSize";

class Stack {
  name: string = "";
  cards: Card[] = [];
  copyBg = false;
  openNew = false;
  script = "";
  size: CardSize = CardSize.Large;

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
