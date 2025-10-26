/**
 * scrape_map_and_store.js
 * - Reads majors.json
 * - Uses pre-scraped program links from b_links.json
 * - Attempts to fetch program pages on bu.edu
 * - Extracts requirement text and course codes
 * - Looks up hub units in Supabase `courses` table
 * - Outputs a JSON with program requirements + matched hub units and counts
 */

import dotenv from 'dotenv';
import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import slugify from 'slugify';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

// column in your courses table that contains hub units
const COURSE_HUB_COL = 'hub_units';

// URL generator heuristics for BU program pages
const collegeBasePaths = {
  CAS: 'cas',
  ENG: 'eng',
  COM: 'com',
  CFA: 'cfa',
  Questrom: 'questrom',
  SAR: 'sar',
  SHA: 'sha',
  CDS: 'cds',
  Wheelock: 'wheelock',
};

// suffix candidates to try
const SUFFIXES = ['bs', 'ba', 'bfa', 'ms', 'phd', ''];

// axios instance
const AXIOS = axios.create({
  headers: {
    'User-Agent': 'BU-scraper/1.0 (+https://example.com)',
    Accept: 'text/html,application/xhtml+xml',
  },
  timeout: 25000,
});

// course code regex
const COURSE_CODE_REGEX = /\b([A-Z]{2,6}\s?[A-Z]?\s?\d{3}[A-Z]?)\b/g;

// load majors
const majorsFile = './majors.json';
if (!fs.existsSync(majorsFile)) {
  console.error(`Create ${majorsFile} with your colleges and majors.`);
  process.exit(1);
}
const majorsData = JSON.parse(fs.readFileSync(majorsFile, 'utf8')).colleges;

// load scraped links
const linksFile = './b_links.json';
if (!fs.existsSync(linksFile)) {
  console.error(`Create ${linksFile} with your scraped program URLs first.`);
  process.exit(1);
}
const scrapedLinks = JSON.parse(fs.readFileSync(linksFile, 'utf8'));

// helper: find scraped URL for major
function findScrapedUrlForMajor(majorName) {
  const majorNormalized = majorName.replace(/\W/g, '').toLowerCase();
  for (const link of scrapedLinks) {
    const linkTextNormalized = link.text.replace(/\W/g, '').toLowerCase();
    if (linkTextNormalized.includes(majorNormalized)) return link.href;
  }
  return null;
}

// helper: generate candidate program URLs
function buildProgramUrls(collegeKey, majorName) {
  const base = collegeBasePaths[collegeKey] || collegeKey.toLowerCase();
  const slug = slugify(majorName, { lower: true, remove: /[*+~.()'"!:@]/g }).replace(/--+/g, '-');
  const candidates = SUFFIXES.flatMap((sfx) => {
    const suffixPath = sfx ? `/${sfx}/` : '/';
    return [
      `https://www.bu.edu/academics/${base}/programs/${slug}/${sfx ? `${sfx}/` : ''}`,
      `https://www.bu.edu/academics/${base}/programs/${slug}${suffixPath}`,
      `https://www.bu.edu/academics/${base}/programs/${slug}/`,
      `https://www.bu.edu/academics/${base}/programs/${slug}/bs/`,
      `https://www.bu.edu/academics/${base}/programs/${slug}/ba/`,
    ];
  });
  return [...new Set(candidates)];
}

// fetch and parse program page
async function fetchProgram(url) {
  try {
    const res = await AXIOS.get(url);
    if (res.status !== 200) return null;
    const $ = cheerio.load(res.data);

    const selectors = [
      '.program-requirements',
      '.programs-single__content',
      '.program-content',
      '#program-requirements',
      '.program-structure',
    ];

    let textBlocks = [];

    for (const sel of selectors) {
      const el = $(sel);
      if (el.length) {
        el.find('li, p, div').each((i, e) => {
          const t = $(e).text().trim();
          if (t) textBlocks.push(t);
        });
        if (textBlocks.length) break;
      }
    }

    if (!textBlocks.length) {
      $('main, .page, .content, article')
        .first()
        .find('p, li')
        .each((i, e) => {
          const t = $(e).text().trim();
          if (t && /prereq|require|credit|course|prerequis/i.test(t)) textBlocks.push(t);
        });
    }

    return textBlocks.join('\n').trim() || null;
  } catch (err) {
    return null;
  }
}

// extract course codes
function extractCourseCodes(text) {
  if (!text) return [];
  const set = new Set();
  let m;
  while ((m = COURSE_CODE_REGEX.exec(text)) !== null) {
    const normalized = m[1].replace(/\s+/g, '').toUpperCase();
    if (/\d/.test(normalized)) set.add(normalized);
  }
  return [...set];
}

// lookup hub units
async function lookupHubUnitsForCodes(codes) {
  if (!codes.length) return {};
  const codeValues = codes.map((c) => c.toUpperCase());
  const { data, error } = await supabase
    .from('courses')
    .select(`code, ${COURSE_HUB_COL}`)
    .in('code', codeValues);

  if (error) {
    console.error('Supabase lookup error:', error.message || error);
    return {};
  }

  const map = {};
  for (const row of data || []) {
    let hubs = row[COURSE_HUB_COL] || [];
    if (typeof hubs === 'string') hubs = hubs.split(',').map((s) => s.trim()).filter(Boolean);
    map[row.code.toUpperCase()] = hubs;
  }
  return map;
}

// process major
async function processMajor(collegeKey, majorName) {
  let requirementsText = null;
  let usedUrl = null;

  const scrapedUrl = findScrapedUrlForMajor(majorName);
  if (scrapedUrl) {
    const txt = await fetchProgram(scrapedUrl);
    if (txt) {
      requirementsText = txt;
      usedUrl = scrapedUrl;
    }
  }

  if (!requirementsText) {
    const candidates = buildProgramUrls(collegeKey, majorName);
    for (const u of candidates) {
      const txt = await fetchProgram(u);
      if (txt) {
        requirementsText = txt;
        usedUrl = u;
        break;
      }
    }
  }

  if (!requirementsText) {
    return {
      college: collegeKey,
      major: majorName,
      programUrl: null,
      found: false,
      note: 'Program page not found or requirements not extracted',
    };
  }

  const codes = extractCourseCodes(requirementsText);
  const hubMap = await lookupHubUnitsForCodes(codes);
  const requirements = codes.map((code) => ({
    courseCode: code,
    hubUnits: hubMap[code] || [],
  }));

  const distinctHubs = new Set();
  requirements.forEach((r) => r.hubUnits.forEach((h) => distinctHubs.add(h)));

  return {
    college: collegeKey,
    major: majorName,
    programUrl: usedUrl,
    found: true,
    rawRequirementsText: requirementsText.slice(0, 5000),
    requirements,
    hubSummary: {
      distinctHubUnits: [...distinctHubs].sort(),
      hubUnitCount: distinctHubs.size,
      totalRequiredCoursesFound: requirements.length,
    },
  };
}

// main
async function main() {
  const limit = pLimit(5);
  const tasks = [];

  for (const college of majorsData) {
    const collegeKey = college.name;
    const majors = college.majors;
    for (const majorName of majors) {
      tasks.push(limit(() => processMajor(collegeKey, majorName)));
    }
  }

  console.log(`Processing ${tasks.length} majors with concurrency 5...`);

  const results = await Promise.allSettled(tasks);

  const out = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return { error: r.reason?.message || r.reason, index: i };
  });

  fs.writeFileSync('bu_majors_with_requirements.json', JSON.stringify(out, null, 2), 'utf8');
  console.log('Saved output to bu_majors_with_requirements.json');
}

main().catch((err) => {
  console.error('Fatal error', err);
  process.exit(1);
});