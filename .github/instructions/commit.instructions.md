---
applyTo: '**'
---

# Commit Workflow Instructions

> CRITICAL: Follow this workflow every time you commit changes.

## Commit Process

### 1. Review Current State
git status && git diff -U5 && git diff --stat
git log --oneline --graph -5  # Check recent commits

### 2. Stage and Commit by Context
git add <files> && git commit -m "type(scope): description"
git status  # Verify clean state

### 3. Repeat Until Clean
Continue until git status shows "nothing to commit, working tree clean"

---

## Conventional Commits Format

<type>[scope]: <description>

[optional body]

[optional footer]

### Types & Semantic Versioning

Type        Use When                SemVer    Example
----        --------                ------    -------
feat        New feature             MINOR     feat(api): add user login
fix         Bug fix                 PATCH     fix(auth): resolve token expiration
docs        Documentation           None      docs: update API guide
chore       Dependencies, tooling   None      chore(deps): add express
refactor    Code restructure        None      refactor(api): simplify error handling
improvement Enhancement             None      improvement(ui): enhance loading states
perf        Performance             PATCH     perf(api): optimize query
test        Tests                   None      test: add auth unit tests

BREAKING CHANGE: Use ! or BREAKING CHANGE: in footer → MAJOR version bump

### Common Scopes

Backend: auth, database, api, middleware, validation
Frontend: components, pages, hooks, styles
General: docs, deps, config

---

## Examples

# Simple
docs: correct spelling in CHANGELOG

# With scope
feat(api): add user profile endpoint

# With body
feat(auth): implement JWT refresh tokens

Add refresh token rotation to improve security.
Tokens expire after 7 days.

Closes #45

# Breaking change
feat(api)!: change user response structure

BREAKING CHANGE: user endpoints now return wrapped in 'data' object

---

## Grouping Commits by Context

When you have multiple modified files:

# 1. Review all changes
git status && git diff --stat

# 2. Unstage if needed
git reset HEAD .

# 3. Commit by context
git add .gitignore && git commit -m "chore: update gitignore"
git add backend/models/ && git commit -m "feat(database): add User model"
git add backend/routes/ && git commit -m "feat(api): add user routes"
git add docs/ && git commit -m "docs: add API documentation"

Context Guidelines:

Files                                  Group As       Type
-----                                  --------       ----
.gitignore, .env.example              Config         chore(config)
backend/models/*.js                   Database       feat(database)
backend/routes/*.js, controllers/*.js API            feat(api)
frontend/src/components/*.jsx         Components     feat(components)
docs/*, README.md                     Docs           docs
package.json                          Dependencies   chore(deps)

---

## Rules (RFC 2119)

1. Commits MUST be prefixed with type + colon + space
2. feat MUST be used for new features
3. fix MUST be used for bug fixes
4. Scope MAY be provided in parentheses: feat(api):
5. Description MUST use lowercase imperative mood: "add" not "added"
6. Body MAY be provided after blank line
7. Breaking changes MUST use BREAKING CHANGE: or ! notation
8. All messages MUST be in English

---

## Before Committing Checklist

- Run git status and git diff -U5
- Type is valid and followed by ": "
- Description uses lowercase imperative mood
- Breaking changes marked with ! or BREAKING CHANGE:
- No .env, secrets, or debug code
- Commit is focused on single logical change
- Message is in English

---

## Common Mistakes

AVOID: Generic messages, mixed changes, sensitive data, wrong type, capitalized description
DO: Specific messages, atomic commits, conventional format, correct type, lowercase description

---

## Tools

- commitlint - Lint commit messages
- husky - Git hooks validation
- standard-version - Automated versioning

commitlint config (.commitlintrc.json):
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", ["feat", "fix", "docs", "chore", "refactor", "improvement"]]
  }
}

---

## Resources

- Conventional Commits: https://www.conventionalcommits.org/
- Semantic Versioning: https://semver.org/
