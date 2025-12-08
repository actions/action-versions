
## GitHub First Party Actions Cache

This repository contains the code and scripts responsible for caching actions locally on a GitHub [Actions Runner](https://github.com/actions/runner).

This allows you to speedup actions execution without the cost of downloading actions during the course of your job during the `Setup Job` step. This repository only caches the most popular first party actions, to save disk space.

A configuration file exists for each repository (see `config/actions/`). The refs are pinned to specific commit SHAs.

### Which refs are included?

By default only `main` and version tags are included. For example: `v1` or `v2.0.1`

Preview versions are intentionally excluded. For example: `v2-beta`

Optional args may be supplied to control which refs are included. See `script/add-action.sh --help` for more info.

### Ignoring old versions

To exclude certain old version tags from being packaged, add an `ignoreTags` array to the action config JSON file. Each entry is a regex pattern that will be tested against tag names.

**When adding a new action**, use the `--ignore-tags` option with simple version prefixes:

```bash
./script/add-action.sh --ignore-tags "v1,v2" actions/checkout
```

This will automatically generate regex patterns that match `v1`, `v1.x`, `v2`, `v2.x`, etc.

**For existing actions**, use the helper script to add ignore tags:

```bash
./script/add-ignore-tags.sh --ignore-tags "v1,v2" actions/checkout
```

Or add `ignoreTags` directly to the JSON config file:

```json
{
  "owner": "actions",
  "repo": "checkout",
  "ignoreTags": [
    "^v1(\\..*)?$",
    "^v2(\\..*)?$"
  ]
}
```

Tags matching any of the patterns will be excluded from the generated scripts while remaining in the config for historical reference. The `ignoreTags` field is preserved when running `update-action.sh`.

### How to use this in the self-hosted runner?

Please read the doc @kenmuse has put together at: https://www.kenmuse.com/blog/building-github-actions-runner-images-with-an-action-archive-cache/

## License 

This project is licensed under the terms of the MIT open source license. Please refer to [MIT](./LICENSE.txt) for the full terms.

## Maintainers 

[CODEOWNERS](./CODEOWNERS)

## Contributing
See the [contribution guide](../github/CONTRIBUTING.MD). Currently we are not taking requests for non first party actions to be added at this time.
