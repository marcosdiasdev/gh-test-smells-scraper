import 'dotenv/config';
import * as XLSX from 'xlsx';
import client from './client';
import {
  createCSVFile,
  createJSONFile,
  getTestSmellsWorkbook,
  hasTestSmellsFile,
} from './fileUtils';
import {getCommitsWithTests, parseCommitData} from './repoUtils';

const exec = async () => {
  if (!!process.env.DEBUG) {
    console.log(
      `Remaining rate limit: ${await (
        await client.rest.rateLimit.get()
      ).data.rate.remaining}`
    );
  }

  const commitsWithTests = await getCommitsWithTests();

  commitsWithTests.forEach(commit => {
    if (hasTestSmellsFile(commit.sha)) {
      const testSmellsWorkbook = getTestSmellsWorkbook(commit.sha);

      /*
       * Create and append a new sheet with commit data
       */
      const commitData = parseCommitData(commit);

      const commitDataSheet = XLSX.utils.json_to_sheet(commitData);
      XLSX.utils.book_append_sheet(testSmellsWorkbook, commitDataSheet);

      createJSONFile(commit);
      createCSVFile(testSmellsWorkbook, commit);
    }
  });

  if (!!process.env.DEBUG) {
    console.log(
      `Remaining rate limit: ${await (
        await client.rest.rateLimit.get()
      ).data.rate.remaining}`
    );
  }
};

exec();
