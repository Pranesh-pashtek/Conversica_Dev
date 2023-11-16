# React-Express.js TypeScript Boilerplate

This repo contains the code for an app that can be embedded into SFMC via their AppExchange partner program.
In technical terms, this app is loaded via an `iframe` under the `https://*.exacttarget.com` domain.

## Development

This project uses Yarn 1.x workspaces feature. That means in order to install dependencies you should
always use `--cwd` to install the dependency into the respective workspace. You should only override
that and install at the workspace root (the current folder) using `-W` if you need it for some
root-level scripts that are not used by either of the workspaces.

For example, to install `helmet` for the `api` workspace, run `yarn add helmet --cwd app/api`.
To install a dev dependency for the `api` workspace you would run
`yarn add -D <dependency> --cwd app/api`.

Also read the README files under the `app/api` and `app/ui` for their respective instructions.
