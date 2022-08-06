# personal-website
A personal website

# Workflows
## Linting
All Pull Requests will check for changes to ~~HTML,~~ CSS ~~and JS~~ files in the `/src` directory and run the relevant linting workflows.
If you want to skip a specific linting workflow you can add the following strings to your commit message: `[skip actions]`.

If you would like to automatically fix linting issues on your local machine you can run `npm run lint-fix`.


## New Release (Manual)
1. Merge PR with changes
2. Update local main with `git pull`
3. Bump version + tag with `npm  version ${type}` where type = patch, minor, major
4. Push tags with `git push --follow-tags`
5. Draft a new release on github with the title being the version eg. `v3.2.4`
6. Generate release notes + add any additional info
7. Publish release + ensure successful release via github actions