import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import pLimit from 'p-limit';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const file = JSON.parse(fs.readFileSync('./courses.json', 'utf8'));
const courses = file['courses'];

const limit = pLimit(5);

function parsePrereqs(prereqText) {
  if (!prereqText) return [];

  let text = prereqText
    .replace(/^Undergraduate Prerequisites:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const prereqs = [];
  const courseRegex = /\b[A-Z]{2,4}\s?[A-Z]?\d{3}[A-Z]?\b/g;
  const courseMatches = text.match(courseRegex);

  if (courseMatches) {
    for (const match of courseMatches) {
      prereqs.push({ type: "course", code: match.replace(/\s+/g, "") });
    }
  }

  const exampleMatch = text.match(/e\.g\.,?\s*(.*)/i);
  if (exampleMatch) {
    prereqs.push({ type: "example", description: exampleMatch[1].trim() });
  }

  const cleanedText = text
    .replace(courseRegex, "")
    .replace(/e\.g\.,?.*/i, "")
    .replace(/\(\s*\)/g, "")
    .replace(/[()]/g, "")
    .trim();

  if (cleanedText) {
    prereqs.push({ type: "requirement", description: cleanedText });
  }

  return prereqs;
}

async function processCourse(key, course) {
  try {

    const prereqsParsed = parsePrereqs(course.prereqtext);

    const { error } = await supabase.from('courses').upsert(
      {
        code: key,
        title: course.name,
        description: course.description,
        embedding,
        units: course.units,
        prereqs: prereqsParsed, // ✅ JSON array stored directly
        offered: course.offered,
      },
      { onConflict: 'code' }
    );

    if (error) throw error;
    console.log(`✅ Inserted ${key}`);
  } catch (err) {
    console.error(`❌ Failed for ${key}:`, err.message);
  }
}

async function main() {
  const tasks = Object.entries(courses).map(([key, course]) =>
    limit(() => processCourse(key, course))
  );
  await Promise.allSettled(tasks);
  console.log('✅ All courses processed');
}

main();