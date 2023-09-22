
# GitHub First Party Actions Cache

This repository contains the code and scripts responsible for caching actions locally on a GitHub [Actions Runner](https://github.com/actions/runner).

This allows you to speedup actions execution without the cost of downloading actions during the course of your job during the `Setup Job` step. This party only caches the most popular first party actions, to save disk space.

A configuration file exists for each repository (see `config/actions/`). The refs are pinned to specific commit SHAs.

### Contributing
See the [contribution guide](../github/CONTRIBUTING.MD). Currently we are not taking requests for non first actions to be added at this time.
