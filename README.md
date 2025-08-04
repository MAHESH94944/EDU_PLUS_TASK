# Store Rating Platform API

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```
2. Configure environment variables in `.env` (see `.env.example`).
3. Start the server:
   ```
   node server.js
   ```
4. (Optional) Seed initial data:
   ```
   node seeders/initialData.js
   ```

---

## API Endpoints

### Auth Endpoints (`/api/auth`)

| Method | Endpoint  | Description               | Body/Query Params                          | Auth Required |
| ------ | --------- | ------------------------- | ------------------------------------------ | ------------- |
| POST   | /register | Register a new user       | `{ name, email, password, address, role }` | No            |
| POST   | /login    | Login and get JWT token   | `{ email, password }`                      | No            |
| PUT    | /password | Update password           | `{ oldPassword, newPassword }`             | Yes           |
| POST   | /logout   | Logout (client-side only) |                                            | Yes           |

---

### Admin Endpoints (`/api/admin`)

**All endpoints require:** `Authorization: Bearer <admin_token>`

| Method | Endpoint   | Description                       | Body/Query Params                           |
| ------ | ---------- | --------------------------------- | ------------------------------------------- |
| POST   | /users     | Create a new user (any role)      | `{ name, email, password, address, role }`  |
| GET    | /users     | List users (filters, pagination)  | `name`, `email`, `role`, `page`, `limit`    |
| GET    | /users/:id | Get user details                  |                                             |
| POST   | /stores    | Create a new store                | `{ name, email, address, ownerId }`         |
| GET    | /stores    | List stores (filters, pagination) | `name`, `email`, `address`, `page`, `limit` |
| GET    | /dashboard | Get dashboard stats               |                                             |

---

### User Endpoints (`/api/user`)

**All endpoints require:** `Authorization: Bearer <user_token>`

| Method | Endpoint         | Description                      | Body/Query Params  |
| ------ | ---------------- | -------------------------------- | ------------------ |
| GET    | /stores          | List all stores with ratings     |                    |
| POST   | /stores/:id/rate | Submit/update rating for a store | `{ rating }`       |
| GET    | /stores/search   | Search stores by name/address    | `q` (search query) |

---

### Store Owner Endpoints (`/api/store-owner`)

**All endpoints require:** `Authorization: Bearer <owner_token>`

| Method | Endpoint | Description                        | Body/Query Params |
| ------ | -------- | ---------------------------------- | ----------------- |
| GET    | /ratings | List users who rated owner's store |                   |
| GET    | /stats   | Get average rating and stats       |                   |

---

## How to Use in Postman

1. **Register a User**

   - Method: POST
   - URL: `http://localhost:3000/api/auth/register`
   - Body (JSON):
     ```json
     {
       "name": "Your Name With At Least 20 Characters",
       "email": "your@email.com",
       "password": "Password@123",
       "address": "Your Address",
       "role": "user"
     }
     ```

2. **Login**

   - Method: POST
   - URL: `http://localhost:3000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "your@email.com",
       "password": "Password@123"
     }
     ```
   - Response will include a `token`.

3. **Set Authorization Header**

   - For all protected routes, add header:
     ```
     Authorization: Bearer <your_token>
     ```

4. **Admin: Create User**

   - Method: POST
   - URL: `http://localhost:3000/api/admin/users`
   - Body (JSON):
     ```json
     {
       "name": "Admin Created User Name",
       "email": "newuser@email.com",
       "password": "NewUser@123",
       "address": "Address",
       "role": "user"
     }
     ```

5. **Admin: Create Store**

   - Method: POST
   - URL: `http://localhost:3000/api/admin/stores`
   - Body (JSON):
     ```json
     {
       "name": "Store Name",
       "email": "store@email.com",
       "address": "Store Address",
       "ownerId": 3
     }
     ```

6. **User: Rate a Store**

   - Method: POST
   - URL: `http://localhost:3000/api/user/stores/1/rate`
   - Body (JSON):
     ```json
     {
       "rating": 5
     }
     ```

7. **User: Search Stores**

   - Method: GET
   - URL: `http://localhost:3000/api/user/stores/search?q=Alpha`

8. **Store Owner: Get Ratings**

   - Method: GET
   - URL: `http://localhost:3000/api/store-owner/ratings`

9. **Store Owner: Get Stats**
   - Method: GET
   - URL: `http://localhost:3000/api/store-owner/stats`

---

## How to Use in Frontend

- **Authentication:**

  - Register and login using `/api/auth/register` and `/api/auth/login`.
  - Store the JWT token in localStorage or a state manager.
  - Send the token in the `Authorization` header for all protected requests.

- **Role-based UI:**

  - Use the `role` field from the login response to show/hide admin, user, or owner features.

- **Forms:**

  - Validate all fields according to backend requirements (see `/src/utils/validators.js`).

- **API Calls:**

  - Use `fetch` or `axios` to call endpoints.
  - Always include the JWT token in the `Authorization` header for protected routes.

- **Pagination & Filtering:**
  - Pass query parameters for pagination and filtering (e.g., `/api/admin/users?page=1&limit=10&name=John`).

---

## Notes

- All responses are standardized (see `/src/utils/response.js`).
- Error handling is consistent across all endpoints.
- See `.env.example` for required environment variables.
- Use the seed script for demo/test data: `node seeders/initialData.js`.

---

# How to Login as Admin

1. **Register an Admin User (if not seeded):**

   - Use Postman or frontend registration form.
   - Set `role` to `"admin"` in the registration request.

   Example POST request to `/api/auth/register`:

   ```json
   {
     "name": "Administrator User Example Name",
     "email": "admin@example.com",
     "password": "Admin@1234",
     "address": "123 Admin Street, City, Country",
     "role": "admin"
   }
   ```

2. **Login as Admin:**

   - Go to the login page in your frontend (`/login`).
   - Enter the admin email and password (e.g., `admin@example.com` / `Admin@1234`).
   - On successful login, you will be redirected to `/admin/dashboard`.

3. **If you used the seed script:**

   - The seeded admin user is:
     - **Email:** `admin@example.com`
     - **Password:** `Admin@1234`
   - Use these credentials to login as admin.

4. **After login:**
   - You will have access to all admin routes and features in the dashboard.

---
