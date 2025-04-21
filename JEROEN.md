Learnings. Getting KaTeX to compile and run is not easy... I'm just tracking here what I'm doing

- `yarn (v=1.22.22)` (installs successfully) (node version == v22.14.0)
- `yarn start`
   :❌x: error:0308010C:digital envelope routines::unsupported (OS UNSUPPORTED)
   https://stackoverflow.com/a/69699772/308451
    `export NODE_OPTIONS=--openssl-legacy-provider` 
    - `yarn test`
    Failed to compile. Submodules 😑
   `git submodule update --init --recursive`

- now `yarn test` runs but the text on http://localhost:7936/ is just raw and doesn't look pretty 
    - Can't figure out how to get that to work (not a great start 😒)


Run in ELEVATED powershell:
- `corepack enable; corepack prepare yarn@4.1.1 --activate`
I also dumped the old yarn;
- `npm -g uninstall yarn`


In Bash back in vscode `yarn --version` should now run 

`yarn install`
`yarn test` ALL tests 🎉 ✅ 🎉

