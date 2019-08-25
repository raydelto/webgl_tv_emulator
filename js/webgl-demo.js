const SIZE_OF_FLOAT = 4;
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
  attribute vec3 aVertexColor;
  varying vec4 vertexPosition;
  varying vec3 vertexColor;

  void main()
  {
    vertexPosition =  aVertexPosition;
    gl_Position =  aVertexPosition;
    vertexColor = aVertexColor;
  }
`;

  // Fragment shader program source

  const fsSource = `
    precision mediump float;
    varying vec4 vertexPosition;
    varying vec3 vertexColor;
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
      gl_FragColor = vec4(rand(vertexColor.rg),rand(vertexColor.rb),rand(vertexColor.gb) ,1.0);
    }
  `;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor')
    }
  };

  const buffers = initBuffers(gl, programInfo);
  const renderLoop = (gl, programInfo, buffers)=>{
    drawScene(gl, programInfo, buffers);
    window.setTimeout(renderLoop, 1000 / 60, gl, programInfo, buffers);
  }
  
  renderLoop(gl, programInfo, buffers);
}

function initBuffers(gl, programInfo) {

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                
  let numComponents = 2; // x , y
  let type = gl.FLOAT;
  let normalize = false;
  let stride = 5 * SIZE_OF_FLOAT;
  let offset = 0;
  
  gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  numComponents = 3; // r,g,b
  type = gl.FLOAT;
  normalize = false;
  stride = 5 * SIZE_OF_FLOAT;
  offset = 2 * SIZE_OF_FLOAT;
  gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);  
        
  return {
    position: positionBuffer
  };
}

function updateBuffer(gl, buffers){
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  const positions = [
      1.0,  1.0, Math.random(),Math.random(),Math.random() ,
     -1.0,  1.0, Math.random(),Math.random(),Math.random() ,
      1.0, -1.0, Math.random(),Math.random(),Math.random() ,
     -1.0, -1.0, Math.random(),Math.random(),Math.random() 
  ];
 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

function drawScene(gl, programInfo, buffers) {
  updateBuffer(gl,buffers);
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
