
## GitHub First Party Actions Cache

This repository contains the code and scripts responsible for caching actions locally on a GitHub [Actions Runner](https://github.com/actions/runner).

This allows you to speedup actions execution without the cost of downloading actions during the course of your job during the `Setup Job` step. This repository only caches the most popular first party actions, to save disk space.

A configuration file exists for each repository (see `config/actions/`). The refs are pinned to specific commit SHAs.

### Which refs are included?

By default only `main` and version tags are included. For example: `v1` or `v2.0.1`

Preview versions are intentionally excluded. For example: `v2-beta`

Optional args may be supplied to control which refs are included. See `script/add-action.sh --help` for more info.

### How to use this in the self-hosted runner?

Please read the doc @kenmuse has put together at: https://www.kenmuse.com/blog/building-github-actions-runner-images-with-an-action-archive-cache/

## License 

This project is licensed under the terms of the MIT open source license. Please refer to [MIT](./LICENSE.txt) for the full terms.

## Maintainers 

[CODEOWNERS](./CODEOWNERS)

## Note

Thank you for your interest in this GitHub repo, however, right now we are not taking contributions. 

We continue to focus our resources on strategic areas that help our customers be successful while making developers' lives easier. While GitHub Actions remains a key part of this vision, we are allocating resources towards other areas of Actions and are not taking contributions to this repository at this time. The GitHub public roadmap is the best place to follow along for any updates on features we’re working on and what stage they’re in.

We are taking the following steps to better direct requests related to GitHub Actions, including:

1. We will be directing questions and support requests to our [Community Discussions area](https://github.com/orgs/community/discussions/categories/actions)

2. High Priority bugs can be reported through Community Discussions or you can report these to our support team https://support.github.com/contact/bug-report.

3. Security Issues should be handled as per our [security.md](security.md)

We will still provide security updates for this project and fix major breaking changes during this time.

You are welcome to still raise bugs in this repo.
