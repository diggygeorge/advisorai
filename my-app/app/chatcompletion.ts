// File: recommendCourses.ts

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

interface Requirement {
  courseCode: string;
  courseName: string;
  hubUnits?: string[];
  status?: "Missing" | "Completed";
  [key: string]: any; // fallback for extra fields
}

interface MajorEntry {
  college: string;
  major: string;
  programUrl?: string;
  requirements: Requirement[];
  [key: string]: any; // fallback for extra fields
}

// Load majors + requirements JSON
const majorsFile = path.join(__dirname, "majors_with_requirements.json");
if (!fs.existsSync(majorsFile)) {
  console.error("❌ majors_with_requirements.json not found!");
  process.exit(1);
}
const majorsData = JSON.parse(fs.readFileSync(majorsFile, "utf8"));

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define the user's major/career
const career = "Mathematics and Computer Science";

async function recommendCourses() {
  // Step 0: Find major requirements
  const majorEntry = majorsData.find((m: MajorEntry) =>
    m.major.toLowerCase().includes(career.toLowerCase())
  );

  if (!majorEntry) {
    console.warn(`⚠️ No major requirements found for: ${career}`);
  } else {
    console.log("📘 Program requirements for major:", majorEntry.major);
  }

  // Step 1: Identify missing Hub units (assuming you have buCoursesHub data)
  const missingUnits = majorEntry
    ? majorEntry.requirements
        .filter((c: Requirement) => c.status === "Missing") // adapt your data
        .flatMap((c: Requirement) => c.hubUnits || [])
    : [];

  console.log("📘 Missing Hub Units:", missingUnits);

  if (!missingUnits.length) {
    console.log("✅ No missing Hub units detected. All set!");
    return;
  }

  // Step 2: Create a query text for embedding search
  const queryText = `Boston University courses suitable for a student majoring in ${career} that fulfill the following BU Hub units: ${missingUnits.join(
    ", "
  )}.`;

  // Step 3: Generate an embedding for the query
  const embeddingResponse = await client.embeddings.create({
    model: "text-embedding-3-large",
    input: queryText,
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  // Step 4: Query Supabase for similar embeddings
  const { data: matches, error } = await supabase.rpc("match_courses", {
    query_embedding: queryEmbedding,
    match_threshold: 0.75,
    match_count: 10,
  });

  if (error) {
    console.error("❌ Error matching courses:", error);
    return;
  }

  // Step 5: Use OpenAI to reason about the matches
  const systemPrompt = `
You are an academic advisor specializing in Boston University's Hub program.

Student background:
- Career focus: ${career}
- Missing Hub Units: ${missingUnits.join(", ")}

You have access to program requirements:
${majorEntry ? JSON.stringify(majorEntry.requirements, null, 2) : "N/A"}

Your task:
- Filter and rank courses from Supabase vector search.
- Prefer courses that make sense for a ${career} track.
- Return results in JSON like:

[
  {
    "courseCode": "CAS CS 320",
    "courseName": "Concepts of Programming Languages",
    "hubUnits": ["CRT", "QR2"],
    "reason": "Relevant to Computer Science and fulfills QR2."
  },
  ...
]
`;

  const userPrompt = `
Here are the course candidates from Supabase:
${JSON.stringify(matches, null, 2)}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  console.log(
    "🎯 Recommended Courses:\n",
    completion.choices[0].message.content
  );
}

recommendCourses();