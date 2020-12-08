require( 'custom-env' ).env( true );

CommonConfig = {};

CommonConfig.Database = {
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME
};

module.exports = CommonConfig;