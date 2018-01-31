import * as THREE from 'three';
import * as WHS from 'whs';
import TWEEN from '@tweenjs/tween.js';

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
    constructor({scene, camera, mesh, enabled, light, skybox, params = { ypos: 1 , speed: 15 }}) {
        this.camera = camera;
        this.mesh = mesh;
        this.params = params;
        this.enabled = enabled;
        this.skybox = skybox;
        this.light =  light
        this.skis;
  
        this.velocityFactor = 1;
      
        this.mesh.use('physics').setAngularFactor({ x: 0, y: 0, z: 0 });
        this.camera.position.set(0, 0, 0);
      
        /* Init */
        const player = this.mesh;
        this.physics = player.use('physics');

        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(this.camera.native);
      
        this.yawObject = new THREE.Object3D();
        scene.add(this.yawObject);
      
       // this.yawObject.position.y = this.params.ypos; // eyes are 2 meters above the ground
        this.yawObject.add(this.pitchObject);
      
        this.quat = new THREE.Quaternion();
        
        this.createSkis();


        var position = { x : 0, y: 300 };
       // var target = { x : 400, y: 50 };
        const rotation = 0;
        const target = 0.25;
        
        // this.tween = new TWEEN.Tween(rotation).to(target, 1000)
        // .onUpdate(function() { // Called after tween.js updates 'coords'.
        // // Move 'box' to the position described by 'coords' with a CSS translation.
        //    // box.style.setProperty('transform', 'translate(' + coords.x + 'px, ' + coords.y + 'px)');
        //     this.yawObject.rotation.z = rotation
        //     console.log({rotation})
        // })

        scene.add(this.yawObject);

        let canJump = false;
      
        // Moves.
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
      
        this.addListeners(player)
    
    }

    createSkis() {
        // skis
        const skiGeo = new THREE.BoxBufferGeometry(2,0.2,60);
        const skiMaterial = new THREE.MeshPhongMaterial({color: 0xffff00, side: THREE.DoubleSide})


        const skiL = new THREE.Mesh(skiGeo, skiMaterial)
        const skiR = new THREE.Mesh(skiGeo, skiMaterial)

        skiL.castShadow = true;
        skiR.castShadow = true;


        skiL.position.x = -1.5;
        skiR.position.x = 1.5;
        this.skis = new THREE.Object3D();
        this.skis.add(skiL);
        this.skis.add(skiR);

        this.skis.position.y = this.params.ypos -4.5;
        //this.skis.rotation.x = -0.2;
        this.yawObject.add(this.skis)


        //console.log(thi)

    }

    enableTracking(isEnabled) {
        this.enabled = isEnabled;
        //this.physics.setLinearVelocity(0,0,-0.1)
    }

    addListeners(player) {
       // document.addEventListener('mousemove', this.onMouseMove, false);
        document.addEventListener('keydown', this.onKeyDown, false);
        document.addEventListener('keyup', this.onKeyUp, false);
        player.on('collision', (otherObject, v, r, contactNormal) => {
        //console.log(contactNormal.y);
            if (contactNormal.y < 0.5) {// Use a "good" threshold value between 0 and 1 here!
              //canJump = true;
            }
        });
  
        player.on('physics:added', () => {
            player.manager.get('module:world').addEventListener('update', () => {
            if (this.enabled === false) return;
            this.yawObject.position.copy(player.position);
            this.yawObject.position.y = this.yawObject.position.y + this.params.ypos
            
            });
        });
    }

    getDirection(targetVec) {
        targetVec.set(0, 0, -1);
        this.quat.multiplyVector3(targetVec);
    }

    update = delta => {
        if (this.enabled === false) return;

        delta = delta || 0.5;
        delta = Math.min(delta, 0.5, delta);

    // set the speed
        const inputVelocity = new THREE.Vector3();
        inputVelocity.set(0, 0, 0);
        let speed = this.velocityFactor * delta * this.params.speed;

        if (this.moveForward) inputVelocity.z = -speed;
        if (this.moveBackward) inputVelocity.z = speed;
        if (this.moveLeft) inputVelocity.x = -speed;
        if (this.moveRight) inputVelocity.x = speed;

    // Convert velocity to world coordinates
        const euler = new THREE.Euler();
        euler.x = this.pitchObject.rotation.x;
        euler.y = this.yawObject.rotation.y;
        euler.order = 'XYZ';
        this.quat.setFromEuler(euler);

        const vN = this.physics.getLinearVelocity().clone();
        vN.normalize()

        if (this.physics.getLinearVelocity() < 1) inputVelocity.z = 5;
        const pos = this.yawObject.position.clone();
        this.camera.native.lookAt(pos.x + vN.x, pos.y + vN.y, pos.z + vN.y)
        this.skis.lookAt(pos.x + vN.x, pos.y + vN.y, pos.z + vN.y)

        
        this.yawObject.rotation.z = -inputVelocity.x/70

       // if (this.moveRight) this.tween.start();
        //TWEEN.update(delta);

        this.skis.children[0].rotation.z = this.skis.children[1].rotation.z = inputVelocity.x/20;

        // move the light and lightshadow with object
        this.updateLights()


        inputVelocity.applyQuaternion(this.quat);

        this.physics.applyCentralImpulse({ x: inputVelocity.x, y: 0, z: inputVelocity.z});

        if (this.physics.getLinearVelocity().clone().z < -80) {
            //this.physics.setLinearVelocity({...this.physics.getLinearVelocity(), z: -50})
            this.physics.applyCentralImpulse({ x: inputVelocity.x, y: 0, z: 10});
        }        
        //this.physics.setAngularVelocity({ x: inputVelocity.z, y: 0, z: -inputVelocity.x });
        //this.physics.setAngularFactor({ x: 0, y: 0, z: 0 });
    }

    updateLights() {
        // move the light and lightshadow with object
        this.shadowCamera = this.light.shadow.camera;
        const posn = this.yawObject.position.clone()
        this.light.position.set(posn.x+50, posn.y+50, posn.z - 15)
        this.light.target = this.yawObject

       // const posn = this.yawObject.position.clone()
        console.log(posn)
        this.skybox.position.z = posn.z -400;
        this.skybox.position.y = posn.y -100;
        this.skybox.position.x = posn.x;
        console.log(this.skybox)
    }


    displaySpeed = () => {
        return this.physics.getLinearVelocity().clone().length()
    }

    onMouseMove = (event) => {
        if (this.enabled === false) return;

        const PI_2 = Math.PI/2;
    
        let movementX = typeof event.movementX === 'number' ? event.movementX : typeof event.mozMovementX === 'number' ? event.mozMovementX : typeof event.getMovementX === 'function' ? event.getMovementX() : 0;
        let movementY = typeof event.movementY === 'number' ? event.movementY : typeof event.mozMovementY === 'number' ? event.mozMovementY : typeof event.getMovementY === 'function' ? event.getMovementY() : 0;
    
        //this.yawObject.rotation.y -= movementX * 0.001;
       // this.pitchObject.rotation.x -= movementY * 0.001;
    
        //this.pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitchObject.rotation.x));
    }


    
    onKeyDown = (event) => {
        //console.log(event.keyCode)
        switch (event.keyCode) {
            case 38: // up
            case 87:
                // w
                this.moveForward = true;
                console.log('t',this.moveForward)
                break;

            case 37: // left
            case 65:
                // a
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
