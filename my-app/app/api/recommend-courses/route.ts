import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { career, missingUnits } = await req.json();

  const systemPrompt = `
You are an academic advisor for Boston University.
Given a student's career focus: ${career}
and missing Hub units: ${missingUnits.join(', ')},
recommend courses from BU majors data to fulfill these Hub units.
Return results in JSON:
[
  {
    "courseCode": "CAS CS 320",
    "courseName": "Concepts of Programming Languages",
    "hubUnits": ["CRT", "QR2"],
    "reason": "Relevant to Computer Science and fulfills QR2."
  }
]
`;

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
    ],
    temperature: 0.7,
  });

  return NextResponse.json({ recommendations: completion.choices[0].message.content });
}