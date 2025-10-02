import { storage } from "./storage";

async function seed() {
  try {
    console.log("Seeding database...");

    // Check if super admin already exists
    const existingAdmin = await storage.getUserByUsername("admin");

    if (!existingAdmin) {
      // Create super admin
      await storage.createUser({
        username: "admin",
        password: "admin123",
        role: "superadmin",
        fullName: "System Administrator",
        email: "admin@system.com",
        phone: null,
        isActive: true,
      });
      console.log("✓ Super admin created (username: admin, password: admin123)");
    } else {
      console.log("✓ Super admin already exists");
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
