
# GitHub First Party Actions Cache

This repository contains the code and scripts responsible for caching actions locally on a GitHub [Actions Runner](https://github.com/actions/runner).

This allows you to speedup actions execution without the cost of downloading actions during the course of your job during the `Setup Job` step. This repository only caches the most popular first party actions, to save disk space.

A configuration file exists for each repository (see `config/actions/`). The refs are pinned to specific commit SHAs.

### Which refs are included?

By default only `main` and version tags are included. For example: `v1` or `v2.0.1`

Preview versions are intentionally excluded. For example: `v2-beta`

Optional args may be supplied to control which refs are included. See `script/add-action.sh --help` for more info.

### Contributing
See the [contribution guide](../github/CONTRIBUTING.MD). Currently we are not taking requests for non first party actions to be added at this time.
