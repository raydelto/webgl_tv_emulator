const SIZE_OF_FLOAT = 4;
const gl = document.getElementById('glcanvas').getContext('webgl');

class TVRenderer {

  constructor() {
    this.timeOutHandler = null
  }

  On() {
    this.RenderTV(true)
  }

  Off() {
    this.RenderTV(false)
  }

  RenderTV(shouldRender) {

    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    // Vertex shader program source

    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec2 aTextureCoord;

    varying vec4 vertexPosition;
    varying vec4 vertexColor;
    varying vec2 vertexTextureCoord;
  
    void main()
    {
      vertexPosition =  aVertexPosition;
      gl_Position =  aVertexPosition;
      vertexColor = aVertexColor;
      vertexTextureCoord = aTextureCoord;
    }
  `;

    // Fragment shader program source

    const fsSource = `
      precision mediump float;
      varying vec4 vertexPosition;
      varying vec4 vertexColor;
      varying vec2 vertexTextureCoord;
      uniform bool isTvOn;
      uniform sampler2D uTextureSampler;
  
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
        if(isTvOn && rand(vertexColor.rg) > 0.9)
        {
          gl_FragColor = texture2D(uTextureSampler, vertexTextureCoord);
          return;
        }
        gl_FragColor = isTvOn ? vec4(rand(vertexColor.rg),rand(vertexColor.rb),rand(vertexColor.gb) ,1.0) : vec4(0,0,0,1);
      }
    `;

    const shaderProgram = this.initShaderProgram(vsSource, fsSource);

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        isTvOn: gl.getUniformLocation(shaderProgram, 'isTvOn'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')
      },
      shouldRender
    };

    const buffers = this.initBuffers(programInfo);
    const renderLoop = (programInfo, buffers) => {
      if (!shouldRender) {
        clearTimeout(this.timeOutHandler);
      } else {
        this.timeOutHandler = window.setTimeout(renderLoop, 1000 / 60, programInfo, buffers);
      }
      this.drawScene(programInfo, buffers);

    }
    this.texture = this.loadTexture("http://www.raydelto.org/no_signal.png");

    renderLoop(programInfo, buffers);
  }

  initBuffers(programInfo) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    let numComponents = 2; // x , y
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 8 * SIZE_OF_FLOAT;
    let offset = 0;

    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    numComponents = 4; // r,g,b,a
    type = gl.FLOAT;
    normalize = false;
    stride = 8 * SIZE_OF_FLOAT;
    offset = 2 * SIZE_OF_FLOAT;
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    numComponents = 2; // tx, ty
    type = gl.FLOAT;
    normalize = false;
    stride = 8 * SIZE_OF_FLOAT;
    offset = 6 * SIZE_OF_FLOAT;
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoord,
      numComponents,
      type,
      normalize,
      stride,
      offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    return {
      position: positionBuffer
    };
  }

  updateBuffer(buffers) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    const positions = [
      1.0, 1.0, Math.random(), Math.random(), Math.random(),0.0,1.0,1.0,
      -1.0, 1.0, Math.random(), Math.random(), Math.random(),0.0,0.0,1.0,
      1.0, -1.0, Math.random(), Math.random(), Math.random(),0.0,1.0,0.0,
      -1.0, -1.0, Math.random(), Math.random(), Math.random(),0,0,0.0,0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  }

  drawScene(programInfo, buffers) {
    this.updateBuffer(buffers);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.useProgram(programInfo.program);
    gl.uniform1i(programInfo.uniformLocations.isTvOn, programInfo.shouldRender);

  // Tell WebGL we want to affect texture unit 0 
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, this.texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }

  loadTexture(url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 0, 255]);  // opaque black
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      width, height, border, srcFormat, srcType,
      pixel);

    const image = new Image();
    image.onload =  () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        srcFormat, srcType, image);

      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        // No, it's not a power of 2. Turn off Mipmaps and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    };
    
    image.crossOrigin = "";
    image.src = url;

    return texture;
  }

  initShaderProgram(vsSource, fsSource) {
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
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

  loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the ' + (type === gl.VERTEX_SHADER ? 'vertex' : 'fragment') + ' shader:\n ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

}
