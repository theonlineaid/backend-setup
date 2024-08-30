### Node.js TypeScript Setup

```
mkdir ecommerce && cd ecommerce && npm init -y
mkdir src && touch .gitignore index.ts
```

#### Prisma Setup

```
npm i typescript --save-dev
npx tsc --init
npm i @types/node --save-dev
npm i express
npm i @types/express --save-dev
npm i prisma @prisma/client
npx prisma init
npx prisma migrate reset
npx prisma migrate reset --force --skip-generate
npx prisma migrate dev --name initial-setup
npx prisma migrate dev --name CreateUserTable
npx prisma migrate dev --name AddRoleToUser
npx prisma studio
npx prisma migrate dev --name CreateProductTable
npx prisma migrate dev --name AddAddressTable
npx prisma migrate dev --name AddDefaultShippingBillingAddress
npx prisma migrate dev --name CreateCartTable
npx prisma migrate dev --name CreateReviewTable
npx prisma migrate dev --name CreateReviewTable --create-only
npx prisma migrate dev // Your database is now in sync with your schema.
npx prisma migrate dev --name add_imagePath_to_reviews
npx prisma migrate dev --name update_review_rating_string
npx prisma migrate dev --name CreateOrderTable
npx prisma migrate dev --name AddFullTextSearchFeature
```

#### Enabling full-text search

[note] close all process

```
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}


npx prisma generate
```
