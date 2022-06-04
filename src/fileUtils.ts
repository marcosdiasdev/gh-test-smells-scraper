import {GetResponseTypeFromEndpointMethod} from '@octokit/types';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import client from './client';

/**
 *
 * Create a JSON file with the commit data
 */
export const createJSONFile = (
  commit: GetResponseTypeFromEndpointMethod<
    typeof client.rest.repos.getCommit
  >['data']
) => {
  ensureOutputsFolder();
  const jsonFilename = `output/${dateToNumericString(
    commit.commit.author?.date
  )}-${commit.sha}.json`;
  fs.writeFileSync(jsonFilename, JSON.stringify(commit));
  if (!!process.env.DEBUG) {
    console.log(`Created ${__dirname + '/' + jsonFilename}`);
  }
};

/**
 *
 * Create a CSV file with commit data and JNose results
 */
export const createCSVFile = (
  workbook: XLSX.WorkBook,
  commit: GetResponseTypeFromEndpointMethod<
    typeof client.rest.repos.getCommit
  >['data']
) => {
  ensureOutputsFolder();
  const xlsxFilename = `output/${dateToNumericString(
    commit.commit.author?.date
  )}-${commit.sha}.xlsx`;
  const xlsxBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'buffer',
  });
  fs.writeFileSync(xlsxFilename, xlsxBuffer);
  if (!!process.env.DEBUG) {
    console.log(`Created ${__dirname + '/' + xlsxFilename}`);
  }
};

/**
 *
 * Check if a given commit has an equivalent test smells CSV file
 */
export const hasTestSmellsFile = (sha: string) => {
  const csvFilename = `csv/${sha}_testSmells.csv`;
  return fs.existsSync(csvFilename);
};

/**
 *
 * Get CSV test smells files content as a workbook
 */
export const getTestSmellsWorkbook = (sha: string): XLSX.WorkBook => {
  const csvFilename = `csv/${sha}_testSmells.csv`;
  return XLSX.readFile(csvFilename);
};

/**
 *
 * Create output folder if not exists
 */
const ensureOutputsFolder = () => {
  if (!fs.existsSync('output/')) {
    fs.mkdirSync('output');
  }
};

export const dateToNumericString = (date?: string) =>
  date?.replace(/([A-Z])|([:-])/g, '');
