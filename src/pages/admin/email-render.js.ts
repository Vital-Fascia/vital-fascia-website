// Browser copy of the email templates (worker/emails.ts), built at deploy time.
// The website editor (/admin) loads it so the preview next to the email wording is drawn live
// by exactly the same code that builds the real emails.
import { transformSync } from 'esbuild';
import emailsSource from '../../../worker/emails.ts?raw';
import { getContent } from '../../lib/content';

export async function GET() {
  const site = await getContent('site');
  const { code } = transformSync(emailsSource, { loader: 'ts', format: 'iife', globalName: 'VFEmails', target: 'es2019' });
  const js = `${code}\nVFEmails.businessName = ${JSON.stringify(site.businessName)};\n`;
  return new Response(js, { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } });
}
