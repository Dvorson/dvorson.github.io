import { z } from 'astro/zod';
import servicesJson from '../data/services.json';
import cvJson from '../data/cv.json';

// Site data is hand-edited JSON. Parsing it here makes a typo or a dangling
// reference fail the build instead of silently producing a broken page.

const caseStudySchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  domain: z.string(),
  client: z.string(),
  role: z.string(),
  duration: z.string(),
  challenge: z.string(),
  approach: z.string(),
  outcomes: z.array(z.string()).min(1),
  technologies: z.array(z.string()).min(1),
  icon: z.string(),
  screenshot: z.string().nullable(),
  screenshotCaption: z.string().optional(),
  featured: z.boolean(),
  hasFullPage: z.boolean(),
}).strict();

const servicesSchema = z.object({
  caseStudies: z.array(caseStudySchema),
  metrics: z.array(z.object({ value: z.string(), label: z.string() })),
  iconPaths: z.record(z.string()),
}).strict().superRefine((data, ctx) => {
  const slugs = new Set<string>();
  for (const cs of data.caseStudies) {
    if (slugs.has(cs.slug)) {
      ctx.addIssue({ code: 'custom', message: `Duplicate case study slug "${cs.slug}"` });
    }
    slugs.add(cs.slug);
    if (!(cs.icon in data.iconPaths)) {
      ctx.addIssue({ code: 'custom', message: `Case study "${cs.slug}" uses unknown icon "${cs.icon}"` });
    }
  }
});

// "Jan 2026" or "2025"; "Present" is resolved at build time.
const monthYear = z.string().regex(/^(?:[A-Z][a-z]{2} )?\d{4}$|^Present$/);

const experienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  start: monthYear,
  end: monthYear,
  location: z.string().optional(),
  description: z.string(),
  highlights: z.array(z.string()),
  responsibilities: z.array(z.string()).optional(),
  technologies: z.string().optional(),
}).strict();

const cvSchema = z.object({
  name: z.string(),
  role: z.string(),
  location: z.string(),
  contact: z.object({ email: z.string().email(), linkedin: z.string(), website: z.string() }),
  summary: z.string(),
  expertise: z.array(z.string()),
  skillCategories: z.record(z.string()),
  skills: z.array(z.string()),
  experience: z.array(experienceSchema),
  projects: z.array(z.object({
    name: z.string(),
    role: z.string(),
    start: monthYear,
    end: monthYear,
    description: z.string(),
    highlights: z.array(z.string()),
    technologies: z.string(),
    link: z.string().optional(),
  }).strict()),
  education: z.object({ degree: z.string(), field: z.string(), institution: z.string() }),
  languages: z.array(z.object({ language: z.string(), level: z.string() })),
}).strict();

function parse<T>(schema: z.ZodType<T>, value: unknown, file: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
    throw new Error(`Invalid ${file}:\n${issues}`);
  }
  return result.data;
}

export const services = parse(servicesSchema, servicesJson, 'src/data/services.json');
export const cv = parse(cvSchema, cvJson, 'src/data/cv.json');

export type CaseStudy = z.infer<typeof caseStudySchema>;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toMonthIndex(value: string, now: Date): number {
  if (value === 'Present') return now.getUTCFullYear() * 12 + now.getUTCMonth();
  const [month, year] = value.split(' ');
  return Number(year) * 12 + MONTHS.indexOf(month);
}

/** Inclusive length of a "Mon YYYY" range, e.g. Jan 2023 – Apr 2025 → "2 years 4 months". */
export function formatDuration(start: string, end: string, now = new Date()): string {
  const months = toMonthIndex(end, now) - toMonthIndex(start, now) + 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (rest) parts.push(`${rest} month${rest > 1 ? 's' : ''}`);
  return parts.join(' ');
}
