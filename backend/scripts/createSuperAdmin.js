#!/usr/bin/env node
// Interactive CLI to create the first super admin account.
// Run: npm run create:superadmin
// Requires SUPER_ADMIN_SECRET in .env as an access gate.

require("dotenv").config();
const bcrypt = require("bcrypt");
const readline = require("readline");
const prisma = require("../config/dbConnect");

const SALT_ROUNDS = 12;

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

function askHidden(query) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(query);
    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");

    let value = "";

    function onData(char) {
      char = char.toString();

      if (char === "\n" || char === "\r" || char === "") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        stdout.write("\n");
        resolve(value);
      } else if (char === "") {
        process.exit();
      } else if (char === "") {
        if (value.length > 0) value = value.slice(0, -1);
      } else {
        value += char;
      }
    }

    stdin.on("data", onData);
  });
}

async function verifySuperAdminAccess() {
  const expected = process.env.SUPER_ADMIN_SECRET;

  if (!expected) {
    console.error("❌ SUPER_ADMIN_SECRET not configured in .env file");
    process.exit(1);
  }

  const entered = await askHidden("Enter super admin secret: ");

  if (entered.trim() !== expected.trim()) {
    console.error("❌ Invalid secret");
    process.exit(1);
  }

  console.log("✅ Secret verified");
}

async function main() {
  try {
    console.log("=== Create Super Admin Account ===\n");

    await verifySuperAdminAccess();

    const name     = await ask("Name: ");
    const userName = await ask("Username: ");
    const email    = await ask("Email (optional, press enter to skip): ");
    const phone    = await ask("Phone (optional, press enter to skip): ");
    const password = await askHidden("Password: ");

    if (!name || !userName || !password) {
      throw new Error("Name, username and password are required");
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      throw new Error(
        "Password must be at least 8 characters with 1 uppercase letter and 1 number"
      );
    }

    const userNameTaken = await prisma.user.findFirst({
      where: { userName, isDeleted: false },
    });

    if (userNameTaken) {
      throw new Error(`Username "${userName}" is already taken`);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        userName,
        password:    passwordHash,
        name,
        role:        "superAdmin",
        accessLevel: "read_write",
        email:       email || null,
        phone:       phone || null,
        active:      true,
        isDeleted:   false,
        lastLoginAt: new Date(),
      },
    });

    console.log("\n✅ Super Admin created successfully!");
    console.log("   ID:      ", user.id);
    console.log("   Username:", user.userName);
    console.log("   Name:    ", user.name);
    if (user.email) console.log("   Email:   ", user.email);
  } catch (err) {
    console.error("\n❌ Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
