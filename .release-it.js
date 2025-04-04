module.exports = {
  plugins: {
    '@release-it-plugins/lerna-changelog': {
      infile: 'CHANGELOG.md',
    },
  },
  git: {
    commitMessage: 'v${version}',
    tagAnnotation: 'v${version}',
  },
  github: {
    release: true,
    releaseName: 'v${version}',
    tokenRef: 'GITHUB_AUTH',
  },
  npm: {
    publish: false,
  },
};
