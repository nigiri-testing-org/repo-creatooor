import { GithubApi } from './api/github-api';
import { ALLOWED_CODE_OWNERS } from './types/github';
import { getEnvVariable, getEnvVariableOrEmpty } from './utils/env';
import { RepoCheckers } from './utils/repo-checkers';
import { RepoUtils } from './utils/repo-utils';

const createRepo = async () => {
  const token = getEnvVariable('GH_TOKEN');
  const githubApi = new GithubApi(token);
  const owner = getEnvVariable('GH_OWNER');
  const repoUtils = new RepoUtils(githubApi);
  const repo = getEnvVariable('GH_REPO_NAME').replace(/ /g, '-');
  const admin = getEnvVariable('GH_USER_CREATOR');
  const codeowner = getEnvVariableOrEmpty('GH_CODEOWNER');
  const templateOwner = getEnvVariableOrEmpty('GH_TEMPLATE_OWNER');
  const templateRepo = getEnvVariableOrEmpty('GH_TEMPLATE_REPO');
  const repoCheckers = new RepoCheckers(githubApi, owner, repo, templateOwner, templateRepo, admin);

  if (codeowner != '' && ALLOWED_CODE_OWNERS.indexOf(codeowner) == -1) {
    throw Error(`Codeowner '${codeowner}' is not allowed!`);
  }

  if (templateOwner != '' && templateRepo != '') {
    await repoUtils.createRepoFromTemplate(owner, repo, templateOwner, templateRepo);
    console.log('Waiting for repo to be created...');
    await new Promise((f) => setTimeout(f, 5000));
  } else {
    await repoUtils.createRepo(owner, repo, '');
  }

  const branches = await repoUtils.listBranches(owner, repo);

  if (branches[0].name != 'main') {
    await repoUtils.renameBranch(owner, repo, branches[0].name, 'main');
  }

  await repoUtils.addCodewoners(owner, repo, codeowner == '' ? 'default-codeowner' : codeowner);
  await repoUtils.addCollaborator(owner, repo, admin, 'admin');
  await repoUtils.updateBranchProtection(owner, repo, 'main', true);
  await repoUtils.requireSignature(owner, repo, 'main');
  const sha = await repoUtils.getMainBrancRef(owner, repo);
  await repoUtils.createBranch(owner, repo, 'dev', sha);
  await repoUtils.updateBranchProtection(owner, repo, 'dev', false);
  await repoUtils.requireSignature(owner, repo, 'dev');

  repoCheckers.checkAll();

  console.log(`Link to the repo https://github.com/${owner}/${repo}`);
};

createRepo();
