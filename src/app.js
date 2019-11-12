import * as THREE from './three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
// import { DecalGeometry } from './jsm/geometries/DecalGeometry.js';

var container = document.getElementById( 'container' );
var renderer, scene, camera, mesh;
var raycaster;
var line;
var intersection = {
    intersects: false,
    point: new THREE.Vector3(),
    normal: new THREE.Vector3()
};
var mouse = new THREE.Vector2();
var textureLoader = new THREE.TextureLoader();
var points = [];
var s = new THREE.Raycaster;
var ambientLight;

// var decalDiffuse = textureLoader.load( 'textures/decal/decal-diffuse.png' );
// var decalNormal = textureLoader.load( 'textures/decal/decal-normal.jpg' );

// var decalMaterial = new THREE.MeshPhongMaterial( {
//     specular: 0x444444,
//     map: decalDiffuse,
//     normalMap: decalNormal,
//     normalScale: new THREE.Vector2( 1, 1 ),
//     shininess: 30,
//     transparent: true,
//     depthTest: true,
//     depthWrite: false,
//     polygonOffset: true,
//     polygonOffsetFactor: - 4,
//     wireframe: false
// } );

// var decals = [];
var mouseHelper;
// var position = new THREE.Vector3();
// var orientation = new THREE.Euler();
// var size = new THREE.Vector3( 10, 10, 10 );
// var params = {
//     minScale: 10,
//     maxScale: 20,
//     rotate: true,
//     clear: function () {
//         removeDecals();
//     }
// };


window.addEventListener( 'load', init );

function init() {

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 120;
    camera.target = new THREE.Vector3();
    var controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 50;
    controls.maxDistance = 200;

    ambientLight = new THREE.AmbientLight( 0x443333 );
    scene.add( ambientLight );
    
    var light = new THREE.DirectionalLight( 0xffddcc, 1 );
    light.position.set( 1, 0.75, 0.5 );
    scene.add( light );

    var light = new THREE.DirectionalLight( 0xccccff, 1 );
    light.position.set( - 1, 0.75, - 0.5 );
    scene.add( light );

    var geometry = new THREE.BufferGeometry();
    geometry.setFromPoints( [ new THREE.Vector3(), new THREE.Vector3() ] );

    line = new THREE.Line( geometry, new THREE.LineBasicMaterial() );
    scene.add( line );

    loadLeePerrySmith();

    raycaster = new THREE.Raycaster();
    mouseHelper = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 10 ), new THREE.MeshNormalMaterial() );
    mouseHelper.visible = false;
    scene.add( mouseHelper );

    controls.addEventListener("change", function() {

    });

    window.addEventListener( 'resize', onWindowResize, false );

    var moved = false;
    controls.addEventListener( 'change', function () {
        moved = true;
    });


    window.addEventListener( 'mousedown', function () {
        moved = false;
    },false);


    window.addEventListener( 'mouseup', function () {
       
        checkIntersection();
        //if ( ! moved && intersection.intersects ) shoot();
    });


    window.addEventListener( 'mousemove', onTouchMove );
    window.addEventListener( 'touchmove', onTouchMove );
    function onTouchMove( event ) {
        var x, y;
        if ( event.changedTouches ) {
            x = event.changedTouches[ 0 ].pageX;
            y = event.changedTouches[ 0 ].pageY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }
        mouse.x = ( x / window.innerWidth ) * 2 - 1;
        mouse.y = - ( y / window.innerHeight ) * 2 + 1;
        //checkIntersection();
    }
    function checkIntersection() {

        if ( ! mesh ) return;
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( [ mesh ] );

        if ( intersects.length > 0 ) {

            var p = intersects[ 0 ].point;
            p.normal = intersects[ 0 ].face.normal.clone();

            addPoint(p);
            intersection.intersects = true;
        } else {
            intersection.intersects = false;
        }
    }
    
    onWindowResize();
    animate();
}

// function w() {
//     // if (!l) return null;
//     s.setFromCamera(h, n);
//     let t = s.intersectObjects(r.children),
//         i = null;
//     return t.length > 0 && (i = {
//         position: t[0].point,
//         normal: t[0].face.normal.clone()
//     }), i
// }

function loadLeePerrySmith() {

    var loader = new GLTFLoader();
    loader.load( 'models/gltf/LeePerrySmith/LeePerrySmith.glb', function ( gltf ) {
        mesh = gltf.scene.children[ 0 ];
        mesh.material = new THREE.MeshPhongMaterial( {
            specular: 0x111111,
            map: textureLoader.load( 'models/gltf/LeePerrySmith/Map-COL.jpg' ),
            specularMap: textureLoader.load( 'models/gltf/LeePerrySmith/Map-SPEC.jpg' ),
            normalMap: textureLoader.load( 'models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg' ),
            shininess: 25
        } );
        scene.add( mesh );
        mesh.scale.set( 10, 10, 10 );
    } );
}

function addPoint(p){
    var i = new THREE.Mesh(new THREE.SphereBufferGeometry(.2, 8, 8,), new THREE.MeshLambertMaterial({
        color: "#1ed36f"
    }));

    i.position.x = p.x;
    i.position.y = p.y;
    i.position.z = p.z;
    i.normal = p.normal;
    scene.add(i);

    points.push(i);
    drawLine();
}

var f = 30;
var curve = new THREE.CatmullRomCurve3([], !1, "chordal");
var buffer = new THREE.BufferGeometry;
var s = new THREE.Raycaster;
function drawLine() {
    if (points.length > 1) {

        let n = [];
        for (let i = 0; i < points.length; i++){
            n.push(points[i].position);
        }

        curve.points = n;
        let u = shortestPath(curve.getPoints((n.length - 1) * f));
        buffer.setFromPoints(u);

        !curve.mesh || scene.remove(curve.mesh);
        let e = new THREE.LineBasicMaterial({
            color: 255,
            opacity: 1,
            linewidth: 5
        });
        curve.mesh = new THREE.Line(buffer.clone(), e);
        curve.mesh.castShadow = !0;
        scene.add(curve.mesh);
    } 
    else {
        scene.remove(curve.mesh);
    }
}

function shortestPath(n) {
    let i = [],
        r = points.length;
    for (let u = 0; u < r - 1; u++) {
        let r = points[u],
            e = points[u + 1],
            h = e.normal.clone().sub(r.normal).divideScalar(f);
        i.push(n[u * f]);
        for (let t = 1; t < f; t++) {
            let e = r.normal.clone().add(h.clone().multiplyScalar(t)),
                c = e.clone().transformDirection(scene.matrixWorld);
            c.multiplyScalar(10).add(n[u * f + t]);
            s.set(c, e.clone().negate());
            let l = s.intersectObjects(scene.children);
            l.length > 0 && i.push(l[0].point)
        }
    }
    return i
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}