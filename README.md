## Command list 

### Create folder

```
mkdir ecommerce && cd ecommerce && npm init -y
touch .gitignore
```

```
npm i typescript --save-dev
npx tsc --init
npm i @types/node --save-dev
npm i express
npm i @types/express --save-dev
npm i prisma @prisma/client
npx prisma init
npx prisma migrate dev --name CreateUserTable
```