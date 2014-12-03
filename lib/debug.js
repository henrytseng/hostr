'use strict';

module.exports = function(useQuiet) {
  return {
    quiet: useQuiet,

    log: function (msg) {
      if(!this.quiet) {
        console.log(msg);
      }
    }
  };
};
