drop table if exists stacks;
create table stacks (
  id integer primary key autoincrement,
  cardSize numeric,
  copyBg numeric, -- Boolean
  name string,
  openNew numeric, -- Boolean
  script string
);

drop table if exists cards;
create table cards (
  id integer primary key autoincrement,
  backgroundId integer, -- foreign key
  height numeric,
  isBackground numeric, -- boolean
  name string,
  script string,
  stackId integer, -- foreign key
  textStyleId integer, -- foreign key
  width numeric,
  foreign key (backgroundId) references cards (id) -- only used when background is false
  foreign key (stackId) references stacks (id)
  foreign key (textStyleId) references textStyles (id)
);

drop table if exists textStyles;
create table textStyles (
  id integer primary key autoincrement,
  align string, -- left, center, or right
  bold numeric, -- Boolean
  fontFamily string,
  fontSize integer,
  italic numeric, -- Boolean
  outline numeric, -- Boolean
  shadow numeric, -- Boolean
  underline numeric -- Boolean
);

drop table if exists buttons;
create table buttons (
  id integer primary key autoincrement,
  autoHilite numeric, -- Boolean
  cardId integer, -- foreign key
  contents string, -- only used when style is Popup
  enabled numeric, -- Boolean
  family numeric, -- only used when style is RadioButton
  iconId integer, -- foreign key
  showName numeric, -- Boolean
  style integer,
  foreign key (cardId) references cards (id),
  foreign key (iconId) references icons (id)
);

drop table if exists fields;
create table fields (
  id integer primary key autoincrement,
  autoSelect numeric, -- boolean
  autoTab numeric, -- boolean
  backgroundId integer, -- foreign key
  doNotSearch numeric, -- boolean
  doNotWrap numeric, -- boolean
  height numeric,
  name string,
  script string,
  stackId integer, -- foreign key
  textStyleId integer, -- foreign key
  width numeric,
  foreign key (backgroundId) references cards (id) -- only used when background is false
  foreign key (stackId) references stacks (id)
  foreign key (textStyleId) references textStyles (id)
);