// Create a new prototype, optionally deriving from an existing prototype
function proto( parent ) {
	// Adapted form of Douglas Crockford's Object.create
	function create( z ) {
	  function PROTO() {}
  	PROTO.prototype = z;
	  return new PROTO();
  }
  // Make a new prototype based on the specified parent prototype, if any
  var child = create( parent || {} );
  // Recursively determine if the specified object is of the specified prototype
  child.is = function( s ) {
    return ( s === child ) || ( parent && parent.is( s ) ); 
  };
  child.make = function() {
	  var o = create( child );
    // Execute the top-most constructor, passing in the specified arguments
	  if ( child.init ) {
      // use the init property for a constructor
      child.init.apply( o, arguments );
    }
	  return o;
  };
  return child;
}
exports.proto = proto;
