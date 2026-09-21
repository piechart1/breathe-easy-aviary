@AGENTS.md

## Project status

`STATUS.md` at the repo root is this project's status sheet. The block between the `status:begin` and
`status:end` markers is generated - never hand-edit it. The `## Judgement` section below those markers is
written by hand and the generator preserves it.

Refresh the generated block after anything that changes the project's shape (a version bump, a new
dependency, a release, an Android prebuild):

```bash
~/tools/project-status/status.py .
```

Update the `## Judgement` section yourself when what is blocking the project, or what comes next,
has changed. Keep it to what someone returning in a month would need.
