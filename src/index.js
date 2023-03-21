import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbbbbbb)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-1, 1);
let objects = []

function onPointerMove(event) {

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    console.log(pointer.x, pointer.y)
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

const createTile = (position, isWhite) => {
    const tileGeometry = new THREE.BoxGeometry(1, 0.1, 1)
    const boardMaterialWhite = new THREE.MeshLambertMaterial({ color: 0x997950 })
    const boardMaterialBlack = new THREE.MeshLambertMaterial({ color: 0x2b1700 })

    let material

    if (isWhite) {
        material = boardMaterialWhite
    } else {
        material = boardMaterialBlack
    }

    const tile = new THREE.Mesh(tileGeometry, material)
    tile.position.set(position[0], position[1], position[2])
    scene.add(tile)
    objects.push(tile)

    return tile
}

const createBoard = () => {
    for (let i = -3.5; i <= 3.5; i++) {
        for (let j = -3.5; j <= 3.5; j++) {
            createTile([i, 0, j], (j + i) % 2 === 0)
        }
    }
}

createBoard()


const loader = new GLTFLoader();

// loader.load('meshes/pawn.gltf', function (gltf) {

//     gltf.scene.scale.set(0.2, 0.2, 0.2)
//     gltf.scene.traverse((o) => {
//         if (o.isMesh) o.material = new THREE.MeshLambertMaterial({ color: 0x997950 })
//     })
//     scene.add(gltf.scene);

// }, undefined, function (error) {

//     console.error(error);

// });

const controls = new DragControls( objects, camera, renderer.domElement );

// add event listener to highlight dragged objects

controls.addEventListener( 'dragstart', function ( event ) {

	event.object.material.emissive.set( 0xaaaaaa );

} );

controls.addEventListener( 'dragend', function ( event ) {

	event.object.material.emissive.set( 0x000000 );

} );


const light = new THREE.AmbientLight(0xffffff, 0.6); // soft white light
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xeeeeee, 0.3);
directionalLight.position.set(10, 20, 0)
scene.add(directionalLight);

// camera.position.x = 4;
camera.position.y = 4;
camera.position.z = 6;
camera.lookAt(0, 0, 0);

let INTERSECTED

function animate() {
    requestAnimationFrame(animate);
    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, false);
    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xffffff);

        }

    } else {

        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        INTERSECTED = null;

    }

    window.addEventListener('pointermove', onPointerMove);
    renderer.render(scene, camera);
}
animate();