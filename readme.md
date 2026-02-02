## Images
<img width="1842" height="936" alt="Screenshot 2026-02-02 172908" src="https://github.com/user-attachments/assets/16516f1b-a667-41e5-ac90-12c5f7dd68cb" />
<img width="1840" height="934" alt="Screenshot 2026-02-02 172942" src="https://github.com/user-attachments/assets/b2886725-8a67-4b99-84c4-522401a9a168" />
<img width="1834" height="925" alt="Screenshot 2026-02-02 173027" src="https://github.com/user-attachments/assets/a19a51ea-9c76-4b71-915e-7d961c58fa94" />
<img width="1836" height="929" alt="Screenshot 2026-02-02 170714" src="https://github.com/user-attachments/assets/926f5fb0-6ef7-436a-b89b-9e36867ac5c1" />


## Key Features

- **AI-Powered Ticket Processing:**
  - Automatic ticket categorization.
  - Smart priority assignment.
  - Skill-based moderator matching.
  - AI-generated helpful notes for moderators.
- **Smart Moderator Assignment:**
  - Automatic matching of tickets to moderators based on their skills.
  - Fallback to admin assignment if no suitable moderator is found.
  - Skill-based routing system to ensure tickets are handled by the most qualified personnel.
- **User Management:**
  - Role-based access control (User, Moderator, Admin).
  - Skill management for moderators.
  - User authentication using JWT (JSON Web Tokens).
- **Background Processing:**
  - Event-driven architecture facilitated by Inngest for background jobs.
  - Automated email notifications.
  - Asynchronous ticket processing for improved performance.

## Technologies Used

The project is built with a modern stack, combining robust backend services with powerful AI capabilities:

- **Backend:** Node.js with Express
- **Database:** MongoDB
- **Authentication:** JWT
- **Background Jobs:** Inngest (for event-driven workflows and durable functions)
- **AI Integration:** Google Gemini API (for intelligent ticket analysis and processing)
- **Email:** Nodemailer with Mailtrap (for email testing)
- **Development:** Nodemon (for hot reloading)

## How It Works

The AI Ticket Agent operates through a streamlined process:

1.  **Ticket Creation:** A user submits a support ticket with a title and description. The system records the initial ticket.
2.  **AI Processing:** An `on-ticket-created` event is triggered via Inngest. An AI agent (powered by Google Gemini) analyzes the ticket content to generate:
    - Required skills for resolution.
    - A priority level.
    - Helpful notes for the assigned moderator.
3.  **Moderator Assignment:** The system searches for moderators with skills matching the ticket's requirements. If a match is found, the ticket is assigned; otherwise, it falls back to administrator assignment.
4.  **Notification:** An email notification containing ticket details and AI-generated notes is sent to the assigned moderator.
5.  **Resolution:** The moderator addresses the ticket and resolves it, updating the system accordingly.

## Installation & Setup

1.  **Clone the Repository:**

```bash
    git clone https://github.com/Vedant224/aiticketagent.git
    cd aiticketagent
```
  2.  **Install Dependencies:** Navigate into both `ai-ticket-assistant` and `ai-ticket-frontend` directories and install their respective dependencies:

  3.  **Environment Variables:** Create a `.env` file in the `ai-ticket-assistant` directory and configure the following:

```bash
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    MAILTRAP_SMTP_HOST=your_mailtrap_host
    MAILTRAP_SMTP_PORT=your_mailtrap_port
    MAILTRAP_SMTP_USER=your_mailtrap_user
    MAILTRAP_SMTP_PASS=your_mailtrap_password
    GEMINI_API_KEY=your_gemini_api_key
    APP_URL=http://localhost:your_frontend_port
```

4.  **Run the Application:**

    Start the backend server:

    bash
    npm run dev
    npm run inngest-dev
    1.  Access the application through your web browser at the specified `APP_URL`.
2.  Register a new user or log in with existing credentials.
3.  Submit a new support ticket with a descriptive title and detailed description.
4.  Monitor the ticket's progress as it is processed by the AI and assigned to a moderator.
5.  Admins can manage users, roles, and skills via the admin interface.

## API Endpoints


Authentication:

- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/login`: Login and receive a JWT token.

Tickets:

- `POST /api/tickets/create-ticket`: Create a new ticket.
- `GET /api/tickets/get-tickets`: Get all tickets for the logged-in user.
- `GET /api/tickets/get-ticket/:id`: Get details for a specific ticket.

Admin (Admin Only):

- `GET /api/auth/users`: Get a list of all users.
- `POST /api/auth/update-user`: Update user roles and skills.



## Troubleshooting

AI Processing Errors:

- Verify your `GEMINI_API_KEY` in the `.env` file.
- Check your Google Gemini API quota and limits.
- Validate the request format being sent to the AI API.

Email Issues:

- Verify your Mailtrap credentials and SMTP settings.
- Monitor Mailtrap's email delivery logs for any errors.
