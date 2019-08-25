main();

function main() {
  const canvas = document.getElementById('glcanvas');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program source

  const vsSource = `
  attribute vec4 aVertexPosition;
  varying vec4 vertexPosition;

  void main()
  {
    vertexPosition =  aVertexPosition;
    gl_Position =  aVertexPosition;
  }
`;

  // Fragment shader program source

  const fsSource = `
    precision mediump float;
    varying vec4 vertexPosition;
    float rand(vec2 co)
    {
        highp float a = 12.9898;
        highp float b = 78.233;
        highp float c = 43758.5453;
        highp float dt= dot(co.xy ,vec2(a,b));
        highp float sn= mod(dt,3.14);
        return fract(sin(sn) * c);
    }
  
    void main() 
    {
      gl_FragColor = vec4(rand(vertexPosition.xy),rand(vertexPosition.xy),rand(vertexPosition.xy),1);
    }
  `;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    }
  };

  const buffers = initBuffers(gl, programInfo);
  drawScene(gl, programInfo, buffers);
}

function initBuffers(gl, programInfo) {

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [
     1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
    -1.0, -1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(positions),
                gl.STATIC_DRAW);
                
  const numComponents = 2; // x , y
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
  gl.enableVertexAttribArray(positionBuffer);
        
  return {
    position: positionBuffer
  };
}

function drawScene(gl, programInfo, buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.useProgram(programInfo.program);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the '+ (type === gl.VERTEX_SHADER ? 'vertex' : 'fragment') +' shader:\n ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
