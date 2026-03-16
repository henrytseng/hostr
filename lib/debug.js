'use strict';

export default (useQuiet) => {
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
