create table stacks(
  id integer primary key autoincrement,
  cardSize numeric,
  copyBg numeric, -- Boolean
  name string,
  openNew numeric, -- Boolean
  script string,
);

create table buttons {
  id integer primary key autoincrement,
  autoHilite numeric, -- Boolean
  contents string, -- only used when style is Popup
  enabled numeric, -- Boolean
  family numeric, -- only used when style is RadioButton
  iconId numeric,
  showName numeric, -- Boolean
  style integer,
  foreign key (cardId) references cards (id),
  foreign key (iconId) references icons (id)
}

create table cards(
  id integer primary key autoincrement,
  height: numeric,
  isBackground numeric, -- boolean
  name string,
  script string,
  width: numeric,
  foreign key (backgroundId) references card (id) -- only used when background is false
  foreign key (stackId) references stacks (id)
  foreign key (textStyleId) references textStyles (id)
);

create table fields(
  id integer primary key autoincrement,
  autoSelect numeric, -- boolean
  autoTab numeric, -- boolean
  doNotSearch numeric, -- boolean
  doNotWrap numeric, -- boolean
  height: numeric,
  name string,
  script string,
  width: numeric,
  foreign key (backgroundId) references card (id) -- only used when background is false
  foreign key (stackId) references stacks (id)
  foreign key (textStyleId) references textStyles (id)
);

create table TextStyle {
  id integer primary key autoincrement,
  align: string, -- left, center, or right
  bold numeric, -- Boolean
  fontFamily string,
  fontSize integer,
  italic numeric, -- Boolean
  outline numeric, -- Boolean
  shadow numeric, -- Boolean
  underline numeric, -- Boolean
