# Personal Calendar App

### Prerequisites

**Node version 20.x or later**

### Install packages

```shell
npm run install
```

### Setup .env.local or copy .env.local.example file inside server folder

```js
PORT=8080
NODE_ENV=development

JWT_SECRET=
JWT_EXPIRE=30d # This means it expires in 30 days
JWT_COOKIE_EXPIRE=30 # This means it expires in 30 days
RESET_PASSWORD_EXPIRATION=15 # This means it expires in 15 minute

SMTP_HOST=
SMTP_PORT=
SMTP_EMAIL=
SMTP_PASSWORD=
FROM_EMAIL=
FROM_NAME=

DATABASE_URL_DEVELOPMENT=

DATABASE_URL_PRODUCTION=

DATABASE_URL_TEST=

WHITELIST=['http://localhost:4200', 'http://localhost:8080']
```

### Start the app in development mode

```shell
npm run watch
```

### Start the app in production mode

```shell
npm run build
npm run start-server
```
