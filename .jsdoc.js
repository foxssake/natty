'use strict';

module.exports = {
  source: {
    includePattern: ".+\\.m?js$"
  },

  opts: {
    recurse: true,
    destination: './jsdoc/',
    readme: 'README.md'
  },

  plugins: ['plugins/markdown']
}
