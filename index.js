import * as THREE from './threejs_master/build/three.module.js'
import { GLTFLoader } from './threejs_master/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from './threejs_master/examples/jsm/controls/OrbitControls.js'
import { GLTFExporter } from './threejs_master/examples/jsm/exporters/GLTFExporter.js'

const TRAY = document.getElementById('js-tray-slide');
const colors = [
    {
        texture: './texture/abc.png',
        size: [2, 2, 2], // size는 패턴의 반복 숫자가 클수록 반복이 많이 됨
        shininess: 60
    },
    {
        color: '66533C'
    },
    {
        color: '173A2F'
    },
    {
        color: '153944'
    },
    {
        color: '27548D'
    },
    {
        color: '438AAC'
    }
]

function buildColors(colors) {
    for (let [i, color] of colors.entries()) {
        let swatch = document.createElement('div');
        swatch.classList.add('tray__swatch');

        if (color.texture) {
            swatch.style.backgroundImage = "url(" + color.texture + ")";
        } else {
            swatch.style.background = "#" + color.color;
        }
        swatch.setAttribute('data-key', i);
        TRAY.append(swatch);
    }
}
buildColors(colors);

const swatches = document.querySelectorAll(".tray__swatch");

for (const swatch of swatches) {
    swatch.addEventListener('click', selectSwatch);
}
const scene = new THREE.Scene();
// HTML에 만든 캔버스에 THREEJS 설정 넣기
const canvas = document.querySelector('#c');

let theModel;
// GLB파일 경로
const MODEL_PATH1 = "./models/test_1.glb"

// const 로 선언을 하면 변수값을 할당 할 수가 없다. let 이나 var로 할 것
let activeOption = 'Top';
// 프레임 색상 변경하기
function selectSwatch(event) {
    let color = colors[parseInt(event.target.dataset.key)];
    let new_mtl;

    if (color.texture) {
        let txt = new THREE.TextureLoader().load(color.texture);

        txt.repeat.set(color.size[0], color.size[1], color.size[2]);
        txt.wrapS = THREE.RepeatWrapping;
        txt.wrapT = THREE.RepeatWrapping;

        new_mtl = new THREE.MeshPhongMaterial({
            map: txt,
            shininess: color.shininess ? color.shininess : 10
        });
    }
    else {
        new_mtl = new THREE.MeshPhongMaterial({
            color: parseInt('0x' + color.color),
            shininess: color.shininess ? color.shininess : 10
        });
    }
    setMaterial(theModel, activeOption, new_mtl);
}

// HTML option class를 가져옴
const options = document.querySelectorAll(".option");
// 반복문으로 클릭 이벤트 selectOption에 추가
for (const option of options) {
    option.addEventListener('click', selectOption);
}
// 위에서 선언한 activeOption에 변수들을 할당
function selectOption(e) {
    let option = e.target;
    activeOption = e.target.dataset.option;
    for (const otherOption of options) {
        otherOption.classList.remove('--is-active');
    }
    option.classList.add('--is-active');
}

// setMaterial : 함수이름 //함수를 전달 할 인수의 이름(parent, type, mtl)
function setMaterial(parent, type, mtl) {
    parent.traverse((shadow) => {
        if (shadow.isMesh && shadow.nameID != null) {
            if (shadow.nameID == type) {
                shadow.material = mtl;
            }
        }
    })
}

const loader = new GLTFLoader;
// gltf(shelf) 생성
loader.load(MODEL_PATH1, function (Top) {
        console.log('success')
        console.log(Top)
    theModel = Top.scene;
    // 그림자 추가
    theModel.traverse((Top) => {
        if (Top.isMesh) {
            Top.castShadow = true;
            Top.receiveShadow = true;
            // object 숨기기
            Top.visible = false;
        }
    });
    theModel.scale.set(3, 2, 2);
    //theModel.rotation.x = Math.PI;
    theModel.position.y = -1;
    console.log(theModel.scale);
    // 초기 텍스처 설정 
    for (let object of INITIAL_MAP) {
        initColor(theModel, object.childID, object.mtl);
    }
    document.getElementById("TopHideShow").addEventListener("click", function () {
        // 앞에서 Top.scene를 theModel로 선언했기 때문에
        // children[0] 는 mesh의 갯수
        // 여기서 2번의 경우 Top 3번의 경우 TopEdge를 뜻 함
        theModel.children[2].visible = !theModel.children[2].visible;
        theModel.children[3].visible = !theModel.children[3].visible;
    });
    document.getElementById("FrameHideShow").addEventListener("click", function () {
        theModel.children[4].visible = !theModel.children[4].visible;
    });
    document.getElementById("BotHideShow").addEventListener("click", function () {
        theModel.children[0].visible = !theModel.children[0].visible;
        theModel.children[1].visible = !theModel.children[1].visible;
    });
    document.getElementById("Size1").addEventListener("click", function () {
        theModel.scale.set(1,1,1)
    });
    document.getElementById("Size2").addEventListener("click", function () {
        theModel.scale.set(3,2,2)
    });
    
    // scene에 threModel추가
    scene.add(theModel);
})

// 블렌더에서 부여한 이름과 같이
const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0xf1f1f1, shininess: 10 });
const INITIAL_MAP = [
    { childID: "Top", mtl: INITIAL_MTL },
    { childID: "TopEdge", mtl: INITIAL_MTL },
    { childID: "Frame", mtl: INITIAL_MTL },
    { childID: "Bot", mtl: INITIAL_MTL },
    { childID: "BotEdge", mtl: INITIAL_MTL }
]

// initColor : 함수의 이름 (함수를 전달 할 인수(parent, type, mtl))
// 모델에 텍스쳐 추가하기
function initColor(parent, type, mtl) {
    parent.traverse((shadow) => {
        if (shadow.isMesh) {
            if (shadow.name.includes(type)) {
                shadow.material = mtl;
                shadow.nameID = type;
            }
        }
    })
}

// HemisphereLight 장면 바로 위에 반구 형식으로 나오는 빛(그림자X) - 빛이 바랜 색의 빛
const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemiLight);

// DirectionalLight 태양광 같은 느낌(그림자 ㅇ)
const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
// resizeRendererToDisplaySize와 비슷한 효과인듯?
// renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);


// 배경색
const BACKGROUND_COLOR = 0xf1f1f1;
scene.background = new THREE.Color(BACKGROUND_COLOR);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.z = 2;
camera.position.y = -5;

// 카메라 생성 된 후에 위치
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 3;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.2;

// 바닥생성 width, height, widthSegment(분할), heightSegment(분할) ex)1일 경우 1칸을 나눔
// const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1)
// const floorMeterial = new THREE.MeshPhongMaterial({
//     color: 0x999999,
//     shininess: 0
// })

// 바닥
// const floor = new THREE.Mesh(floorGeometry, floorMeterial)
// floor.rotation.x = -0.5 * Math.PI;
// floor.receiveShadow = true;
// floor.position.y = -1;
// scene.add(floor);

//다운로드 버튼 생성 후 이벤트 추가
const btn = document.getElementById('download-glb');
btn.addEventListener('click', download)

// gltfExporter을 이용해 생성된 버튼
function download() {
    const exporter = new GLTFExporter();
    exporter.parse(scene,
        // 해당 씬을 저장
        function (result) {
            // 저장할 때 이름 
            saveArrayBuffer(result, 'Shelf.glb');
        },
        { binary: true }
    );
}

// 저장하기
function saveArrayBuffer(buffer, filename) {
    save(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}
//링크 생성 a태그
const link = document.createElement('a');

// 위에서 생성한 링크 태그 a로 연결
document.body.appendChild(link);

function save(blob, filename) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function animate() {
    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateWorldMatrix();
    }
};

animate();

// 웹 화면 및 스마트폰에서도 pixel이 선명해지게 하기(이걸 안쓰면 화면이 꺠져보임)
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}
