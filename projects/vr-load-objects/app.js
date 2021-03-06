import * as THREE from '../../libs/three/three.module.js';
import { GLTFLoader } from '../../libs/three/jsm/GLTFLoader.js';
import { FBXLoader } from '../../libs/three/jsm/FBXLoader.js';
import { DRACOLoader } from '../../libs/three/jsm/DRACOLoader.js';
import { RGBELoader } from '../../libs/three/jsm/RGBELoader.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { VRButton } from '../../libs/VRButton.js';
import { Stats } from '../../libs/stats.module.js';

class App {
    constructor() {

        // Creates a <div> element and adds it to the HTML page.
        const container = document.createElement('div');
        document.body.appendChild(container);

        /*
         *   SCENE
         */

        // INITIALIZATION
        this.scene = new THREE.Scene();

        // LIGHTING
        // Create an ambient light and add it to the scene.
        // Parameters: Sky color, Ground color, intensity
        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
        this.scene.add(ambient);

        // Create a directional light and add it to the scene
        // Parameters: Light Color
        // The light target is the origin by default.
        const light = new THREE.DirectionalLight(0xffffff);

        // Moves the source of the light to a given position.
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);

        // OBJECTS
        // Define a Box Geometry
        // const geometry = new THREE.BoxBufferGeometry();
        // Define a basic material with color Red
        // const material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
        // Create a new mesh using the geometry and material
        // this.mesh = new THREE.Mesh(geometry, material);
        // Move the mesh to a new position
        // this.mesh.position.set(0, 1, -3);
        // Add the mesh to the scene
        // this.scene.add(this.mesh);

        /*
         *   CAMERA
         */

        // INITIALIZE
        // Create a new camera
        // Parameters: Field of View, Aspect Ratio, Inner Clipping Plane, Outer Clipping Plane
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 500);
        // Set the position of the camera
        this.camera.position.set(0, 1.6, 3);

        /*
         *   RENDERER
         */

        // INITIALIZE
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Add the renderer to the initial container that will display on the HTML page
        container.appendChild(this.renderer.domElement);

        /*
        *   ADDITIONAL TOOLS
        */

        // ORBIT CONTROLS for non-XR view
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 1.6, 0);
        this.controls.update();

        // STATS for XR
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        /*
         *  MAIN FUNCTION CALL
         */

        // Initialize Scene
        this.initScene();


        // Window resize handler
        window.addEventListener('resize', this.resize.bind(this));

    }

    initScene() {

        // All the steps that need to be done for the scene to start are included here.
        this.loadGLTF();

    }

    setupXR() {
        // Enable XR
        this.renderer.xr.enabled = true;

        // Create a button to allow the user to enter VR
        const button = new VRButton(this.renderer);

        // Set the animation loop function
        this.renderer.setAnimationLoop(this.render.bind(this));
    }

    render() {
        // Update the frame statistics   
        this.stats.update();

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    // Handles window resizing
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    loadGLTF(){

        // Set asset path
        const loader = new GLTFLoader( ).setPath('../../assets/gltf/cave/');
        const self = this;
		
		// Load a glTF resource
		loader.load(

			// resource URL
			"cave.gltf",
			// called when the resource is loaded
			function ( gltf ) {
                
                self.space = gltf.scene;

                // Change Position
                // gltf.scene.position.set(0,0,0);
                // Change Rotation
                // gltf.scene.position.set(0,0,0);
                // Change Scale
                // gltf.scene.scale.set(1,1,1);
                
				self.scene.add( gltf.scene );
                
                // self.loadingBar.visible = false;
                self.setupXR();
				
            },
			// called while loading is progressing
			function ( xhr ) {
				
			},
			// called when loading has errors
			function ( error ) {

				console.log( 'An error happened' );


			}  
        );
    }
    


}

export { App };