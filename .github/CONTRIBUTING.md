

## Build

To build the layout, run `script/build.sh`

## Actions

### Add an action

To add an action, run `script/add-action.sh`

__Example adding an action__

```
script/add-action.sh actions/checkout
```

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
