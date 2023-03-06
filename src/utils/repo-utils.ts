import { GithubApi } from '../api/github-api';
import {
  CreateRepoPayload,
  UpdateBranchProtectionPayload,
  CreateRefPayload,
  CreateRepoFromTemplatePayload,
  ListBranchesResponse,
} from '../types/github';

export class RepoUtils {
  private githubApi: GithubApi;

  constructor(githubApi: GithubApi) {
    this.githubApi = githubApi;
  }

  async createRepo(owner: string, repoName: string, repoDescription: string): Promise<void> {
    console.log('........................................');
    console.log('Creating repo...');
    const createRepoPayload: CreateRepoPayload = {
      org: 'defi-wonderland',
      name: repoName,
      description: repoDescription,
      homepage: 'https://defi.sucks/',
      private: false,
      visibility: 'private',
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      default_branch: 'main',
      auto_init: true,
      has_downloads: true,
      is_template: false,
      allow_squash_merge: true,
      allow_merge_commit: true,
      allow_rebase_merge: false,
      allow_auto_merge: false,
      delete_branch_on_merge: true,
      use_squash_pr_title_as_default: true,
      squash_merge_commit_title: 'PR_TITLE',
      squash_merge_commit_message: 'PR_BODY',
      merge_commit_title: 'PR_TITLE',
      merge_commit_message: 'PR_BODY',
    };

    const data = await this.githubApi.createRepo(owner, createRepoPayload);
    console.log(`Repo ${data.name} created!`);
  }

  async updateBranchProtection(owner: string, repoName: string, branchName: string, isMainBranch: boolean): Promise<void> {
    console.log('Updating branch protection...');
    const updateBranchProtectionPayload: UpdateBranchProtectionPayload = {
      required_status_checks: {
        strict: true,
        contexts: ['continuous-integration/travis-ci'],
      },
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_code_owner_reviews: isMainBranch,
        required_approving_review_count: isMainBranch ? 2 : 1,
        require_last_push_approval: true,
      },
      enforce_admins: true,
      restrictions: null,
      allow_force_pushes: false,
      allow_deletions: false,
      lock_branch: false,
    };
    await this.githubApi.updateBranchProtection(owner, repoName, branchName, updateBranchProtectionPayload);
    console.log(`Branch protection updated!`);
  }

  async getMainBrancRef(owner: string, repoName: string): Promise<string> {
    console.log('Getting main branch ref...');
    const data = await this.githubApi.getRef(owner, repoName, 'heads/main');
    console.log('Successfuly got main branch ref!');
    return data.object.sha;
  }

  async createBranch(owner: string, repoName: string, branchName: string, sha: string): Promise<void> {
    console.log(`Creating branch ${branchName}...`);
    const createRefPayload: CreateRefPayload = {
      ref: `refs/heads/${branchName}`,
      sha: sha,
    };
    await this.githubApi.createRef(owner, repoName, createRefPayload);
    console.log(`Branch ${branchName} created!`);
  }

  async requireSignature(owner: string, repoName: string, branchName: string): Promise<void> {
    console.log(`Enabling signature requirement for ${branchName} branch...`);
    await this.githubApi.requireSignature(owner, repoName, branchName);
    console.log(`Signature requirement for ${branchName} branch enabled!`);
  }

  async addCodewoners(owner: string, repoName: string, teamName: string): Promise<void> {
    console.log(`Adding codewoners for ${teamName}...`);
    await this.githubApi.addCodeOwners(owner, repoName, teamName);
    console.log(`Codewoners for ${teamName} added!`);
  }

  async addCollaborator(owner: string, repoName: string, username: string, adminLevel: string): Promise<void> {
    console.log(`Adding ${username} as a collaborator with ${adminLevel} permission...`);
    await this.githubApi.addCollaborator(owner, repoName, username, adminLevel);
    console.log(`${username} added as a ${adminLevel} collaborator!`);
  }

  async createRepoFromTemplate(owner: string, repo: string, templateOwner: string, templateRepo: string): Promise<void> {
    console.log(`Creating ${repo} from ${templateRepo} of ${templateOwner} template...`);
    const createRepoFromTemplatePayload: CreateRepoFromTemplatePayload = {
      owner: owner,
      name: repo,
      description: '',
      include_all_branches: false,
      private: true,
    };

    await this.githubApi.createRepoFromTemplate(templateOwner, templateRepo, createRepoFromTemplatePayload);
    console.log(`${repo} created from ${templateRepo} of ${templateOwner} template!`);
  }

  async listBranches(owner: string, repo: string): Promise<ListBranchesResponse> {
    console.log(`Listing branches of ${repo}...`);
    const branches = await this.githubApi.listBranches(owner, repo);
    console.log(`Branches of ${repo} listed!`);
    return branches;
  }

  async renameBranch(owner: string, repo: string, oldBranchName: string, newBranchName: string): Promise<void> {
    console.log(`Renaming branch ${oldBranchName} to ${newBranchName}...`);
    await this.githubApi.renameBranch(owner, repo, oldBranchName, { new_name: newBranchName });
    console.log(`Branch ${oldBranchName} renamed to ${newBranchName}!`);
  }
}
