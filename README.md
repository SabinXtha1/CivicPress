# Ward News

Ward News is a full-stack web application built with Next.js and MongoDB. It serves as a platform for sharing news and updates within a local community or "ward." This project aims to replace the traditional method of a person going door-to-door to share notices and meeting information.

## Tech Stack

- **Frontend:**
  - [Next.js](https://nextjs.org/) - React framework for server-side rendering and static site generation.
  - [React](https://reactjs.org/) - JavaScript library for building user interfaces.
  - [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
  - [Radix UI](https://www.radix-ui.com/) - A collection of unstyled, accessible UI components.
- **Backend:**
  - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - For building serverless API endpoints.
  - [MongoDB](https://www.mongodb.com/) - NoSQL database for storing application data.
  - [Mongoose](https://mongoosejs.com/) - Object Data Modeling (ODM) library for MongoDB and Node.js.
  - [Nodemailer](https://nodemailer.com/) - For sending emails.
- **Authentication:**
  - [JSON Web Tokens (JWT)](https://jwt.io/) - For securing API routes and managing user sessions.
  - [bcryptjs](https://www.npmjs.com/package/bcryptjs) - For hashing user passwords.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) - A running instance of MongoDB.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/wardnews.git
   cd wardnews
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root of the project and add the following environment variables:

   ```bash
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   ```

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Runs the linter.

## Project Structure

```
.
├── public
├── src
│   ├── app
│   │   ├── (auth)
│   │   ├── admin
│   │   ├── api
│   │   ├── notices
│   │   ├── posts
│   │   └── users
│   ├── components
│   │   ├── forms
│   │   └── ui
│   ├── context
│   ├── hooks
│   └── lib
│       └── Schema
└── ...
```

- **`src/app`**: Contains the main application logic, including pages, API routes, and layouts.
- **`src/components`**: Contains reusable React components.
- **`src/context`**: Contains React context providers for managing global state.
- **`src/hooks`**: Contains custom React hooks.
- **`src/lib`**: Contains utility functions, database connection logic, and Mongoose schemas.