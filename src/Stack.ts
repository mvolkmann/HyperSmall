import Card from "./Card";
import CardSize from "./CardSize";

class Stack {
  cards: Card[] = [];
  cardSize: CardSize = CardSize.Large;
  copyBg = false;
  id: number;
  name: string = "";
  openNew = false;
  script = "";

  constructor(id: number, name: string) {
    this.id = id;
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
