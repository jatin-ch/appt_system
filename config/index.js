var dbConfig = require('./database');

module.exports = {
    dbConnectionString: function() {
        return 'mongodb://' + dbConfig.uname + ':' + dbConfig.pwd + dbConfig.host + '/' + dbConfig.db;
    }
}