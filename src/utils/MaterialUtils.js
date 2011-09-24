Musketeer.MaterialUtils = 
{
	/**
	 * Constructs and loads a texture.
	 * 
	 * @param path			Texture path/url
	 * @param parameters	Custom texture parameters
	 * @return THREE.Texture
	 */
	getTexture:function( path, parameters )
	{
		var result = THREE.ImageUtils.loadTexture( path );
		parameters = (parameters !== undefined)?parameters:{};
		if(parameters.mipmap === true )
		{
			parameters.wrapS 	  	= THREE.ClampToEdgeWrapping;
			parameters.wrapT 	  	= THREE.ClampToEdgeWrapping;
			parameters.minFilter 	= THREE.LinearFilter;
			parameters.magFilter 	= THREE.LinearMipMapLinearFilter;
		}
		
		var key;
		for( key in parameters )
		{
			result[ key ] = parameters[ key ];
		}
		return result;
	},
	/**
	 * Constructs a proper MeshShaderMaterial based
	 * on ShaderUtils.lib['normal'] shader from THREE.
	 *
	 * @param parameters Custom shader parameters
	 */
	getShadedMaterial:function( parameters )
	{
		parameters = parameters || {};
		parameters.ambient 		= parameters.ambient 	|| 0x050505;
		parameters.diffuse 		= parameters.diffuse 	|| 0xEEEEEE;
		parameters.specular 	= parameters.specular 	|| 0x111111;
		parameters.shininess 	= parameters.shininess 	|| 500;
		parameters.depthTest 	= parameters.depthTest 	|| true;
		parameters.lights 		= parameters.lights 	|| true;
		parameters.shading 		= parameters.shading 	|| THREE.SmoothShading;
		parameters.opacity 		= parameters.opacity 	|| 1.0;
			
		normalShader = THREE.ShaderUtils.lib["normal"];
		var uniforms = THREE.UniformsUtils.clone( normalShader.uniforms );
		
		if( parameters.normalMap !== undefined )
		{
			uniforms[ "tNormal" ].texture 		= Musketeer.Utils.getTexture( parameters.normalMap );
		}
		
		if( parameters.diffuseMap !== undefined )
		{
			uniforms[ "tDiffuse" ].texture 		= Musketeer.Utils.getTexture( parameters.diffuseMap );
			uniforms[ "enableDiffuse" ].value 	= true;
		}
			
		if( parameters.specularMap !== undefined )
		{
			uniforms[ "tSpecular" ].texture 	= Musketeer.Utils.getTexture( parameters.specularMap );
			uniforms[ "enableSpecular" ].value 	= true;
		}
		
		if( parameters.reflectionMap !== undefined )
		{
			uniforms[ "tAO" ].texture 		=  Musketeer.Utils.getTexture( parameters.reflectionMap );
			uniforms[ "enableAO" ].value 	= true;
		}
		
		uniforms[ "uDiffuseColor" ].value.setHex( 	parameters.diffuse 	);
		uniforms[ "uSpecularColor" ].value.setHex( 	parameters.specular );
		uniforms[ "uAmbientColor" ].value.setHex( 	parameters.ambient 	);

		uniforms[ "uShininess" ].value 	= parameters.shininess;
		uniforms[ "uOpacity" ].value 	= parameters.opacity;

		var settings = {	
							opacity:parameters.opacity, 
							shading:parameters.shading, 
							fragmentShader: normalShader.fragmentShader, 
							vertexShader: normalShader.vertexShader, 
							uniforms: uniforms, 
							lights: parameters.lights, 
						 	blending: THREE.MixBlending,
							depthTest: parameters.depthTest
						};
		var result = new THREE.MeshShaderMaterial( settings );	
			result.transparent = true;
		return result;
	}
}