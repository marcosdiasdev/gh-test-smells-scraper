import {GetResponseTypeFromEndpointMethod} from '@octokit/types';
import client from './client';

const repo = {
  owner: process.env.REPO?.split('/')[0] as string,
  repo: process.env.REPO?.split('/')[1] as string,
};

const startPage = Number(process.env.START_PAGE || 1);

/**
 *
 * Get an array of promises for commits with changes in tests files
 */
const getPromisesForCommitsWithTests = async (page: number) => {
  const commitsList = (
    await client.rest.repos.listCommits({
      ...repo,
      per_page: Number(process.env.PER_PAGE),
      page,
    })
  ).data;

  const commitsData = await Promise.all(
    commitsList.map(async c => {
      return (
        await client.rest.repos.getCommit({
          ...repo,
          ref: c.sha,
        })
      ).data;
    })
  );

  const commitsWithTests = commitsData.filter(c =>
    c.files?.some(f => f.filename?.endsWith('Test.java'))
  );

  if (!!process.env.DEBUG) {
    console.log(
      `Page: ${page} - Total commits: ${commitsData.length} - With tests: ${commitsWithTests.length}`
    );
  }

  return commitsWithTests;
};

export const getCommitsWithTests = async () => {
  return (
    await Promise.all(
      [...Array(Number(process.env.PAGES))].map(async (_i, pageCounter) => [
        ...(await getPromisesForCommitsWithTests(startPage + pageCounter)),
      ])
    )
  ).flat();
};

export const parseCommitData = (
  commit: GetResponseTypeFromEndpointMethod<
    typeof client.rest.repos.getCommit
  >['data']
) => {
  return (
    commit.files?.map(f => ({
      date: commit.commit.author?.date,
      authorEmail: commit.commit.author?.email,
      committerEmail: commit.commit.committer?.email,
      url: commit.html_url,
      fileName: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
    })) || []
  );
};
