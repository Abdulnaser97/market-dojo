/**
 * Lesson Database Seeding Script
 *
 * This script populates the lessons table with initial educational content.
 * Run with: pnpm tsx scripts/seed-lessons.ts
 */

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../src/db/schema";
import { lessonSeeds } from "../src/db/seed-lessons";

async function seedLessons() {
  console.log("🌱 Starting lesson seeding...\n");

  // Connect to local D1 database
  const client = createClient({
    url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/placeholder-id-run-wrangler-d1-create.sqlite",
  });

  const db = drizzle(client, { schema });

  try {
    // Check if lessons already exist
    const existingLessons = await db.select().from(schema.lessons);

    if (existingLessons.length > 0) {
      console.log(`⚠️  Found ${existingLessons.length} existing lessons in database.`);
      console.log("   Do you want to clear and re-seed? (This script will skip for safety)");
      console.log("   To clear manually, run: pnpm wrangler d1 execute marketdojo_db --local --command \"DELETE FROM lessons;\"\n");
      return;
    }

    // Insert all lessons
    console.log(`📚 Inserting ${lessonSeeds.length} lessons...\n`);

    for (const lesson of lessonSeeds) {
      await db.insert(schema.lessons).values({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        content: lesson.content,
        category: lesson.category,
        order: lesson.order,
        difficulty: lesson.difficulty,
        imageUrl: lesson.imageUrl,
      });

      console.log(`   ✅ Inserted: ${lesson.title} (${lesson.category}, difficulty: ${lesson.difficulty})`);
    }

    console.log("\n✨ Seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   Total lessons: ${lessonSeeds.length}`);
    console.log(`   Categories: Basics (2), Patterns (4)`);
    console.log(`   Difficulty range: 1-3`);

    // Verify the data
    const verifyCount = await db.select().from(schema.lessons);
    console.log(`\n✓ Verified: ${verifyCount.length} lessons in database`);

  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    throw error;
  } finally {
    client.close();
  }
}

// Run the seeding function
seedLessons()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
