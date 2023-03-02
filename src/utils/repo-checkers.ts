import { GithubApi } from '../api/github-api';

export class RepoCheckers {
  private githubApi: GithubApi;
  private owner: string;
  private repo: string;
  private templateOrg: string;
  private templateRepo: string;
  private admin: string;

  constructor(githubApi: GithubApi, owner: string, repo: string, templateOrg: string, templateRepo: string, admin: string) {
    this.githubApi = githubApi;
    this.owner = owner;
    this.repo = repo;
    this.templateOrg = templateOrg;
    this.templateRepo = templateRepo;
    this.admin = admin;
  }

  assert(condition: boolean, message: string) {
    if (!condition) {
      throw new Error(message);
    }
  }

  async checkRepo() {
    console.log('.........................................................');
    console.log(`Running checks for repo ${this.repo} in ${this.owner}...`);
    const repoData = await this.githubApi.getRepository(this.owner, this.repo);
    console.log('Checking repo name and issues enabled...');
    this.assert(repoData.full_name == `${this.owner}/${this.repo}`, `Repo ${this.repo} does not exist in ${this.owner}`);
    this.assert(repoData.has_issues, `Repo ${this.repo} does not have issues enabled`);
    if (this.templateOrg != '' && this.templateRepo != '') {
      this.assert(repoData.template_repository?.full_name == `${this.templateOrg}/${this.templateRepo}`, `Repo ${this.repo} is not a template`);
    } else {
      this.assert(repoData.homepage == 'https://defi.sucks/', `Repo ${repoData.homepage} is not https://defi.sucks/`);
    }

    console.log('Checking repo is private...');
    this.assert(repoData.private == true, `Repo ${this.repo} is public`);

    console.log('Checking allow squash merge enabled...');
    this.assert(repoData.allow_squash_merge == true, `Repo ${this.repo} does not allow squash merge`);

    console.log('Checking allow merge commit enabled...');
    this.assert(repoData.allow_merge_commit == true, `Repo ${this.repo} does not allow merge commit`);

    console.log('Checking allow rebase merge disabled...');
    this.assert(repoData.allow_rebase_merge == false, `Repo ${this.repo} allows rebase merge`);

    console.log('Checking allow auto merge disabled...');
    this.assert(repoData.allow_auto_merge == false, `Repo ${this.repo} allows auto merge`);

    console.log('Checking delete branch on merge enabled...');
    this.assert(repoData.delete_branch_on_merge == true, `Repo ${this.repo} does not delete branch on merge`);

    console.log(`Checking admin role for ${this.owner}...`);
    const collaborators = await this.githubApi.getCollaborators(this.owner, this.repo);
    this.assert(
      collaborators.find((c) => c.login == this.admin)?.permissions.admin == true,
      `Repo ${this.admin} does not have admin role for ${this.owner}`
    );
  }

  async checkBranch(branchName: string) {
    console.log('.........................................................');
    console.log(`Running checks for branch ${branchName}...`);
    const branchData = await this.githubApi.getBranchProtection(this.owner, this.repo, branchName);

    const requiredReviews = branchName == 'main' ? 2 : 1;

    console.log('Checking require pr and pr reviews number');
    this.assert(
      branchData.required_pull_request_reviews.required_approving_review_count == requiredReviews,
      `Repo ${this.repo} does not have the required ${requiredReviews} reviews for ${branchName} branch`
    );
    if (branchName == 'main') {
      this.assert(
        branchData.required_pull_request_reviews.require_code_owner_reviews == true,
        `Repo ${this.repo} does not have require code owner reviews enabled for ${branchName} branch`
      );
    }
    this.assert(
      branchData.required_pull_request_reviews.require_last_push_approval == true,
      `Repo ${this.repo} does not have require last push approval enabled for ${branchName} branch`
    );
    this.assert(
      branchData.required_pull_request_reviews.dismiss_stale_reviews == true,
      `Repo ${this.repo} does not have dismiss stale reviews enabled for ${branchName} branch`
    );
    console.log('Checking admin cannot bypass checks');
    this.assert(
      branchData.enforce_admins.enabled == true,
      `Repo ${this.repo} does not have admin cannot bypass checks enabled for ${branchName} branch`
    );
    console.log('Checking require status checks');
    this.assert(
      branchData.required_status_checks.strict == true,
      `Repo ${this.repo} does not have require status checks enabled for ${branchName} branch`
    );
    console.log('Checking restrictions');
    this.assert(branchData.restrictions == null, `Repo ${this.repo} has restrictions enabled for ${branchName} branch`);
    console.log('Checking allow force pushes disabled');
    this.assert(branchData.allow_force_pushes.enabled == false, `Repo ${this.repo} allows force pushes for ${branchName} branch`);
    console.log('Checking allow deletions disabled');
    this.assert(branchData.allow_deletions.enabled == false, `Repo ${this.repo} allows deletions for ${branchName} branch`);
    console.log('Checking lock branch disabled');
    this.assert(branchData.lock_branch.enabled == false, `Repo ${this.repo} locks branch for ${branchName} branch`);

    console.log('Checking commit signature protection for branch ${branchName}...');
    const signatureProtection = await this.githubApi.getCommitSignatureProctection(this.owner, this.repo, branchName);
    this.assert(
      signatureProtection.enabled == true,
      `Repo ${this.repo} does not have commit signature protection enabled for ${branchName} branch`
    );
  }

  async checkAll() {
    console.log('Running checks');
    await this.checkRepo();
    await this.checkBranch('main');
    await this.checkBranch('dev');
    console.log('All checks passed!');
  }
}
