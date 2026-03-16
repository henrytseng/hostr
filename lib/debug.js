'use strict';

module.exports = (useQuiet) => {
  return {
    quiet: useQuiet,

    log(...args) {
      if (!this.quiet) {
        console.log(...args);
      }
    },

    error(...args) {
      if (!this.quiet) {
        console.error(...args);
      }
    }
  };
};
