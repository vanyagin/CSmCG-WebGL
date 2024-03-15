var gl;

var boxVertices =
              [ // X, Y, Z           R, G, B
                  // Top
                  -1.0, 1.0, -1.0,   0.5, 0, 0,
                  -1.0, 1.0, 1.0,    0.5, 0, 0,
                  1.0, 1.0, 1.0,     0.5, 0, 0,
                  1.0, 1.0, -1.0,    0.5, 0, 0,

                  // Left
                  -1.0, 1.0, 1.0,    0, 1, 0,
                  -1.0, -1.0, 1.0,   0, 1, 0,
                  -1.0, -1.0, -1.0,  0, 1, 0,
                  -1.0, 1.0, -1.0,   0, 1, 0,

                  // Right
                  1.0, 1.0, 1.0,    0, 0.5, 0,
                  1.0, -1.0, 1.0,   0, 0.5, 0,
                  1.0, -1.0, -1.0,  0, 0.5, 0,
                  1.0, 1.0, -1.0,   0, 0.5, 0,

                  // Front
                  1.0, 1.0, 1.0,    0, 0, 0.5,
                  1.0, -1.0, 1.0,    0, 0, 0.5,
                  -1.0, -1.0, 1.0,    0, 0, 0.5,
                  -1.0, 1.0, 1.0,    0, 0, 0.5,

                  // Back
                  1.0, 1.0, -1.0,    0.0, 0, 1,
                  1.0, -1.0, -1.0,    0.0, 0, 1,
                  -1.0, -1.0, -1.0,    0.0, 0, 1,
                  -1.0, 1.0, -1.0,    0.0, 0, 1,

                  // Bottom
                  -1.0, -1.0, -1.0,   1, 0, 0,
                  -1.0, -1.0, 1.0,    1, 0, 0,
                  1.0, -1.0, 1.0,     1, 0, 0,
                  1.0, -1.0, -1.0,    1, 0, 0,
              ];

var boxIndices =
              [
                  // Top
                  0, 1, 2,
                  0, 2, 3,

                  // Left
                  5, 4, 6,
                  6, 4, 7,

                  // Right
                  8, 9, 10,
                  8, 10, 11,

                  // Front
                  13, 12, 14,
                  15, 14, 12,

                  // Back
                  16, 17, 18,
                  16, 18, 19,

                  // Bottom
                  21, 20, 22,
                  22, 20, 23
              ];

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
    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);
    console.log('initBuffers done successful');
}

function drawScene() {
    var positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(shaderProgram, 'vertColor');
    gl.vertexAttribPointer(positionAttribLocation,3,gl.FLOAT,gl.FALSE,6 * Float32Array.BYTES_PER_ELEMENT,0);
    gl.vertexAttribPointer(colorAttribLocation,3,gl.FLOAT,gl.FALSE,6 * Float32Array.BYTES_PER_ELEMENT,3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.useProgram(shaderProgram);
    var matWorldUniformLocation = gl.getUniformLocation(shaderProgram, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(shaderProgram, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(shaderProgram, 'mProj');
    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [2, 2, 3], [0, 0, 0], [0, 6, 0]);
    glMatrix.mat4.perspective(projMatrix, 1.1, canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    console.log('drawScene done successful');
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
        drawScene();

    }

};