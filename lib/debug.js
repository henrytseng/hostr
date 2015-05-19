'use strict';

module.exports = function(useQuiet) {
  return {
    quiet: useQuiet,

    log: function (msg) {
      if(!this.quiet) {
        console.log.apply(null, arguments);
      }
    },

    error: function (msg) {
      if(!this.quiet) {
        console.error.apply(null, arguments);
      }
    }
  };
};
