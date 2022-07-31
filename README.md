# personal-website
A personal website

## New Release
1. Merge PR with changes
2. Update local main with `git pull`
3. Bump version + tag with `npm  version ${type}` where type = patch, minor, major
4. Push tags with `git push --follow-tags`
5. Draft a new release on github with the title being the version eg. `v3.2.4`
6. Generate release notes + add any additional info
7. Publish release + ensure successful release via github actions