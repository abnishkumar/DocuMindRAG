import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    // Seed roles
    const roles = ["Admin", "Manager", "Editor", "Viewer", "User"];

    for (const role of roles) {
        await prisma.roles.upsert({
            where: { name: role },
            update: {},
            create: { name: role },
        });
    }

    console.log("Roles seeded successfully");

    // Seed admin user
    const adminEmail = "admin@example.com";
    const adminPassword = "Admin@123";

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminRole = await prisma.roles.findUnique({
        where: { name: "Admin" },
    });

    if (!adminRole) {
        throw new Error("Admin role not found! Please check role seeding.");
    }

    await prisma.users.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            phone:"9871234567",
            password_hash: hashedPassword,
            full_name: "Super Admin",
            role_id: adminRole.id,
        },
    });

    console.log("Admin user seeded successfully");
}

main()
    .catch((e) => {
        console.error("Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
