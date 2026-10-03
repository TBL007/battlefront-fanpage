# Planlegging av nettside struktur

## verktøy

- next.js
- mySql database
- noe til å lagre bilder?
- Better auth
- uploadthing for images

---

## backend

### database

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
