/*
	The Musketeer of THREE
	-
	Basic WebGL structure
	Require Three.js and jQuery
	author: Carl Calderon 2011
			http://www.flashfantastic.com
*/
var verbose = true;		// logging (on/off)
var logLevel = 5;		// 0 system
						// 1 criticals
						// 2 errors
						// 3 warnings
						// 4 info
						// 5 debug

// ------------ DO NOT CHANGE ANYTHING AFTER THIS LINE ------------
// STATICS
const RENDERER_AUTO 	= 'auto';	// defaults to canvas at this time.
const RENDERER_CANVAS 	= 'canvas';
const RENDERER_WEBGL 	= 'webgl';

const WEBGL_VERSION		= 0x1F02;
const WEBGL_VENDOR		= 0x1F00;
const WEBGL_RENDERER	= 0x1F01;
const WEBGL_SHADING		= 0x8B8C;
const WEBGL_GENERATE_MIPMAP_HINT	= 0x8192;
const WEBGL_HINT_MODE_DONT_CARE 	= 0x1100;
const WEBGL_HINT_MODE_FASTEST 		= 0x1101;
const WEBGL_HINT_MODE_NICEST 		= 0x1102;

// MUSKETEER DEFAULTS
var DEFAULT_VIEW_ANGLE 		= 45;
var DEFAULT_NEAR 			= 1;
var DEFAULT_FAR 			= 10000;
var DEFAULT_WIDTH 			= 640;
var DEFAULT_CAMERA_DISTANCE = 300;
var DEFAULT_HEIGHT 			= 480;
var DEFAULT_FPS 			= 60;
var DEFAULT_RENDERER 		= RENDERER_WEBGL;

// COMMON METHODS
/**
 * Output a standardized message to the browser console.
 * Can be switched of by setting #verbose to false.
 * Level of detail is defined by #logLevel. Higher the
 * value, the more information.
 * Method is equal to console#log().
 * @param msg 	Any form of message.
 *				Optional prefixes:
 *				x System
 *				c Critical
 *				e Error
 *				w Warning
 *				i Informational
 *				d Debug (default)
 */
function log( msg )
{
	if( verbose )
	if( console ) if( console.log ) 
	{
		if( msg == undefined )
			console.log('Musketeer - log message was "undefined".');
		else
		if( msg.match !== undefined )
		if( msg.match( /^[a-z]{1}\s/ ) )
		{
			var prefix = '';
			var level = 0;
			switch( msg.substr(0,1) )
			{	
				case 'x': prefix = 'SYSTEM';	level = 0; break;
				case 'c': prefix = 'CRITICAL';	level = 1; break;
				case 'e': prefix = 'ERROR'; 	level = 2; break;
				case 'w': prefix = 'WARNING'; 	level = 3; break;
				case 'i': prefix = 'INFO'; 		level = 4; break;
				default :
				case 'd': prefix = 'DEBUG'; 	level = 5; break;
			}
			if( level <= logLevel )
				console.log( 'Musketeer#'+prefix+' - ' + msg.substr(2) );
		}
		else console.log( 'Musketeer - ' + msg );
	}
}

/**
 * Outputs the provided object and all public 
 * keys and/or variables. Output is logged as
 * "d" for Debug. Minimum logLevel of 5 required.
 * 
 * @param obj Any object
 */
function dump( obj )
{
	var p, str = "d "+obj+"\n";
	for ( p in obj ) 
		str += p + ": " + obj[p] + "\n";
	log( str );
}

/**
 * Output a log message with all
 * informative keys in the specified vector.
 * This method should only be used when the
 * vector type is unknown.
 *
 * @param v Any THREE.Vector[2..4]
 */
function dumpVector( v )
{
	if( v.w !== undefined )
		dumpVector4( v )
	else if(v.z !== undefined )
		dumpVector3( v );
	else
		dumpVector2( v );
}

/**
 * Output information about the provided THREE.Vector2.
 *
 * @param v THREE.Vector2
 */
function dumpVector2( v )
{
	log('d vector2: x:' + v.x +' y:' + v.y );
}

/**
 * Output information about the provided THREE.Vector3.
 *
 * @param v THREE.Vector3
 */
function dumpVector3( v )
{
	log('d vector3 x:' + v.x +' y:' + v.y + ' z:'+v.z );
}

/**
 * Output information about the provided THREE.Vector4.
 *
 * @param v THREE.Vector4
 */
function dumpVector4( v )
{
	log('d vector4 x:' + v.x +' y:' + v.y + ' z:' + v.z + ' w:' + v.w );
}

/**
 * Output the provieded THREE.Matrix4 as a readable
 * string. The output format is as listed:
 * 
 * [n11] [n12] [n13] [n14]
 * [n21] [n22] [n23] [n24]
 * [n31] [n32] [n33] [n34]
 * [n41] [n42] [n43] [n44]
 *
 * @param m THREE.Matrix4
 */
function dumpMatrix4( m )
{
	var r1 = '['+m.n11+']['+m.n12+']['+m.n13+']['+m.n14+']';
	var r2 = '['+m.n21+']['+m.n22+']['+m.n23+']['+m.n24+']';
	var r3 = '['+m.n31+']['+m.n32+']['+m.n33+']['+m.n34+']';
	var r4 = '['+m.n41+']['+m.n42+']['+m.n43+']['+m.n44+']';
	log('d matrix4:\n'+r1+'\n'+r2+'\n'+r3+'\n'+r4);
}

/*------------------------------*\
	CLASS START
\*------------------------------*/

/**
 * Creates a new Musketeer
 *
 * @param container 	Div element
 * @param w (optional)	Viewport width
 * @param h (optional)	Viewport height
 */
function Musketeer( container, w, h )
{
	this.container 			= container;
	this.viewportWidth		= parseInt(w) 	|| DEFAULT_WIDTH;
	this.viewportHeight		= parseInt(h) 	|| DEFAULT_HEIGHT;
	this.container.width( 	this.viewportWidth 	);
	this.container.height( 	this.viewportHeight );
	this.useCameraLight		= false;
	this.children			= [];
	this.allObjects			= [];
	this.lights				= [];
	this.useTurntable		= false;
	this.renderType			= '';
	
	this.load_complete = function( object, geometry, scale, material )
	{
		log('i load complete:'+geometry);
		try { geometry.computeTangents(); }
		catch(e) { log('w could not compute tangents of geometry:'+geometry ); }

		material 	= ( material !== undefined ) ? material : new THREE.MeshLambertMaterial( {color:0xFFFFFF, shading:THREE.SmoothShading } );
		scale 		= ( scale !== undefined ) ? scale : 10;

		var mesh = new THREE.Mesh( geometry, material );
			mesh.scale.set( scale, scale, scale );
		object.add( mesh );
		object.onLoadComplete( mesh );
	}
	
}

/**
 * Initializes the Musketeer
 *
 * @param viewAngle (optional) 		FOV
 * @param near (optional) 			near
 * @param far (optional) 			far
 * @param automaticSetup (optional)	Boolean; if true, complete setup is
 *									automated using defaults.
 */
Musketeer.prototype.initialize = function( automaticSetup, viewAngle, near, far )
{
	this.viewAngle 		= viewAngle || DEFAULT_VIEW_ANGLE;
	this.aspectRatio	= this.viewportWidth / this.viewportHeight;
	this.near 			= near 		|| DEFAULT_NEAR;
	this.far 			= far 		|| DEFAULT_FAR;
	if( ( automaticSetup != null && automaticSetup == true ) || automaticSetup == null )
	{
		this.initializeRenderer( );
		this.initializeCamera( );
		this.initializeScene( );
		this.initializeLights( );
	}
	log( 'i initialize complete' );
}

/**
 * Initializes the renderer
 *
 * @param type (optional) Rendering type; canvas / webgl
 */
Musketeer.prototype.initializeRenderer = function( type )
{
	switch( type || DEFAULT_RENDERER )
	{
		case RENDERER_AUTO:
		case RENDERER_CANVAS :
			this.renderType = RENDERER_CANVAS;
			this.renderer = new THREE.CanvasRenderer( );
			break;
		case RENDERER_WEBGL :
		default :
			this.renderType = RENDERER_WEBGL;
			this.renderer = new THREE.WebGLRenderer( { maxLights:7/* is actually 6 */,antialias:true } );
			this.renderer.shadowCameraNear 		= DEFAULT_NEAR;
			this.renderer.shadowCameraFar 		= DEFAULT_FAR;
			this.renderer.shadowCameraFov 		= DEFAULT_VIEW_ANGLE;
			this.renderer.shadowMapBias 		= 0.0039;
			this.renderer.shadowMapDarkness 	= 0.8;
			this.renderer.shadowMapWidth 		= 2048;
			this.renderer.shadowMapHeight 		= 2048;
			this.renderer.shadowMapEnabled 		= true;
			this.renderer.shadowMapSoft 		= true;
			
			this.setWebGLHintMode( WEBGL_HINT_MODE_NICEST );
			break;
	}
	log( 'i renderer complete: ' + type );
}

/**
 * Initializes the camera
 *
 * @param ownCamera (optional) Your own camera.
 */
Musketeer.prototype.initializeCamera = function( ownCamera )
{
	if( ownCamera !== undefined )
	{
		this.camera = ownCamera;
	}
	else
	{
		this.camera = new THREE.Camera( this.viewAngle, this.aspectRatio, this.near, this.far );
		this.camera.position.z = DEFAULT_CAMERA_DISTANCE;
	}
	log( 'i camera complete: ' + this.camera );
}

/**
 * Initializes the scene
 *
 * @param ownScene (optional) Your own scene.
 */
Musketeer.prototype.initializeScene = function( ownScene )
{
	if( ownScene !== undefined )
	{
		this.scene = ownScene;
	}
	else
	{
		this.scene = new THREE.Scene( );
	}
	log( 'i scene complete: ' + this.scene );
}

/**
 * Initializes the default lightning
 */
Musketeer.prototype.initializeLights = function(  )
{
	this.useCameraLight = true;
	
	
	// create light with shadow setup ( intensity 0 and castShadow due to WebGL bug )
	var directionalLight = new THREE.SpotLight( 0xFFFFFF );
		directionalLight.intensity = 0.0;
		directionalLight.target.position.set( 0, 0, 0 );
		directionalLight.castShadow = true;
		directionalLight.position.y = 500;
	this.scene.addLight( directionalLight );
	
	this.camera_light = new THREE.SpotLight( 0xFFFFFF );
	this.camera_light.intensity = 0.8;
	this.camera_light.position.y = 0;//-DEFAULT_CAMERA_DISTANCE;
	this.camera_light.position.z = DEFAULT_CAMERA_DISTANCE;
	this.camera_light.target.position.set( 0, 0, 0 );
	this.lights.push( this.camera_light );
	this.scene.addLight( this.camera_light );
	
	log( 'i lights complete' );
}

/**
 * Finalize the Musketeer setup.
 * Require Musketeer#initialize() or manual setup of environment.
 */
Musketeer.prototype.start = function( )
{
	this.renderer.setSize( this.viewportWidth, this.viewportHeight );
	this.container.innerHTML = '';
	this.container.append( this.renderer.domElement );
	this.startRendering( DEFAULT_FPS );
}

///////////////////////////////
//
// RENDERING
//
///////////////////////////////

/**
 * Renders a single frame
 * @param object Musketeer
 */
Musketeer.prototype.render = function( musketeer )
{
	musketeer.onEnterFrame( );
	musketeer.renderer.render( musketeer.scene, musketeer.camera );
	musketeer.onRendered( );
}

/**
 * Renders a single frame with the specified scene and camera..
 * 
 * @param scene	
 * @param camera
 */
Musketeer.prototype.renderToCanvas = function( scene, camera )
{
	this.renderer.render( scene, camera );
}

/**
 * Renders a single frame from the global effect composer
 */
Musketeer.prototype.renderEffectComposer = function( )
{
	musketeer.renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );
}

/**
 * Renders a frame and returns the result as a texture.
 * 
 * @param scene	 (optional)	Your own scene.
 * @param camera (optional)	Your own camera.
 * @param width	 (optional)	Texture width
 * @param height (optional)	Texture height
 * @param parameters (optional)	Texture (RenderTarget) parameters.
 * @return THREE.RenderTarget
 */
Musketeer.prototype.renderAsTexture = function( scene, camera, width, height, parameters )
{
	scene 		= scene 		|| this.scene;
	camera 		= camera 		|| this.camera;
	width 		= width 		|| this.viewportWidth;
	height 		= height 		|| this.viewportHeight;
	parameters 	= parameters 	|| null;
	
	var result = new THREE.RenderTarget( width, height, parameters );
	this.renderer.render( scene, camera, result );
	return result;
}

/**
 * Renders a frame to the specified texture and returns it.
 * 
 * @param texture 			Texture to render on
 * @param scene	(optional)	Your own scene.
 * @param camera (optional)	Your own camera.
 * @return THREE.RenderTarget
 */
Musketeer.prototype.renderToTexture = function( texture, scene, camera )
{
	scene 		= scene 		|| this.scene;
	camera 		= camera 		|| this.camera;
	
	this.renderer.render( scene, camera, texture );
	
	return texture;
}

/**
 * Starts the rendering
 * @param fps (optional) Framerate
 */
Musketeer.prototype.startRendering = function( fps )
{
	this.render( this, fps || DEFAULT_FPS );
	this.attachRenderToWindowShim( fps || DEFAULT_FPS, this )
	log( 'i rendering started: ' + ( fps || DEFAULT_FPS ) + ' fps');
}

/**
 * Based on Paul Irish blog post: "requestAnimFrame for smart animating"
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * 
 * Attaches the rendering to the browser-specific animation layer.
 * @param fps				Framerate
 * @param object (optional) Musketeer
 */
Musketeer.prototype.attachRenderToWindowShim = function( fps, object )
{
	object = ( object !== undefined ) ? object : this;
	var raf = (	window.requestAnimationFrame       || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function(/* function */ callback, /* DOMElement */ element){
					window.setTimeout(callback, 1000 / fps);
				});
	function r()
	{
		object.render( object, fps );
		raf( r, object.container );
	}r();
}

/**
 * Sets the Hint mode of the current WebGL renderer.
 * @param hintMode (optional) Hint mode
 */
Musketeer.prototype.setWebGLHintMode = function( hintMode )
{
	if( this.renderType == RENDERER_WEBGL )
		this.renderer.context.hint( WEBGL_GENERATE_MIPMAP_HINT, hintMode || WEBGL_HINT_MODE_NICEST );
	else log('e WebGL Hint Mode can not be set if the current renderer is not WebGL based.');
}

///////////////////////////////
//
// LOADER
//
///////////////////////////////

/**
 * Loads a model specified in JSON format.
 *
 * @param path		Model path
 * @param scale 	Model scale
 * @param material 	Custom model material
 */
Musketeer.prototype.loadJSON = function( path, scale, material )
{
	log( 'i load json:' + path + ' scale:' + scale + ' material:'+material )
	var instance = this;
	var loader = new THREE.JSONLoader();
		loader.load( { model: path, callback:function(geometry){instance.load_complete(instance,geometry,scale,material)} })
}

/**
 * Loads a model specified in Binary format.
 *
 * @param path		Model path (path to .js, not .bin)
 * @param scale 	Model scale
 * @param material 	Custom model material
 */
Musketeer.prototype.loadBinary = function( path, scale, material )
{
	log( 'i load binary:' + path + ' scale:' + scale + ' material:'+material )
	var instance = this;
	var loader = new THREE.BinaryLoader( true );
		loader.load( { model: path, callback:function(geometry){instance.load_complete(instance,geometry,scale,material)} });
}

///////////////////////////////
//
// TURNTABLE
//
///////////////////////////////

/**
 * Turns camera turntable feature on or off
 * 
 * @param value Boolean		On or Off
 * @param cameraDistance	Distance from scene center to camera center.
 */
Musketeer.prototype.turntable = function( value, cameraDistance )
{
	if( value )
	{
		this.useTurntable = true;
		this.cameraDistance = cameraDistance || DEFAULT_CAMERA_DISTANCE;
		this.mouse = { inc_x: 0, start_inc_x:0, inc_y: 0, start_inc_y:0, distance:{ x:0, y:0, z:0 } };
		var instance = this;
		this.turntable_mousedown = function( e, object )
		{
			object.mouse.start_inc_x = object.mouse.inc_x;
			object.mouse.start_inc_y = object.mouse.inc_y;
			object.mouse.startX = e.pageX;
			object.mouse.startY = e.pageY;
			object.container.bind( 'mouseup',	function(e){ object.turntable_mouseup(		e, object ); } );
			object.container.bind( 'mousemove',	function(e){ object.turntable_mousemove(	e, object ); } );
		};

		this.turntable_mousemove = function( e, object )
		{
			object.mouse.x 			= e.pageX;
			object.mouse.y 			= e.pageY;
			object.mouse.distance.x = object.mouse.x - object.mouse.startX;
			object.mouse.distance.y = object.mouse.y - object.mouse.startY;
			object.mouse.distance.z	= Musketeer.Utils.distance(object.mouse.x,object.mouse.y,object.mouse.startX,object.mouse.startY);
			object.mouse.inc_x 		= (-object.mouse.distance.x)/(object.viewportWidth/4);
			object.mouse.inc_y 		= (-object.mouse.distance.y)/(object.viewportHeight/4);

			var camDistance = Math.abs(object.cameraDistance * Math.cos( object.mouse.start_inc_y + object.mouse.inc_y ));
			object.camera.position.x = camDistance * Math.sin( object.mouse.start_inc_x + object.mouse.inc_x );
			object.camera.position.z = camDistance * Math.cos( object.mouse.start_inc_x + object.mouse.inc_x );
			object.camera.position.y = -object.cameraDistance * Math.sin( object.mouse.start_inc_y + object.mouse.inc_y );

			if( this.useCameraLight == true)
			{
				object.camera_light.position.x = object.camera.position.x;
				object.camera_light.position.y = object.camera.position.y;
				object.camera_light.position.z = object.camera.position.z;
			}

		};

		this.turntable_mouseup = function( e, object )
		{
			object.mouse.inc_x += object.mouse.start_inc_x;
			object.mouse.inc_y += object.mouse.start_inc_y;
			object.container.unbind( );
			object.container.bind( 'mousedown', function(e){ object.turntable_mousedown( e, object ); } );
		};
		
		this.container.bind( 'mousedown', 	function(e){ instance.turntable_mousedown(	e, instance ); } );
	}
	else
	{
		this.container.unbind();
		this.useTurntable = false;
		delete this.turntable_mousedown;
		delete this.turntable_mousemove;
		delete this.turntable_mouseup;
	}
}

/**
 * Sets the turntable to a specified angle
 *
 * @param angle Angle between scene center and camera.
 * @param y		Camera altitude
 */
Musketeer.prototype.turntable_angle = function( angle, y )
{
	if( this.cameraDistance == undefined )
	{
		log('e Turntable needs to be activated in order to utilize the angle method.');
		return;
	}
	y = y || 30 ;
	this.mouse.inc_x = angle;
	this.mouse.inc_y = y;
	var camDistance = Math.abs(this.cameraDistance * Math.cos( y ) );
	this.camera.position.x = camDistance * Math.sin( angle );
	this.camera.position.z = camDistance * Math.cos( angle );
	this.camera.position.y = -this.cameraDistance * Math.sin( y );

	if( this.useCameraLight == true)
	{
		this.camera_light.position.x = this.camera.position.x;
		this.camera_light.position.y = this.camera.position.y;
		this.camera_light.position.z = this.camera.position.z;
	}
}

///////////////////////////////
//
// INTERNAL UTILS
//
///////////////////////////////

/**
 * Converts a set of coordinates in 3D space
 * to corresponding screen coordinates.
 *
 * @param x	3D position x
 * @param y	3D position y
 * @param z	3D position z
 * @return	Object
 */
Musketeer.prototype.calculateScreenCoords = function( x, y, z )
{
	
	var fov = 1.0 / Math.tan(this.viewAngle/2.0);
	var vector = new THREE.Vector3(x,y,z);
	var _projScreenMatrix = new THREE.Matrix4();
	_projScreenMatrix.multiply( this.camera.projectionMatrix, this.camera.matrixWorldInverse );
	_projScreenMatrix.multiplyVector3( vector );
	vector.x /= 2;
	vector.y /= -2;
	return {x:vector.x*this.viewportWidth+this.viewportWidth/2,y:vector.y*this.viewportHeight+this.viewportHeight/2};
}

Musketeer.prototype.projectVector = function ( v ) 
{
	var _projScreenMatrix = new THREE.Matrix4();
	_projScreenMatrix.multiply( this.camera.projectionMatrix, this.camera.matrixWorldInverse );
	_projScreenMatrix.multiplyVector3( v );
	return v;
};

Musketeer.prototype.unprojectVector = function ( v ) {
	
	var _projScreenMatrix = new THREE.Matrix4();
	_projScreenMatrix.multiply( this.camera.matrixWorld, THREE.Matrix4.makeInvert( this.camera.projectionMatrix ) );
	_projScreenMatrix.multiplyVector3( v );
	return v;
};

///////////////////////////////
//
// SCENE
//
///////////////////////////////

/**
 * Adds an object to the scene
 */
Musketeer.prototype.add = function( object )
{
	var instance = this;
	this.scene.addChild( object );
	if( object.children.length > 0 )
	{
		function addChildren( obj )
		{
			for (var i=0; i < obj.children.length; i++) {
		
				instance.allObjects.push( obj.children[i] )
				addChildren( obj.children[i] );
			};
		}
		addChildren( object )
	}
	else
	{
		this.allObjects.push( object );
	}
	this.children.push( object );
	log( 'i add:' + object );
}

/**
 * Adds an environmental object to the scene.
 */
Musketeer.prototype.addEnvironmental = function( object )
{
	this.scene.addChild( object );
	log( 'i add environmental:' + object );
}

/**
 * Removes an object from the scene
 */
Musketeer.prototype.remove = function( object )
{
	this.scene.removeChild( object );
	this.children.splice( this.children.indexOf( object ), 1 );
	log( 'i remove:' + object );
}

/**
 * Removed all objects added to the scene excluding the 
 * environmental features such as lights.
 */
Musketeer.prototype.removeAllExceptEnvironment = function( )
{
	for (var i=0; i < this.children.length; i++) {
		this.scene.removeChild( this.children[i] );
	};
	this.children = [];
	this.allObjects = [];
	log( 'i remove all except environment' );
}

/**
 * Removes all lights
 */
Musketeer.prototype.removeAllLights = function( )
{
	for (var i=0; i < this.lights.length; i++) {
		this.scene.removeChild( this.lights[i] );
	}
	this.lights = [];
	log( 'i remove all lights' );
}

/**
 * Removes all objects from the scene including lights.
 */
Musketeer.prototype.removeAll = function( )
{
	for (var i=0; i < this.scene.children.length; i++) {
		this.scene.removeChild( this.scene.children[i] );
	};
	this.children = [];
	this.allObjects = [];
	log( 'i remove all' );
}

///////////////////////////////
//
// EVENTS
//
///////////////////////////////

/** Executed prior to a frame render */
Musketeer.prototype.onEnterFrame = function( ) { }

/** Executed post to a frame render */
Musketeer.prototype.onRendered = function( ) { }

/** Executed when a model finished loading */
Musketeer.prototype.onLoadComplete = function( mesh ) { }

///////////////////////////////
//
// INFO
//
///////////////////////////////

/**
 * Exposes the Musketeer
 */
Musketeer.prototype.expose = function( )
{
	log( 'x '+this.toString( ) );
}

/**
 * String representation of the current Musketeer
 * For instant #log, please refer to the 
 * Musketeer#expose() method.
 */
Musketeer.prototype.toString = function( )
{
	return '[Musketeer container=' + this.container + ' width=' + this.viewportWidth + ' height=' + this.viewportHeight + ' viewAngle=' + this.viewAngle + ' near=' + this.near + ' far=' + this.far +']';
}

/**
 * Returns the currently used renderer for WebGL.
 */
Musketeer.prototype.getWebGLRenderer = function( )
{
	return this.getWebGLParameter( WEBGL_RENDERER );
}

/**
 * Returns the currently used Shading language version.
 */
Musketeer.prototype.getWebGLShadingLanguageVersion = function( )
{
	return this.getWebGLParameter( WEBGL_SHADING );
}

/**
 * Returns the currently used vendor of WebGL GPU.
 */
Musketeer.prototype.getWebGLVendor = function( )
{
	return this.getWebGLParameter( WEBGL_VENDOR );
}

/**
 * Returns the currently used WebGL version.
 */
Musketeer.prototype.getWebGLVersion = function( )
{
	return this.getWebGLParameter( WEBGL_VERSION );
}

/**
 * Returns a single WebGL parameter.
 */
Musketeer.prototype.getWebGLParameter = function( parameter )
{
	if( this.renderType == RENDERER_WEBGL )
		return this.renderer.context.getParameter( parameter );
	log( 'w Can not retrieve WebGL parameter when it is not used as the current render type' );
	return null;
}

/**
 * Returns a list of all supported extensions for WebGL.
 */
Musketeer.prototype.getWebGLSupportedExtensions = function( )
{
	return this.renderer.context.getSupportedExtensions( );
}

/**
 * Returns the "best guess" of current GPU
 * Running Firefox will result in "Mozilla" return.
 */
Musketeer.prototype.getGraphicsCard = function( )
{
	return this.getWebGLRenderer().replace( /\s*opengl engine\s*/i,'' );
}

///////////////////////////////
//
// AID
//
///////////////////////////////

/**
 * Constructs and adds an Arrow object to the current scene.
 * Start orientation is as follows:
 *       +y
 *  -z <---- +z
 *       -y
 * w/h/d: 50/50/50
 */
Musketeer.prototype.orientationArrow = function( )
{
	var arrow = new THREE.Object3D( );
		arrow.toString = function( ) { return '[OrientationArrow]'; };
	var cubeMaterial 	= new THREE.MeshPhongMaterial( { wireframe:true, color:0x666666, opacity:0.2 } );
	var coneMaterial 	= new THREE.MeshPhongMaterial( { color:0xCC0000, shading: THREE.SmoothShading  } );
	var cubeMesh 		= new THREE.Mesh( new THREE.CubeGeometry( 50, 50, 50, 2, 2, 2 ), cubeMaterial );
	var pointMesh 		= new THREE.Mesh( new THREE.CylinderGeometry( 12, 6, 0.1, 25 ), coneMaterial);
		pointMesh.position.z = -12.5;
		pointMesh.rotation.y = Math.PI;
	var coneMesh 		= new THREE.Mesh( new THREE.CylinderGeometry( 12, 3, 3, 25 ), coneMaterial);
		coneMesh.position.z = 12.5;
		
	arrow.addChild( cubeMesh );
	arrow.addChild( pointMesh );
	arrow.addChild( coneMesh );
	this.add( arrow );

	return arrow;
}

Musketeer.prototype.traceMouseClick = function( )
{
	var instance = this;
	this.container.bind( 'mousedown', down );
	function down( e )
	{
		var mouse2D = new THREE.Vector3( ( e.pageX / window.innerWidth ) * 2 - 1, - ( e.pageY / window.innerHeight ) * 2 + 1, 0.5 );
		//var mouse2D = new THREE.Vector3( e.pageX-window.innerWidth/2,e.pageY-window.innerHeight/2, 0.5 );
		dumpVector(mouse2D)
		instance.unprojectVector( mouse2D );
		dumpVector(mouse2D)
		var ray = new THREE.Ray( instance.camera.position, mouse2D.subSelf( instance.camera.position).normalize( ) );
		var intersections = ray.intersectObjects( instance.allObjects );
		log('i intersections: ' + intersections)
		if ( intersections.length > 0 )
		{
			dumpVector(intersections[ 0 ].point);
		}
	}
}

/*------------------------------*\
	CLASS END
\*------------------------------*/

Musketeer.Utils = 
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
		dump(parameters)
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

		uniforms[ "uShininess" ].value = parameters.shininess;
		uniforms[ "uOpacity" ].value = parameters.opacity;

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
	},
	/**
	 * Makes a THREE.Mesh able to rotate as a trakball.
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