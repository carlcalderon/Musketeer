Musketeer.InteractiveUtils = 
{
	/**
	 * Makes a THREE.Mesh able to rotate as a trackball.
	 * 
	 * @param receiver		DOMElement that will receieve mouse events
	 * @param object		THREE.Mesh to apply trackball rotation
	 * @param parameters	Custom parameters
	 */
	trackball:function( receiver, object, parameters )
	{
		parameters = ( parameters !== undefined ) ? parameters : {};
		parameters.acceleration = parameters.acceleration 	|| 1.2;
		parameters.scale 		= parameters.scale 			|| 1.0;
		
		object.matrixAutoUpdate = false;
		
		var m_c 		= new THREE.Vector2( );
		var m_p 		= new THREE.Vector2( );
		var FORWARD 	= new THREE.Vector3( 0, 0, 1 );
		var mouseDown 	= false;
		
		function update( )
		{
			var difference 	= new THREE.Vector2( m_c.x - m_p.x, m_c.y - m_p.y );
 			var vec3 		= new THREE.Vector3( difference.x, difference.y, 0 );
			var distance 	= Math.pow( Musketeer.Utils.distance( m_c.x, m_c.y, m_p.x, m_p.y ), parameters.acceleration );
			var rotationAxis = new THREE.Vector3( ).cross( vec3, FORWARD );
				rotationAxis.normalize( );
			var rotationMatrix = Musketeer.Utils.rotationMatrix( rotationAxis.x, -rotationAxis.y, rotationAxis.z, distance / 250 );
			object.matrixWorld = new THREE.Matrix4().multiply( rotationMatrix, object.matrixWorld );
			object.matrix.multiplyScalar( parameters.scale );
		}
		function down( e )
		{
			mouseDown = true;
			m_c.set( e.pageX, e.pageY );
			m_p.set( m_c.x || 0 , m_c.y || 0 );
			
			receiver.bind( 'mousemove',	move );
			receiver.bind( 'mouseup',	up );
		}
		function move( e )
		{
			m_c.set( e.pageX, e.pageY );
			update( );
			m_p.set( m_c.x, m_c.y );
			
		}
		function up( e )
		{
			mouseDown = false;
			receiver.unbind( 'mousemove',	move );
			receiver.unbind( 'mouseup',		up );
		}
		receiver.bind( 'mousedown',	down );
	}
}