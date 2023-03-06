# Repo Creator Workflow

This repository creator workflow allows users to create new repositories with all the Wonderland securities configuration. The main features of this workflow are:

- The only mandatory field is the repository name, but the user can provide additional options such as:
    - The codeowners.
    - Create from template providing a template owner and a template repo.
- At the end of the workflow, a link to the new repository will be created.
- The repository created will have two branches, `main` (default) and `dev` with the following setup:

  **Critical**
  * Signed commits
  * 1-2 minimum approvals for a PR to be merged
  * Lock main/master branch and dev branch, you should only use side branches
  * Only merge to main from dev
  * Codeowners for the main branch
  * Require conversation resolution before merging
  
  **Repository Settings**
  - [ ] Disable "Allow rebase merging"
  - [ ] Enable "Automatically delete head branches"
  - [ ] Main branch protection
    - [ ] Enable "Require a pull request before merging"
    - [ ] Change "Require approvals" to 2
    - [ ] Enable "Dismiss stale pull request approvals when new commits are pushed"
    - [ ] Enable "Require review from Code Owners"
    - [ ] Enable "Require status checks to pass before merging"
    - [ ] Enable "Require branches to be up to date before merging"
    - [ ] Enable "Require signed commits"
  - [ ] Dev branch protection
    - [ ] Enable "Require a pull request before merging"
    - [ ] Change "Require approvals" to 1
    - [ ] Enable "Dismiss stale pull request approvals when new commits are pushed"
    - [ ] Enable "Require status checks to pass before merging"
    - [ ] Enable "Require branches to be up to date before merging"
    - [ ] Enable "Require signed commits"

Always remember to add collaborators to teams instead of individual members, since it’s easier to manage.

## Usage

To use this repository creator workflow, follow these steps:

1. Click on the "Use this template" button to create a new repository from this template.
2. Fill in the mandatory field "Repository name".
3. If desired, fill in the "Codeowners" field and/or select "Create from template" and provide a template owner and a template repository.
4. Click on "Create repository".
5. After the repository is created, a link to the new repository will be provided.
