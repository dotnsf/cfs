//. app.js

var express = require( 'express' ),
    basicAuth = require( 'basic-auth-connect' ),
    cfenv = require( 'cfenv' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    cloudantlib = require( 'cloudant' ),
    app = express();
var settings = require( './settings' );
var cloudant = cloudantlib( { account: settings.cloudant_username, password: settings.cloudant_password } );
var appEnv = cfenv.getAppEnv();

app.use( multer( { dest: './tmp/' } ).single( 'file' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.all( '/', basicAuth( function( user, pass ){
  return( user === settings.basic_username && pass === settings.basic_password );
}));

app.get( '/init', function( req, res ){
  cloudant.db.create( settings.cloudant_db, function( err, body ){
    if( !err ){
      console.log( 'database ' + settings.cloudant_db + ' created!' );
    }
  });
});

app.post( '/add', function( req, res ){
  var filepath = req.file.path;
  var filetype = req.file.mimetype;
  //var filesize = req.file.size;
  var ext = filetype.split( "/" )[1];
  //var filename = req.file.filename;
  var path = req.body.path;
  var dir = req.body.dir;
  while( path.length > 0 && path.indexOf( '/' ) == 0 ){
    path = path.substring( 1 );
  }
  path = dir + path;

  if( path && filepath ){
    var bin = fs.readFileSync( filepath );
    var bin64 = new Buffer( bin ).toString( 'base64' );
        
    var params = {
      _id: path,
      _attachments: {
        file: {
          content_type: filetype,
          data: bin64
        }
      }
    };

    var fsdb = cloudant.db.use( settings.cloudant_db );
    fsdb.insert( params, path, function( err, body, header ){
      if( err ){
        var p = JSON.stringify( err, null, 2 );
        res.write( p );
        res.end();
      }
      fs.unlink( filepath, function( err ){} );

      res.redirect( './?dir=' + dir );
    });
  }
});

app.get( '/', function( req, res ){
  var dir = ( req.query.dir === undefined ? '' : req.query.dir );
  var list_template = fs.readFileSync( __dirname + '/public/list.ejs', 'utf-8' );

  var fsdb = cloudant.db.use( settings.cloudant_db );
  fsdb.list( function( err1, res1 ){
    if( err1 ){ console.log( err1 ); }
    else{
      var ids = [];

      res1.rows.forEach( function( doc ){
        var id = doc.id;

        if( dir ){
          if( id.indexOf( dir ) == 0 ){
            id = id.substring( dir.length );

            var n = id.indexOf( '/' );
            if( n > -1 ){
              var d = id.substring( 0, n + 1 ); //. ***/
              if( ids.indexOf( d ) == -1 ){
                ids.push( d );
              }
            }else{
              ids.push( id );
            }
          }
        }else{
          var n = id.indexOf( '/' );
          if( n > -1 ){
            var d = id.substring( 0, n + 1 ); //. ***/
            if( ids.indexOf( d ) == -1 ){
              ids.push( d );
            }
          }else{
            ids.push( id );
          }
        }
      });

      var p = ejs.render( list_template, { dir: dir, ids: ids } );
      res.write( p );
      res.end();
    }
  });
});

app.get( '/get', function( req, res ){
  var id = req.query.id;
  var fsdb = cloudant.db.use( settings.cloudant_db );
  fsdb.attachment.get( id, "file", function( err, body ){
    //res.contentType( 'image/png' );
    res.end( body, 'binary' );
  });
});

app.get( '/download', function( req, res ){
  var id = req.query.id;
  var filename = id;
  var n = filename.lastIndexOf( '/' );
  if( n > -1 ){
    filename = filename.substring( n + 1 );
  }

  var fsdb = cloudant.db.use( settings.cloudant_db );
  fsdb.attachment.get( id, "file", function( err, body ){
/*
    res.contentType( 'application/force-download' );
    res.contentDisposition( 'attachment; filename=' + filename );
*/
    res.set({
      'Content-Disposition': 'attachment; filename=' + filename,
      'Content-Type': 'application/force-download'
    });
    res.end( body, 'binary' );
  });
});

app.delete( '/del', function( req, res ){
  var path = req.body.id;

  //. Cloudant から削除
  fsdb.get( path, null, function( err1, body1, header1 ){
    if( err1 ){
      err1.file_id = "error-1";
      res.write( JSON.stringify( err1 ) );
      res.end();
    }

    var rev = body1._rev;
    fsdb.destroy( path, rev, function( err2, body2, header2 ){
      if( err2 ){
        err2.file_id = "error-2";
        res.write( JSON.stringify( err3 ) );
        res.end();
      }

      body2.file_id = path;
      res.write( JSON.stringify( body2 ) );
      res.end();
    });
  });
});

app.listen( appEnv.port );
console.log( "server stating on " + appEnv.port + " ..." );

