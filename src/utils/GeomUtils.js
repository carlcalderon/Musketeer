Musketeer.GeomUtils =
{
	/**
	 * Calculates the distance between two points in 2D space.
	 * 
	 * @return float
	 */
	distance:function( x1, y1, x2, y2 )
	{
		return Math.sqrt( (y2-y1)*(y2-y1) + (x2-x1)*(x2-x1) );
	},
	/**
	 * Translates / Convertes a vector3 coordinate to proper
	 * mesh rotation.
	 * TODO: add scale?
	 * 
	 * @param v 	THREE.Vector3
	 * @param mesh 	THREE.Mesh
	 * @return a new THREE.Vector3.
	 */
	translateVector3:function( v, mesh )
	{
		var result = v.clone( );
		var m = new THREE.Matrix4();
			m.extractRotation( mesh.matrixWorld, mesh.scale );
			m.multiplyVector3( result );
		return result;
	},
	/**
	 * Converts degrees to radians
	 *
	 * @param degrees
	 * @return radians
	 */
	convertDegreesToRadians:function( degrees )
	{
		return degrees * Math.PI / 180;
	},
	/**
	 * Constructs a rotation THREE.Matrix4.
	 *
	 * @param x	
	 * @param y	
	 * @param z	
	 * @param rad	Rotation angle
	 * @return THREE.Matrix4
	 */	
	rotationMatrix:function(x, y, z, rad )
	{
		var m = new THREE.Matrix4();
		var nCos = Math.cos( rad );
		var nSin = Math.sin( rad );
		var scos = 1 - nCos;

		var sxy  = x * y * scos;
		var syz  = y * z * scos;
		var sxz  = x * z * scos;
		var sz   = nSin * z;
		var sy   = nSin * y;
		var sx   = nSin * x;

		m.n11 =  nCos + x * x * scos;
		m.n12 = -sz   + sxy;
		m.n13 =  sy   + sxz;
		m.n14 = 0;

		m.n21 =  sz   + sxy;
		m.n22 =  nCos + y * y * scos;
		m.n23 = -sx   + syz;
		m.n24 = 0;

		m.n31 = -sy   + sxz;
		m.n32 =  sx   + syz;
		m.n33 =  nCos + z * z * scos;
		m.n34 = 0;

		return m;
	},
	/**
	 * Multiplies two THREE.Matrix4 (4x4) objects by 3x3.
	 * 
	 * @param a THREE.Matrix4
	 * @param b THREE.Matrix4
	 * @return THREE.Matrix4
	 */
	calculateMultiply3x3:function(a,b)
	{
		var m = new THREE.Matrix4();

		m.n11 = a.n11 * b.n11 + a.n12 * b.n21 + a.n13 * b.n31;
		m.n12 = a.n11 * b.n12 + a.n12 * b.n22 + a.n13 * b.n32;
		m.n13 = a.n11 * b.n13 + a.n12 * b.n23 + a.n13 * b.n33;

		m.n21 = a.n21 * b.n11 + a.n22 * b.n21 + a.n23 * b.n31;
		m.n22 = a.n21 * b.n12 + a.n22 * b.n22 + a.n23 * b.n32;
		m.n23 = a.n21 * b.n13 + a.n22 * b.n23 + a.n23 * b.n33;

		m.n31 = a.n31 * b.n11 + a.n32 * b.n21 + a.n33 * b.n31;
		m.n32 = a.n31 * b.n12 + a.n32 * b.n22 + a.n33 * b.n32;
		m.n33 = a.n31 * b.n13 + a.n32 * b.n23 + a.n33 * b.n33;

		return m;
	}
}