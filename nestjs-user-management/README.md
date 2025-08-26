# 🚀 NestJS + Prisma + PostgreSQL Setup Guide

## 📁 File Generation Steps

1. nest g module <module_name> --no-spec

2. nest g controller <controller_name> --no-spec

3. nest g service <service_name> --no-spec


# prisma setup for postgress sql setup

1. Initialize Prisma

    npx prisma init - This command creates a new prisma directory in root with the following file `schema.prisma` (optional already added in this repo)

2. Push Schema to Database

    npm run db:push -Pushes Prisma schema to your PostgreSQL database. and This creates or updates tables based on model definitions.

3. Seed the Database

    npm run db:seed - Seeds the database with default values such as user roles (ADMIN, USER) and an initial admin user.

⚙️ Project Setup

    npm install

🚦 Compile and Run the Project
    
    Run in development mode

    - npm run start

    Run in watch mode (auto-reload on file changes)

    npm run start:dev

    Run in production mode

    npm run start:prod

# Postgress database with pgVector setup

clone repo - git clone https://github.com/abnishkumar/docker_postgres-pgadmin.git

switch to branch <pgvector>

bash ` sh run run_docker.sh`
