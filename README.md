
# GitHub First Party Actions Cache

This repository contains the code and scripts responsible for caching actions locally on a GitHub [Actions Runner](https://github.com/actions/runner).

A configuration file exists for each repository (see `config/actions/`). The refs are pinned to specific commit SHAs.

### Contributing
See the [contribution guide](../github/CONTRIBUTING.MD). Currently we are not taking requests for non first actions to be added at this time.


## Build

To build the layout, run `script/build.sh`

## Actions

### Add an action

To add an action, run `script/add-action.sh`

__Example adding an action__

```
script/add-action.sh actions/checkout
```

### Which refs are included?

By default only `main` and version tags are included. For example: `v1` or `v2.0.1`

Preview versions are intentionally excluded. For example: `v2-beta`

Optional args may be supplied to control which refs are included. See `script/add-action.sh --help` for more info.

### Update an action

To update the refs for an action, run `script/update-action.sh`

__Example updating one action__

```
script/update-action.sh actions/checkout
```

__Example updating all actions__

```
script/update-action.sh --all
```

- If you hand-edit an action config, make sure you run `script/build.sh` to regenerate the action build scripts.

## Troubleshooting

Set `GITHUB_ACTIONS_DEBUG=1` for debug output
