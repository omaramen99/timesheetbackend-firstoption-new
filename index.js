
 const app = require('./app');
 app.set( 'port', 10000);
 app.listen( app.get( 'port' ), function() {
   console.log( 'Node server is running on port ' + app.get( 'port' ));
   });




