#!/usr/bin/env node

/**
 * Auto-increment build version script
 *
 * This script reads the current version from src/version.ts,
 * increments the build number (or resets if month changed),
 * and writes the updated version back to the file.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const versionFilePath = join(__dirname, '../src/version.ts');

try {
  // Read current version file
  const content = readFileSync(versionFilePath, 'utf-8');

  // Extract current build number
  const buildNumberMatch = content.match(/const BUILD_NUMBER = (\d+);/);

  if (!buildNumberMatch) {
    console.error('❌ Could not find BUILD_NUMBER in version.ts');
    process.exit(1);
  }

  const currentBuildNumber = parseInt(buildNumberMatch[1], 10);

  // Calculate current year and month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');

  // Check if we need to reset build number (new month)
  // Extract year/month from the file if they're hardcoded
  const yearMatch = content.match(/const YEAR = (\d+);/);
  const monthMatch = content.match(/const MONTH = ['"](\d+)['"];/);

  let newBuildNumber;

  if (yearMatch && monthMatch) {
    const fileYear = parseInt(yearMatch[1], 10);
    const fileMonth = monthMatch[1];

    // If month or year changed, reset to 1, otherwise increment
    if (fileYear !== currentYear || fileMonth !== currentMonth) {
      newBuildNumber = 1;
      console.log(`🔄 New month detected (${currentYear}.${currentMonth}), resetting build number to 1`);
    } else {
      newBuildNumber = currentBuildNumber + 1;
      console.log(`✅ Incrementing build number: ${currentBuildNumber} → ${newBuildNumber}`);
    }
  } else {
    // Fallback: just increment
    newBuildNumber = currentBuildNumber + 1;
    console.log(`✅ Incrementing build number: ${currentBuildNumber} → ${newBuildNumber}`);
  }

  // Update the content - replace YEAR, MONTH, and BUILD_NUMBER
  let updatedContent = content
    .replace(/const YEAR = \d+;/, `const YEAR = ${currentYear};`)
    .replace(/const MONTH = ['"](\d+)['"];/, `const MONTH = "${currentMonth}";`)
    .replace(/const BUILD_NUMBER = \d+;/, `const BUILD_NUMBER = ${newBuildNumber};`);

  // Write back to file
  writeFileSync(versionFilePath, updatedContent, 'utf-8');

  const version = `${currentYear}.${currentMonth}.${newBuildNumber}`;
  console.log(`📦 New version: ${version}`);

} catch (error) {
  console.error('❌ Error incrementing version:', error.message);
  process.exit(1);
}
