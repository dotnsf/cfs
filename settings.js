exports.basic_username = 'admin';
exports.basic_password = 'P@ssw0rd';
exports.cloudant_username = '(Cloudant Username)';
exports.cloudant_password = '(Cloudant Password)';
exports.cloudant_db = 'cfsdb';

if( process.env.VCAP_SERVICES ){
  var VCAP_SERVICES = JSON.parse( process.env.VCAP_SERVICES );
  if( VCAP_SERVICES && VCAP_SERVICES.cloudantNoSQLDB ){
    exports.cloudant_username = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.username;
    exports.cloudant_password = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.password;
  }
}


