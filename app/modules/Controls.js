import * as THREE from 'three';
import * as WHS from 'whs';

class Controls {
    constructor(scene, camera, mesh, params = { ypos: 0 , speed: 10 }) {
        this.camera = camera;
        this.mesh = mesh;
        this.params = params;
        this.enabled = true;
  
        this.velocityFactor = 1;
      
        this.mesh.use('physics').setAngularFactor({ x: 0, y: 0, z: 0 });
        this.camera.position.set(0, 0, 0);
      
        /* Init */
        const player = this.mesh;
        this.physics = player.use('physics');

        this.pitchObject = new THREE.Object3D();
      
        this.pitchObject.add(camera.native);
      
        this.yawObject = new THREE.Object3D();
        scene.add(this.yawObject);
      
        this.yawObject.position.y = this.params.ypos; // eyes are 2 meters above the ground
        this.yawObject.add(this.pitchObject);
      
        this.quat = new THREE.Quaternion();


      
        let canJump = false;
      
        // Moves.
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
      
        player.on('collision', (otherObject, v, r, contactNormal) => {
          console.log(contactNormal.y);
          if (contactNormal.y < 0.5) {// Use a "good" threshold value between 0 and 1 here!
            canJump = true;
          }
        });

        console.log(this.yawObject);

        this.addListeners();

        player.on('physics:added', () => {
            player.manager.get('module:world').addEventListener('update', () => {
            if (this.enabled === false) return;
            this.yawObject.position.copy(player.position);
            });
        });
    
    }

    addListeners() {
        document.addEventListener('mousemove', this.onMouseMove, false);
        document.addEventListener('keydown', this.onKeyDown, false);
        document.addEventListener('keyup', this.onKeyUp, false);
    }

    getDirection(targetVec) {
        targetVec.set(0, 0, -1);
        this.quat.multiplyVector3(targetVec);
    }

    update = delta => {
        if (this.enabled === false) return;

        delta = delta || 0.5;
        delta = Math.min(delta, 0.5, delta);

        const inputVelocity = new THREE.Vector3();
        inputVelocity.set(0, 0, 0);
        const euler = new THREE.Euler();


        var speed = this.velocityFactor * delta * this.params.speed;
        //console.log({speed})

        if (this.moveForward) inputVelocity.z = -speed;
        if (this.moveBackward) inputVelocity.z = speed;
        if (this.moveLeft) inputVelocity.x = -speed;
        if (this.moveRight) inputVelocity.x = speed;

        // Convert velocity to world coordinates
        euler.x = this.pitchObject.rotation.x;
        euler.y = this.yawObject.rotation.y;
        euler.order = 'XYZ';


        this.quat.setFromEuler(euler);

        console.log(this.physics.getLinearVelocity().z)
        const zVelocity = this.physics.getLinearVelocity().z;
        //this.camera.native.lookAt(this.physics.getLinearVelocity())
        this.camera.native.rotation.z = -inputVelocity.x/50;

        inputVelocity.applyQuaternion(this.quat);

        this.physics.applyCentralImpulse({ x: inputVelocity.x, y: 0, z: inputVelocity.z});
        if (zVelocity < -50) {
            //this.physics.setLinearVelocity({...this.physics.getLinearVelocity(), z: -50})
        }
        
        //this.physics.setAngularVelocity({ x: inputVelocity.z, y: 0, z: -inputVelocity.x });
        //this.physics.setAngularFactor({ x: 0, y: 0, z: 0 });
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





const Controleee = (camera, mesh, params = { ypos: 0 , speed: 0 }) => {
    var _this = this;
  
    var velocityFactor = 1;
    var runVelocity = 0.25;
  
    mesh.use('physics').setAngularFactor({ x: 0, y: 0, z: 0 });
    camera.position.set(0, 0, 0);
  
    /* Init */
    var player = mesh,
        pitchObject = new THREE.Object3D();
  
    pitchObject.add(camera.native);
  
    var yawObject = new THREE.Object3D();
  
    yawObject.position.y = params.ypos; // eyes are 2 meters above the ground
    yawObject.add(pitchObject);
  
    var quat = new THREE.Quaternion();
  
    var canJump = false,
  
    // Moves.
    moveForward = false,
        moveBackward = false,
        moveLeft = false,
        moveRight = false;
  
    player.on('collision', function (otherObject, v, r, contactNormal) {
      console.log(contactNormal.y);
      if (contactNormal.y < 0.5) // Use a "good" threshold value between 0 and 1 here!
        canJump = true;
    });
  
    var onMouseMove = function onMouseMove(event) {
      if (_this.enabled === false) return;
  
      var movementX = typeof event.movementX === 'number' ? event.movementX : typeof event.mozMovementX === 'number' ? event.mozMovementX : typeof event.getMovementX === 'function' ? event.getMovementX() : 0;
      var movementY = typeof event.movementY === 'number' ? event.movementY : typeof event.mozMovementY === 'number' ? event.mozMovementY : typeof event.getMovementY === 'function' ? event.getMovementY() : 0;
  
      yawObject.rotation.y -= movementX * 0.002;
      pitchObject.rotation.x -= movementY * 0.002;
  
      pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    };
  
    var physics = player.use('physics');

    var onKeyDown = function onKeyDown(event) {
        switch (event.keyCode) {
        case 38: // up
        case 87:
            // w
            moveForward = true;
            break;

        case 37: // left
        case 65:
            // a
            moveLeft = true;
            break;

        case 40: // down
        case 83:
            // s
            moveBackward = true;
            break;

        case 39: // right
        case 68:
            // d
            moveRight = true;
            break;

        case 32:
            // space
            console.log(canJump);
            if (canJump === true) physics.applyCentralImpulse({ x: 0, y: 300, z: 0 });
            canJump = false;
            break;

        case 16:
            // shift
            runVelocity = 0.5;
            break;

        default:
        }
    };

    var onKeyUp = function onKeyUp(event) {
        switch (event.keyCode) {
        case 38: // up
        case 87:
            // w
            moveForward = false;
            break;

        case 37: // left
        case 65:
            // a
            moveLeft = false;
            break;

        case 40: // down
        case 83:
            // a
            moveBackward = false;
            break;

        case 39: // right
        case 68:
            // d
            moveRight = false;
            break;

        case 16:
            // shift
            runVelocity = 0.25;
            break;

        default:
        }
    };

    document.body.addEventListener('mousemove', onMouseMove, false);
    document.body.addEventListener('keydown', onKeyDown, false);
    document.body.addEventListener('keyup', onKeyUp, false);

    //this.enabled = false;
    this.getObject = function () {
        return yawObject;
    };

    this.getDirection = function (targetVec) {
        targetVec.set(0, 0, -1);
        quat.multiplyVector3(targetVec);
    };

    // Moves the camera to the Physi.js object position
    // and adds velocity to the object if the run key is down.
    var inputVelocity = new THREE.Vector3(),
        euler = new THREE.Euler();

    this.update = function (delta) {
        if (_this.enabled === false) return;

        delta = delta || 0.5;
        delta = Math.min(delta, 0.5, delta);

        inputVelocity.set(0, 0, 0);

        var speed = velocityFactor * delta * params.speed * runVelocity;

        if (moveForward) inputVelocity.z = -speed;
        if (moveBackward) inputVelocity.z = speed;
        if (moveLeft) inputVelocity.x = -speed;
        if (moveRight) inputVelocity.x = speed;

        // Convert velocity to world coordinates
        euler.x = pitchObject.rotation.x;
        euler.y = yawObject.rotation.y;
        euler.order = 'XYZ';

        quat.setFromEuler(euler);

        inputVelocity.applyQuaternion(quat);

        physics.applyCentralImpulse({ x: inputVelocity.x, y: 0, z: inputVelocity.z });
        physics.setAngularVelocity({ x: inputVelocity.z, y: 0, z: -inputVelocity.x });
        physics.setAngularFactor({ x: 0, y: 0, z: 0 });
    };

    player.on('physics:added', function () {
        player.manager.get('module:world').addEventListener('update', function () {
        if (_this.enabled === false) return;
        yawObject.position.copy(player.position);
        });
    });
}

export default Controls;