# Zefit

Zefit is a full-stack fitness application with a focus on Cameroonian culture.

## Project Structure

-   `frontend`: A React application created with `create-react-app`.
-   `backend`: A Node.js/Express application.
-   `database`: Contains the database schema and a setup script.

## Getting Started

### Prerequisites

-   Node.js
-   npm
-   PostgreSQL

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/zefit.git
    cd zefit
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install --prefix backend
    ```

3.  **Install frontend dependencies:**
    ```bash
    npm install --prefix frontend
    ```

4.  **Install database script dependencies:**
    ```bash
    npm install --prefix database
    ```

5.  **Create a `.env` file in the `backend` directory and add the following:**
    ```
    DB_USER=your_database_user
    DB_HOST=localhost
    DB_DATABASE=zefit
    DB_PASSWORD=your_database_password
    DB_PORT=5432
    JWT_SECRET=your_jwt_secret
    ```

6.  **Set up the database:**
    ```bash
    node database/setup.js
    ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    npm start --prefix backend
    ```

2.  **Start the frontend server:**
    ```bash
    npm start --prefix frontend
    ```
