var gl;


var shaderProgram
var viewMatrix

var axisAngle = 0
var cubeAngle = 0
var podiumAngle = 0

var stoneTexture, patternTexture, goldTexture, tex1, tex2, tex3
var propDig = 0.9, propMat = 0.9, propCol = 0.9;

var vertices = [
        // Front face
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

        // Back face
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0,

        // Top face
        -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
        ]


var indices = [
        0,  1,  2,  2,  3,  0,  // front
        4,  5,  6,  6,  7,  4,  // back
        8,  9,  10, 10, 11, 8,  // top
        12, 13, 14, 14, 15, 12, // bottom
        16, 17, 18, 18, 19, 16, // right
        20, 21, 22, 22, 23, 20 // left
        ]

var vertexNormals = [
    // Front
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

    // Back
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

    // Top
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

    // Bottom
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

    // Right
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

    // Left
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        ]

var textureCoordinates = [
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        ]


var canvas = document.getElementById('glcanvas');

function initWebGL(canvas) {
    gl = null;
    try {
        // Попытаться получить стандартный контекст. Если не получится, попробовать получить экспериментальный.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (e) {}
    // Если мы не получили контекст GL, завершить работу
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    return gl;
}

var images = ["images/stone.jpg", "images/pattern.jpg", "images/gold.jpg", "images/1.png", "images/2.png", "images/3.png"]
var images1  = ["images1/bronze.png", "images1/silver.png", "images1/gold.png", "images1/one.png", "images1/two.png", "images1/three.png"]


function setupTextures(){
  stoneTexture = gl.createTexture();
  tex3 = gl.createTexture();
  setTexture([images[0],images[5]], [stoneTexture,tex3]);

  patternTexture = gl.createTexture();
  tex2 = gl.createTexture();
  setTexture([images1[1],images[4]], [patternTexture,tex2]);

  goldTexture = gl.createTexture();
  tex1 = gl.createTexture();
  setTexture([images[2],images[3]], [goldTexture,tex1]);
}

function setTexture(urls, textures) {
    for(let i = 0; i < urls.length; i++){
        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));
        let image = new Image();
        image.onload = function() {
            handleTextureLoaded(image, textures[i]);
        }
        image.src = urls[i];
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"+i), i);
  }
}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
}

function createTexture(texture0, texture1){
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
}

function getShader(gl, id) {
    var shaderScript, theSource, currentChild, shader;
    shaderScript = document.getElementById(id);
    if (!shaderScript) {
       return null;
    }
    theSource = "";
    currentChild = shaderScript.firstChild;
    while(currentChild) {
    if (currentChild.nodeType == currentChild.TEXT_NODE) {
       theSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
    }
    if (shaderScript.type == "x-shader/x-fragment") {
       shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
       shader = gl.createShader(gl.VERTEX_SHADER);
       } else {
           // неизвестный тип шейдера
           return null;
       }
    gl.shaderSource(shader, theSource);
    // скомпилировать шейдерную программу
    gl.compileShader(shader);
    // Проверить успешное завершение компиляции
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
       alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
       return null;
    }
    return shader;
}


function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");
    // создать шейдерную программу
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    // Если создать шейдерную программу не удалось, вывести предупреждение
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }
    gl.useProgram(shaderProgram);
    console.log('initShaders done successful');
}

function initBuffers() {
    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const vertPos = gl.getAttribLocation(shaderProgram,"aVertex")
    gl.enableVertexAttribArray(vertPos)
    gl.vertexAttribPointer(vertPos, 3, gl.FLOAT, false, 0, 0)

    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    const normalsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    const aTextCoords = gl.getAttribLocation(shaderProgram,"aTextureCoords");
    gl.enableVertexAttribArray(aTextCoords);
    gl.vertexAttribPointer(aTextCoords, 2, gl.FLOAT, false, 0, 0);

    console.log('initBuffers done successful');
}

function initDraw() {
    gl.viewport(0,0,gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)
    viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    glMatrix.mat4.lookAt(viewMatrix, [0, 2, 20], [0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.perspective(projMatrix, Math.PI / 4, canvas.clientWidth / canvas.clientHeight, 0.1, 100.0);

    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uView'), gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uProj'), gl.FALSE, projMatrix);

    console.log('drawScene done successful');
}

function createModel(x, y = 0, podCenter = 4) {

    var model = glMatrix.mat4.create()
    glMatrix.mat4.translate(model,model,[x,y,0])

    // y rotation
    glMatrix.mat4.translate(model,model,[-x,0,0])
    glMatrix.mat4.rotate(model,model,axisAngle,[0,1,0])
    glMatrix.mat4.translate(model,model,[x,0,0])

    // podium rotation
    glMatrix.mat4.translate(model,model,[podCenter - x,0,0])
    glMatrix.mat4.rotate(model,model,podiumAngle,[0,1,0])
    glMatrix.mat4.translate(model,model,[x - podCenter,0,0])

    // cube rotation
    glMatrix.mat4.rotate(model,model,cubeAngle,[0,1,0])
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uModel'), gl.FALSE, model);

    const mvMatrix = glMatrix.mat4.create()
    const nMatrix = glMatrix.mat3.create()
    glMatrix.mat4.multiply(mvMatrix,viewMatrix,model)
    glMatrix.mat3.normalFromMat4(nMatrix, mvMatrix)
    gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram,"uNMatrix"),false,nMatrix)
}


function render(){

    gl.viewport(0,0,gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)

    gl.uniform1f(gl.getUniformLocation(shaderProgram,"uPropCol"), propCol);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,"uPropMat"), propMat);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,"uPropDig"), propDig);

    var model = glMatrix.mat4.create()
    glMatrix.mat4.scale(model,model,[0.05,0.05,0.05])
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uModel'), gl.FALSE, model);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[0,0,0])
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

    // Bronze
    createModel(6)
    //initNormMatrix()
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[1,1,1])
    createTexture(stoneTexture, tex3)
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)


    // Silver
    createModel(2)
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[1,1,1])
    createTexture(patternTexture, tex2)
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

    // Gold
    createModel(4)
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[1,1,1])
    createTexture(goldTexture, tex1)
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

    createModel(4,2,4)
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[1,1,1])
    createTexture(goldTexture, tex1)
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

    requestAnimationFrame(render)
}

function start() {
    console.log('Start WebGL');

    gl = initWebGL(canvas);

    if (!gl) {
        alert("Ваш браузер не поддерживает WebGL");
    }

    if (gl) {
        // установка размеров области рисования
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        gl.clearColor(1.0, 1.0, 1.0, 1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthFunc(gl.LEQUAL)
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)

        initShaders();
        initBuffers();
        setupTextures();
        initDraw();
        window.addEventListener("keydown", e => {
            switch(e.code) {
              case "KeyQ": {
                axisAngle -= 0.04
                break
              }
              case "KeyE": {
                axisAngle += 0.04
                break
              }
              case "KeyA": {
                cubeAngle -= 0.04
                break
              }
              case "KeyD": {
                cubeAngle += 0.04
                break
              }
              case "KeyZ": {
                podiumAngle -= 0.04
                break
              }
              case "KeyC": {
                podiumAngle += 0.04
                break
              }
            }
          })
        requestAnimationFrame(render);
    }

}

start()