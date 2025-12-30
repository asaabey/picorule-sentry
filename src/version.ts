/**
 * Build version information
 * Format: YYYY.MM.BUILD_NUMBER
 *
 * This file is automatically updated by scripts/increment-version.js
 * DO NOT manually edit YEAR, MONTH, or BUILD_NUMBER
 */

const YEAR = 2025;
const MONTH = "12";
const BUILD_NUMBER = 7;

export const VERSION = `${YEAR}.${MONTH}.${BUILD_NUMBER}`;
export const BUILD_DATE = new Date().toISOString();
