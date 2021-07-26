# Install package
- npm init -y
- npm i express jsonwebtoken mongoose dotenv argon2 cors config
- npm i --save-dev nodemon

# Run
- npm run server

# Using
- database: mongoose
  > https://www.npmjs.com/package/mongoose
- express: Create API
  > https://www.npmjs.com/package/express
  > https://expressjs.com/
- jsonwebtoken: JSON Web Tokens -> Authentication
  > https://www.npmjs.com/package/jsonwebtoken
- dotenv: Loads environment variables from a .env
  > https://www.npmjs.com/package/dotenv
- argon2: Hash password
  > https://www.npmjs.com/package/argon2
- cors: Enable CORS
  > https://www.npmjs.com/package/cors
- config: Handle config
  > https://www.npmjs.com/package/config
- nodemon: Run server when change file
  > https://www.npmjs.com/package/nodemon

# Test API
  ## Use extention "REST Client"
  - Ref: https://marketplace.visualstudio.com/items?itemName=humao.rest-client
  - How to use: Click Send Request in file request.http

  ## Use postman -> Example request
  - Register:
    ```
    POST: http://localhost:3003/api/user/register
    BODY - raw - json
    {
      "name": "admin",
      "email": "admin@admin.com",
      "password": "admin123456"
    }
    ```
  - Login:
    ```
    POST: http://localhost:3003/api/auth/login
    BODY - raw - json
    {
      "email": "admin@admin.com",
      "password": "YWRtaW4xMjM0NTY="
    }
    ```
# Example file .env
  ```
  PORT=3003
  ACCESS_TOKEN_SECRET=eyJleHBfbGVld2F5IjozMCwiZXhwIjoxNjIyMTk5MDMxLCJuYmZfbGVld2F
  REFRESH_TOKEN_SECRET=5IjozMCwibmJmIjoxNjIyMTk3MjMxLCJhdXRoX3ZhbGlkYXRlZCI6dHJ1Za
  ACCESS_TOKEN_EXPIRES=60s
  REFRESH_TOKEN_EXPIRES=1h
  ```