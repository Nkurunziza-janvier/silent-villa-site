# Silent Villa

Silent Villa includes a React guest site, a Node.js/Express API, and a MySQL database for room listings and booking requests.

## Requirements

- Node.js 20.19+ (or 22.12+)
- MySQL 8+

## Local setup

1. Install packages: `npm install`
2. Create the database and tables from the project root. On macOS/Linux or a Bash shell:

   ```sh
   mysql -u root -p < backend/schema.sql
   ```

   On Windows, open `backend/schema.sql` in MySQL Workbench and execute it.

3. Copy `backend/.env.example` to `.env` (`Copy-Item backend/.env.example .env` in PowerShell) and set your MySQL password, a random `JWT_SECRET` (at least 32 characters), and a secure `ADMIN_PASSWORD` (at least 12 characters). `ADMIN_EMAIL` is the initial dashboard account. The API creates that administrator on its first start; changing the environment password later does not reset an existing account.
4. Start the API in one terminal: `npm run dev:api`
5. Start the website in another terminal: `npm run dev`
6. Open `/admin` on the website and sign in with the configured admin email and password. Add rooms from the Rooms page; they then appear on `/rooms` and can be booked at `/book`.

### Reset an existing admin password

The `ADMIN_PASSWORD` setting only creates the initial admin; changing it does not update an existing password hash. To reset an existing account, set `ADMIN_EMAIL` and a new `ADMIN_PASSWORD` of at least 12 characters in a private environment with the database connection variables, then run `npm run reset:admin-password`. Never commit these values or display them on the public admin page.

The API defaults to `http://localhost:3001`, and Vite defaults to `http://localhost:5173`. Set `VITE_API_URL` if the API has another address. Booking requests are saved as pending and reserve their dates until an administrator confirms or cancels them. The dashboard polls for new bookings every 12 seconds. Browser audio must be enabled by clicking **Enable sound** once while the dashboard is open.

## API overview

- `GET /api/rooms` — active rooms
- `GET /api/gallery` — gallery photos uploaded by an administrator
- `POST /api/bookings` — guest booking request
- `POST /api/auth/login` — administrator login
- `GET /api/admin/bookings` — authenticated booking list
- `PATCH /api/admin/bookings/:id/status` — confirm, cancel, or reopen a booking
- `GET /api/admin/rooms`, `POST /api/admin/rooms` — authenticated room inventory
- `GET /api/admin/gallery`, `POST /api/admin/gallery`, `DELETE /api/admin/gallery/:id` — authenticated gallery management

Room and gallery images are uploaded to the local `uploads/` directory (JPG, PNG, or WebP; 5 MB maximum). The API creates the gallery table on startup for existing databases. For production, serve the app over HTTPS, set `CLIENT_ORIGIN` to the public site origin, use a strong private JWT secret and database credentials, and use durable object storage for uploaded images if the server filesystem is not persistent.
