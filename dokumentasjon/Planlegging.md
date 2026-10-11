# Planlegging av nettside struktur

## verktøy

- next.js
- mySql database
- noe til å lagre bilder?
- Better auth
- uploadthing for images

---

## backend

### database (noe utdatert se [db](/dokumentasjon/Database.sql) for oppdatert struktur)

user har:

- ... betterauth defaults
- allegiance
- socials
  posts har:
- id
- user_id
- title
- content
- image
- type
- created_at

comments har:

- id
- user_id
- post_id
- comment_id? // hvis det er en sub comment
- content
- created_at

post_likes har:

- user_Id
- post_Id
- created_at
  comment_likes har:
- user_id
- post_Id
- created_at

## Todo

- [x] Forum page
- [x] create post page
- [x] user page public
- [x] user page private
- [x] home page
- [x] gallery page
- [ ] legge til google som login provider?
- [ ] legge til tags og categories på posts?
- [ ] legge til search av users?
- [ ] add dislikes?
- [ ] add dm's? - kan være interessant pga at jeg må sette opp en custom node server i next (next api routes er severless) alternativt gjør det med rust for moroskyld (kan plage gudjon med å få rust til å funke på webHostingen)
- [ ] add news to db?
- [ ] admin view?

### Plassholdere i frontend

Disse er hardkodet i `app/data/placeholder.ts` fordi det ikke finnes tabeller for
dem enda. Bytt dem ut med API-kall når tabellene er laget:

- nyheter (`NEWS`) — vises på home og about
- forum kategorier (`FORUM_CATEGORIES`) — vises på forum, klikkbare med filter
- spillmoduser (`GAME_MODES`) — vises på about
- community stats (`COMMUNITY_STATS`) — hardkodede tall, ingen count-endpoint
- tag pills på tråder — tilfeldige fra `tagFor()` i forum/page.tsx

### Bugs som ble fikset underveis

- `app/api/forum/[id]/route.ts` — `params` het `postId` men mappen heter `[id]`,
  så alle parametere var `undefined`. Bruker nå `RouteContext<...>` som
  TypeScript sjekker.
- `DELETE * FROM posts` — `*` er ikke gyldig SQL.
- `app/api/forum/comments/route.ts` — skrev inn i `posts`-tabellen i stedet for
  `comments`.
- `app/api/forum/create/route.ts` — skrev til `image`, kolonnen heter `image_url`.
- `app/api/users/route.ts` — syntaksfeil: `allegiance, FROM user`.
- `globals.css` — `div { width: inherit }` gjorde at nesten alle div-ar arvet
  bredden til forelderen. Fjernet.
- Hover på en lenke overstekte `--bg`/`--surface` og malte hele siden på nytt.
  Nå tikter hover/active bare aksentfargene.

## fix

- be able to set title when creating an gallery post
- filter forum posts to not include gallery posts
- add option to link discord under profile view for user if not linked
