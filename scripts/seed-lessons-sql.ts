/**
 * Generate SQL file for seeding lessons
 *
 * Run with: pnpm tsx scripts/seed-lessons-sql.ts
 * This creates migrations/seed-lessons.sql which can be run with wrangler
 */

import { writeFileSync } from "fs";
import { lessonSeeds } from "../src/db/seed-lessons";

console.log("🌱 Generating SQL seed file...\n");

// Header comment
const header = `-- Seed lessons into the database
-- Run with: pnpm wrangler d1 execute marketdojo_db --local --file=migrations/seed-lessons.sql
-- Or run with: pnpm db:seed

`;

// Generate SQL INSERT statements
const statements = lessonSeeds.map((lesson, index) => {
  const escapedContent = lesson.content.replace(/'/g, "''");
  const escapedTitle = lesson.title.replace(/'/g, "''");
  const imageUrl = lesson.imageUrl ? `'${lesson.imageUrl}'` : "NULL";

  return `-- Lesson ${index + 1}: ${lesson.title}
INSERT INTO lessons (id, slug, title, content, category, \`order\`, difficulty, image_url)
VALUES ('${lesson.id}', '${lesson.slug}', '${escapedTitle}', '${escapedContent}', '${lesson.category}', ${lesson.order}, ${lesson.difficulty}, ${imageUrl});`;
});

// Combine everything
const sqlContent = header + statements.join("\n\n");

// Write to file
const outputPath = "migrations/seed-lessons.sql";
writeFileSync(outputPath, sqlContent, "utf8");

console.log(`✅ Generated ${outputPath}`);
console.log(`📚 Total lessons: ${lessonSeeds.length}`);
console.log(`\n💡 To seed the database, run:`);
console.log(`   pnpm wrangler d1 execute marketdojo_db --local --file=migrations/seed-lessons.sql`);
console.log(`\n✨ Done!`);
