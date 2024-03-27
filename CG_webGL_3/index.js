var gl;

var shaderProgram

var axisAngle = 0
var cubeAngle = 0
var podiumAngle = 0

var boxVertices = [
        -1, -1, 1,
        -1, 1, 1,
        1, 1, 1,
        -1, -1, 1,
        1, -1, 1,
        1, 1, 1, // front
        1, 1, 1,
        1, 1, -1,
        1, -1, 1,
        1, -1, -1,
        1, -1, 1,
        1, 1, -1, // right
        1, 1, -1,
        -1, 1, -1,
        1, -1, -1,
        -1, -1, -1,
        1, -1, -1,
        -1, 1, -1, // back
        -1, 1, -1,
        -1, 1, 1,
        -1, -1, -1,
        -1, -1, 1,
        -1, -1, -1,
        -1, 1, 1,  // left
        -1, 1, 1,
        1, 1, 1,
        -1, 1, -1,
        1, 1, -1,
        -1, 1, -1,
        1, 1, 1, // top
        1, -1, 1,
        -1, -1, 1,
        1, -1, -1,
        -1, -1, -1,
        1, -1, -1,
        -1, -1, 1, // bot
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
    vertexPositionAttribute = gl.getAttribLocation(shaderProgram,"vertPosition",);
    gl.enableVertexAttribArray(vertexPositionAttribute);
    console.log('initShaders done successful');
}

function initBuffers() {
    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
    var positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
    gl.vertexAttribPointer(positionAttribLocation,3,gl.FLOAT,gl.FALSE,0,0);
    gl.enableVertexAttribArray(positionAttribLocation);
    console.log('initBuffers done successful');
}

function initDraw() {
    gl.viewport(0,0,gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, 20], [0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.perspective(projMatrix, Math.PI / 4, canvas.clientWidth / canvas.clientHeight, 0.1, 100.0);

    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'mView'), gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'mProj'), gl.FALSE, projMatrix);

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
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'mWorld'), gl.FALSE, model);
}

function render(){
    var model = glMatrix.mat4.create()
    glMatrix.mat4.scale(model,model,[0.05,0.05,0.05])
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'mWorld'), gl.FALSE, model);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"vertColor"),[0,0,0])
    gl.drawArrays(gl.TRIANGLES, 0, 36)

    // Bronze
    createModel(6)
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"vertColor"),[0.54,0.27,0.07])
    gl.drawArrays(gl.TRIANGLES, 0, 36)

    // Silver
    createModel(2)
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"vertColor"),[0.75,0.75,0.75])
    gl.drawArrays(gl.TRIANGLES, 0, 36)

    // Gold
    createModel(4)
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"vertColor"),[0.85,0.65,0.12])
    gl.drawArrays(gl.TRIANGLES, 0, 36)

    createModel(4,2,4)
    gl.uniform3fv(gl.getUniformLocation(shaderProgram,"vertColor"),[0.85,0.65,0.12])
    gl.drawArrays(gl.TRIANGLES, 0, 36)

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
        //gl.clearColor(1.0, 1.0, 1.0, 1.0); // установить в качестве цвета очистки буфера цвета ---, полная непрозрачность
        gl.enable(gl.DEPTH_TEST); // включает использование буфера глубины
        gl.depthFunc(gl.LEQUAL); // определяет работу буфера глубины: более ближние объекты перекрывают дальние
        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // очистить буфер цвета и буфер глубины.

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
            }
          })
        requestAnimationFrame(render);
    }

};