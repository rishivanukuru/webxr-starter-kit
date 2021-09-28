import * as THREE from '../../libs/three/three.module.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three124/jsm/DRACOLoader.js';

import { FBXLoader } from '../../libs/three/jsm/FBXLoader.js';
import { RGBELoader } from '../../libs/three/jsm/RGBELoader.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { LoadingBar } from '../../libs/LoadingBar.js';

import { ARButton } from '../../libs/ARButton.js';
import { VRButton } from '../../libs/VRButton.js';
import { Stats } from '../../libs/stats.module.js';
import { Player } from '../../libs/Player.js';


class App{
	constructor(){
                
        // Creates a <div> element and adds it to the HTML page.
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        /*
         *   SCENE
         */

        // INITIALIZATION
		this.scene = new THREE.Scene();
        
        // AMBIENT LIGHT
		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
        ambient.position.set( 0.5, 1, 0.25 );
		this.scene.add(ambient);

        // DIRECTIONAL LIGHT
        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );

        /*
         *   CAMERA
         */
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20  );
        this.camera.position.set(0, 1.6, 10);
        

		/*
         *   RENDERER
         */	
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;        
		container.appendChild( this.renderer.domElement );
        
        // Orbit Control for non-XR mode
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 1.6, 0);
        this.controls.update();    
        
        // Clock to sync hits and animation
        this.clock = new THREE.Clock();
        
        // Utilities for the hit-test API
        this.raycaster = new THREE.Raycaster();
        this.workingMatrix = new THREE.Matrix4();
        this.workingVector = new THREE.Vector3();

        this.hitTestSource = null;
        this.hitTestSourceRequested = false;

        const self = this;


        // Function that is called whenever the controller button is pressed
        function onSelect() {

            if ( self.reticle.visible ) {

                self.food.position.setFromMatrixPosition( self.reticle.matrix );
                // const material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
                // const mesh = new THREE.Mesh( geometry, material );
                // mesh.position.setFromMatrixPosition( self.reticle.matrix );
                // mesh.scale.y = Math.random() * 2 + 1;
                // self.scene.add( mesh );

            }

        }

        // Creates a controller instance
        this.controller = this.renderer.xr.getController( 0 );
        this.controller.addEventListener( 'select', onSelect );
        this.scene.add( this.controller );

        // Create a reticle for placement
        this.reticle = new THREE.Mesh(
            new THREE.RingGeometry( 0.15, 0.2, 32 ).rotateX( - Math.PI / 2 ),
            new THREE.MeshBasicMaterial()
        );
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add( this.reticle );
        
        this.initScene();

        this.setupXR();
        this.renderer.setAnimationLoop( this.render.bind(this) );        
        window.addEventListener('resize', this.resize.bind(this) );
        
	}	

    initScene(){
        this.loadingBar = new LoadingBar();
        this.loadGLTFDRACO();

    }

    loadGLTF()
    {
        // Set asset path
        const loader = new GLTFLoader().setPath('../../assets/3dmeta/');
        const self = this;
		
		// Load a GLTF resource
		loader.load(
			// resource URL
			"burger1.glb",
			// called when the resource is loaded
			function ( gltf ) {

				
				self.food = gltf.scene;

                self.food.position.set(0,-2,1);                
				self.food.scale.set(0.4, 0.4, 0.4); 
                self.scene.add( self.food ); 

                self.loadingBar.visible = false;
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);

			},
			// called when loading has errors
			function ( error ) {

				console.log( 'An error happened' );

			}
		);
    }

    loadGLTFDRACO(){
        const loader = new GLTFLoader( ).setPath('../../assets/3dmeta/');;
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../libs/three/js/draco/' );
        loader.setDRACOLoader( dracoLoader );
        
        const self = this;
		
		// Load a glTF resource
		loader.load(
			// resource URL
			"burger1.glb",
			// called when the resource is loaded
			function ( gltf ) {
                self.food = gltf.scene;

                self.food.position.set(0,-2,1);                
				self.food.scale.set(0.4, 0.4, 0.4); 
                self.scene.add( self.food ); 

                self.loadingBar.visible = false;
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
				
			},
			// called when loading has errors
			function ( error ) {

				console.log( 'An error happened' );

			}  
        );
    }

    
    
    
    setupXR(){
        this.renderer.xr.enabled = true;        
        const button = new ARButton( this.renderer, { sessionInit: { requiredFeatures: [ 'hit-test' ], optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } );
        
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( timestamp, frame ) {

        const dt = this.clock.getDelta();


        const self= this;

        if ( frame ) {

            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const session = this.renderer.xr.getSession();

            if ( this.hitTestSourceRequested === false ) {

                session.requestReferenceSpace( 'viewer' ).then( function ( referenceSpace ) {

                    session.requestHitTestSource( { space: referenceSpace } ).then( function ( source ) {

                        self.hitTestSource = source;

                    } );

                } );

                session.addEventListener( 'end', function () {

                    self.hitTestSourceRequested = false;
                    self.hitTestSource = null;

                } );

                this.hitTestSourceRequested = true;

            }

            if ( this.hitTestSource ) {

                const hitTestResults = frame.getHitTestResults( this.hitTestSource );

                if ( hitTestResults.length ) {

                    const hit = hitTestResults[ 0 ];

                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray( hit.getPose( referenceSpace ).transform.matrix );

                } else {

                    this.reticle.visible = false;

                }

            }

        }

        this.renderer.render( this.scene, this.camera );

    }

}

export { App };