import * as THREE from 'three';
import * as WHS from 'whs';
import TWEEN from '@tweenjs/tween.js';
import APPCONFIG, { isDev } from '../AppConfig';
import Skis from '../components/Skis';

// e.g. physics.applyCentralImpulse(v)
// applyImpulse
// applyTorque
// applyCentralForce
// applyForce
// setAngularVelocity
// setLinearVelocity
// setLinearFactor
// setDamping

class Controls {
  constructor({
		scene, 
		camera, 
		mesh, 
		enabled, 
		light, 
		skybox, 
		clippingPlane,
		track,
		params = { 
			speed: 250, 
			retardation: 30,
			turnFactor: 1
	  },
	}) {
		this.camera = camera;
		this.mesh = mesh;
		this.params = params;
		this.enabled = enabled;
		this.skybox = skybox;
		this.light = light;
		this.skis;
		this.track = track;
		this.velocityFactor = 1;
		this.clippingPlane = clippingPlane;
		this.scene = scene;
		//this.mesh.use('physics').setAngularFactor({ x: 0, y: 0, z: 0 });
	// distance from physics sphere
		this.camera.position.set(0, 10, 22 );

		
		/* Init */
		const player = this.mesh;
		player.position = APPCONFIG.startPosition;
		this.physics = player.use('physics');

		// for dev so we can see the target
		this.targetObject = new THREE.Mesh(
			new THREE.SphereBufferGeometry(0.2,1,8)
		);
		
		this.yawObject = new THREE.Object3D();
		this.yawObject.position.set(APPCONFIG.startPosition.x,APPCONFIG.startPosition.y,APPCONFIG.startPosition.z);
		this.yawObject.add(this.camera.native);
		this.camera.native.lookAt(0,-20,-60)

		this.scene.add(this.yawObject);
		console.log(this.camera.native)

		if (isDev) {
			const helper = new THREE.CameraHelper( this.camera.native );
			this.scene.add( helper );
		}

		//this.camera.native.lookAt(0,-10,0)
		//this.camera.native.target = this.targetObject;

		let vN = this.physics.getLinearVelocity().clone();
		vN.normalize();
		var origin = player.position;
		var length = 100;
		var hex = 0xffff00;

		// this.arrowHelper = new THREE.ArrowHelper( vN, origin, length, hex );
		// this.scene.add( this.arrowHelper );
		
		// this.yawObject.position.y = this.params.ypos; // eyes are 2 meters above the ground
		if (isDev) this.scene.add(this.targetObject)
		
		this.quat = new THREE.Quaternion();
		
		this.createSkis();

		this.tRight = new TWEEN.Tween(this.yawObject.rotation)
		.to({z: -0.5}, 1000 )
		.onUpdate(() => {})
	//	.easing( TWEEN.Easing.Linear.None)
		.easing( TWEEN.Easing.Sinusoidal.In )


		this.tLeft = new TWEEN.Tween(this.yawObject.rotation)
		.to({z: 0.5}, 600 )
		.onUpdate(() => {})
		//.easing( TWEEN.Easing.Linear.None)
		.easing( TWEEN.Easing.Sinusoidal.In )


		this.tReturn = new TWEEN.Tween(this.yawObject.rotation)
		.to({z: 0}, 600 )
		.onUpdate(() => {})
		.easing( TWEEN.Easing.Linear.None)

		this.scene.add(this.yawObject);
		
		// Moves.
		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;
		
		this.addListeners(player)
  }

  createSkis() {
		this.skis = Skis(this.track, this.scene);
		this.yawObject.add(this.skis);

	//this.skis.add(this.camera.native)
	}
 
  enableTracking(isEnabled) {
		this.enabled = isEnabled;
		//this.physics.setLinearVelocity(0,0,-0.1)
  }

	addListeners = (player) => {
	   // document.addEventListener('mousemove', this.onMouseMove, false);
		document.addEventListener('keydown', this.onKeyDown, false);
		document.addEventListener('keyup', this.onKeyUp, false);
		player.on('collision', (otherObject, v, r, contactNormal) => {
		//console.log(contactNormal.y);
			if (contactNormal.y < 0.5) {// Use a "good" threshold value between 0 and 1 here!
			  //canJump = true;
			}
		});
  
		///player.on('physics:added', () => {
		player.manager.get('module:world').addEventListener('update', () => {
			if (this.enabled === false) return;
			this.yawObject.position.copy({x:player.position.x, y:player.position.y, z:player.position.z});
		});
		//});
	}

	update = delta => {
		if (this.enabled === false) {
			return;
		}
		//  NOT SURE YET
		delta = delta || 0.5;
		delta = Math.min(delta, 0.1, delta);

	// set the speed
		const inputVelocity = new THREE.Vector3();
		inputVelocity.set(0, 0, 0);
		let speed = this.velocityFactor * delta * this.params.speed;

		if (this.moveLeft) {
			inputVelocity.x = -speed;
			inputVelocity.z = speed * this.params.turnFactor;
		}
		if (this.moveRight) {
			inputVelocity.x = speed;
			inputVelocity.z = speed * this.params.turnFactor;
		}

	// Convert velocity to world coordinates
		const euler = new THREE.Euler();
		euler.x = this.yawObject.rotation.x;
		euler.y = this.yawObject.rotation.y;
		euler.order = 'XYZ';
		this.quat.setFromEuler(euler);

	//	console.log(this.yawObject.position.z)

		const vN = this.physics.getLinearVelocity().clone();
		vN.normalize();

	// dev targetObject
		const pos = this.yawObject.position.clone();
		let lookAt = new THREE.Vector3(pos.x + vN.x, pos.y + vN.y, pos.z + vN.y)
		this.targetObject.position.set(lookAt.x,lookAt.y + 10,lookAt.z)

	//  camera
		this.camera.native.lookAt(0,2.5,0)
		this.camera.native.position.x = - this.skis.rotation.toVector3().y * 25;
		this.camera.native.position.y = this.skis.rotation.toVector3().x + 10;

	// ski rotation
		this.skis.lookAt(vN.clone())
		this.skis.children[0].rotation.z = this.skis.children[1].rotation.z = -this.yawObject.rotation.z;
		this.skis.children[0].position.y = Math.min(0, - this.yawObject.rotation.z *4 ) - 4.9
		this.skis.children[1].position.y = Math.min(0, this.yawObject.rotation.z * 4) - 4.9


		//console.log(this.yawObject.rotation.z,Math.min(0, - this.yawObject.rotation.z *4 ),Math.min(0, this.yawObject.rotation.z * 4))
	// move the light and lightshadow with object
		this.updateLightsAndSkybox();
	// make sure TWEEN gets updates
		TWEEN.update();
	// update clipping
		this.clippingPlane.constant = - this.yawObject.position.z + APPCONFIG.clipDistance;

		inputVelocity.applyQuaternion(this.quat);

		this.physics.applyCentralImpulse({ x: inputVelocity.x, y: 0, z:inputVelocity.z});// z:inputVelocity.z ??
	
		if (!this.physics.data.touches[0]) {
			console.log('jump!')
		}
	// stop things getting sillyfast
		if (this.physics.getLinearVelocity().clone().z < -350) {
			this.physics.applyCentralImpulse({ x: inputVelocity.x, y: 0, z: this.params.retardation});
		}        
		//this.physics.setAngularVelocity({ x: inputVelocity.z, y: 0, z: -inputVelocity.x });
		//this.physics.setAngularFactor({ x: 0, y: 0, z: 0 });
	}

	updateLightsAndSkybox() {
	// move the light and lightshadow with object
		this.shadowCamera = this.light.shadow.camera;
		const posn = this.yawObject.position.clone();
		this.light.position.set(
			posn.x + APPCONFIG.lightPosition.x, 
			posn.y + APPCONFIG.lightPosition.y, 
			posn.z + APPCONFIG.lightPosition.z)
		this.light.target = this.yawObject;

		this.skybox.position.x = posn.x + APPCONFIG.skyboxPosition.x;
		this.skybox.position.y = posn.y + APPCONFIG.skyboxPosition.y;
		this.skybox.position.z = posn.z + APPCONFIG.skyboxPosition.z;

	}


	displaySpeed = () => {
		return this.physics.getLinearVelocity().clone().length();
	}

	onMouseMove = (event) => {
		if (this.enabled === false) return;

		const PI_2 = Math.PI/2;
	
		let movementX = typeof event.movementX === 'number' ? event.movementX : typeof event.mozMovementX === 'number' ? event.mozMovementX : typeof event.getMovementX === 'function' ? event.getMovementX() : 0;
		let movementY = typeof event.movementY === 'number' ? event.movementY : typeof event.mozMovementY === 'number' ? event.mozMovementY : typeof event.getMovementY === 'function' ? event.getMovementY() : 0;
	
		//this.yawObject.rotation.y -= movementX * 0.001;
	   // this.pitchObject.rotation.x -= movementY * 0.001;
	}

	onKeyDown = (event) => {
		//console.log(event.keyCode)
		switch (event.keyCode) {
			case 38: // up
			case 87:
				// w
				this.moveForward = true;
				break;

			case 37: // left
			case 65:
				// a
				this.tReturn.stop();
				this.tLeft.start();
				this.moveLeft = true;
				break;

			case 40: // down
			case 83:
				// s
				this.moveBackward = true;
				break;

			case 39: // right
			case 68:
				// d
				this.tReturn.stop();
				this.tRight.start();
				this.moveRight = true;
				break;

			// case 32:
			//     // space
			//     console.log(canJump);
			//     if (canJump === true) physics.applyCentralImpulse({ x: 0, y: 300, z: 0 });
			//     canJump = false;
			//     break;

			// case 16:
			//     // shift
			//     this.runVelocity = 0.5;
			//     break;

			default:
		}
	}

	onKeyUp = (event) => {
		switch (event.keyCode) {
		case 38: // up
		case 87:
			// w
			this.moveForward = false;
			break;

		case 37: // left
		case 65:
			// a
			this.tRight.stop()
			this.tLeft.stop() 
			this.tReturn.start();
			this.moveLeft = false;
			break;

		case 40: // down
		case 83:
			// a
			this.moveBackward = false;
			break;

		case 39: // right
		case 68:
			// d
			this.tRight.stop()
			this.tLeft.stop()


			this.tReturn.start();
			this.moveRight = false;
			break;

		// case 16:
		//     // shift
		//     this.runVelocity = 0.25;
		//     break;

		default:
		}
	};
}

export default Controls
