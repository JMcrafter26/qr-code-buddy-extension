import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const project = encodeURIComponent('clearurls/rules');
const commitResponse = await fetch(
  `https://gitlab.com/api/v4/projects/${project}/repository/commits/master?per_page=1`,
);
if (!commitResponse.ok) {
  throw new Error(
    `Failed to find the latest ClearURLs commit: ${commitResponse.status} ${commitResponse.statusText}`,
  );
}

const commit = await commitResponse.json();
const rulesResponse = await fetch(
  `https://gitlab.com/ClearURLs/rules/-/raw/${commit.id}/data.min.json`,
);
if (!rulesResponse.ok) {
  throw new Error(
    `Failed to fetch ClearURLs rules: ${rulesResponse.status} ${rulesResponse.statusText}`,
  );
}

const body = Buffer.from(await rulesResponse.arrayBuffer());
const sha256 = createHash('sha256').update(body).digest('hex');
const converterPath = resolve('scripts/convert-clearurls-rules.mjs');
const converter = await readFile(converterPath, 'utf8');
const updatedConverter = converter
  .replace(
    /export const clearUrlsCommit\s*=\s*'[^']+';/,
    `export const clearUrlsCommit = '${commit.id}';`,
  )
  .replace(
    /export const expectedSha256\s*=\s*'[^']+';/,
    `export const expectedSha256 =
  '${sha256}';`,
  );

if (
  updatedConverter === converter &&
  (!converter.includes(`'${commit.id}'`) || !converter.includes(`'${sha256}'`))
) {
  throw new Error(`Could not update pinned values in ${converterPath}`);
}

if (updatedConverter !== converter) {
  await writeFile(converterPath, updatedConverter, 'utf8');
}
await new Promise((resolvePromise, reject) => {
  const child = spawn(
    process.execPath,
    ['scripts/convert-clearurls-rules.mjs'],
    {
      stdio: 'inherit',
    },
  );
  child.on('error', reject);
  child.on('exit', (code) => {
    if (code === 0) resolvePromise();
    else reject(new Error(`ClearURLs conversion exited with code ${code}`));
  });
});

console.log(`Updated ClearURLs rules to ${commit.id} (${sha256})`);
