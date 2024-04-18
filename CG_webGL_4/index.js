var gl;

var shaderProgram

var viewMatrix

var axisAngle = 0, cubeAngle = 0, podiumAngle = 0, ambientCoeff = 1.0, shadingModel = 0, lightingModel = 0, c1 = 0, c2 = 0

var vertices = [
        // Front face
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
      ]

var indices = [
        0,  1,  2,  0,  2,  3,  // front
        4,  5,  6,  4,  6,  7,  // back
        8,  9,  10, 8,  10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23, // left
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

    const normalPos = gl.getAttribLocation(shaderProgram,"aNormal")
    gl.enableVertexAttribArray(normalPos)
    gl.vertexAttribPointer(normalPos, 3, gl.FLOAT, false, 0, 0)


    console.log('initBuffers done successful');
}

function initDraw() {
    gl.viewport(0,0,gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)
    viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, 20], [0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.perspective(projMatrix, Math.PI / 4, canvas.clientWidth / canvas.clientHeight, 0.1, 100.0);

    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uView'), gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uProj'), gl.FALSE, projMatrix);

    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uLightPosition"),[10,10,5])
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uAmbientLightColor"),[0.1,0.1,0.1])
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uDiffuseLightColor"),[0.7,0.7,0.7])
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uSpecularLightColor"),[1.0,1.0,1.0])


    console.log('initDraw done successful');
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

    gl.uniform1f(gl.getUniformLocation(shaderProgram,"uc1"), c1);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,"uc2"), c2);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,'uLightingModel'), lightingModel);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,'uShadingModel'), shadingModel);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,"uAmbientCoeff"), ambientCoeff);

    var model = glMatrix.mat4.create()
    glMatrix.mat4.scale(model,model,[0.05,0.05,0.05])
    //initNormMatrix()
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uModel'), gl.FALSE, model);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[0,0,0])
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

    // Bronze
    createModel(6)
    //initNormMatrix()
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[0.54,0.27,0.07])
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

    // Silver
    createModel(2)
    //initNormMatrix()
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[0.75,0.75,0.75])
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

    // Gold
    createModel(4)
    //initNormMatrix()
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[0.85,0.65,0.12])
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

    createModel(4,2,4)
    //initNormMatrix()
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[0.85,0.65,0.12])


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

        gl.clearColor(0.0, 1.0, 1.0, 1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)

        initShaders();
        initBuffers();
        initDraw();

        window.addEventListener("keydown", e => {
            switch(e.code) {
              case "KeyQ": {
                axisAngle -= 0.02
                break
              }
              case "KeyE": {
                axisAngle += 0.02
                break
              }
              case "KeyA": {
                cubeAngle -= 0.02
                break
              }
              case "KeyD": {
                cubeAngle += 0.02
                break
              }
              case "KeyZ": {
                podiumAngle -= 0.02
                break
              }
              case "KeyC": {
                podiumAngle += 0.02
                break
              }
              case "Space": {
                lightingModel++
                if (lightingModel == 4) lightingModel = 0
                break
              }
              case "ShiftLeft": {
                if (shadingModel == 0) {
                    shadingModel = 1
                    break
                }
                else {
                    shadingModel = 0
                    break
                }
              }
              case "KeyW": {
                c1 += 0.005
                if (c1 >= 0.1) c1 = 0
                break
              }
              case "KeyS": {
                c2 += 0.005
                if (c2 >= 0.1) c2 = 0
                break
              }
              case "KeyX": {
                ambientCoeff++
                if (ambientCoeff == 11) ambientCoeff = 1
                break
              }
              case "KeyR": {
                axisAngle = 0, cubeAngle = 0, podiumAngle = 0, ambientCoeff = 1.0, shadingModel = 0, lightingModel = 0, c1 = 0, c2 = 0
                break
              }
            }
          })
        requestAnimationFrame(render);
    }
}