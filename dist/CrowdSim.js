(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global window,module, exports : true, define */
var Entity = require('./Entity');
var Vec2 = require('./Vec2');

var Agent = function(group, x, y, size) {
  Entity.call(this);

  this.id = Agent.id++;
  this.group = group;
  this.pos = Vec2.fromValues(x,y);
  this.vel = Vec2.create();
  this.size = size;
  this.mobility = 1.0;
  this.behaviour = null; // individual dataset by group
};

Agent.prototype.step = function(step) {
  this.group.behavior(this, step);
};
Agent.id = 0;

module.exports = Agent;

},{"./Entity":4,"./Vec2":7}],2:[function(require,module,exports){
/* global window,module, exports : true, define */

var CrowdSim = {
  Agent: require('./Agent'),
  Group: require('./Group'),
  World: require('./World'),
  Wall: require('./Wall'),
  Engine: require('./Engine'),
  Render: require('./Render')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}

},{"./Agent":1,"./Engine":3,"./Group":5,"./Render":6,"./Wall":8,"./World":9}],3:[function(require,module,exports){

var Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.agentsSave = JSON.parse(JSON.stringify(world.agents));
  this.world = world || {};
  this.world.save();

  var defaultOptions = {
    timestep: 10 / 60
  };
  this.options = Lazy(options).defaults(defaultOptions).toObject();
};

Engine.prototype.setWorld = function(world) {
  this.world = world;
};

Engine.prototype.getWorld = function() {
  return this.world;
};

Engine.prototype.run = function() {
  if (this.running) {
    return;
  }
  this.running = true;
  this.step();
};

Engine.prototype.step = function() {
  if (this.running) {
    return;
  }
  this.step();
};

Engine.prototype.step = function() {
  var world = this.world;
  var options = this.options;
  var timestep = options.timestep;
  var entities = this.world.entities;
  Lazy(entities.agents).each(function(agent) {
    if (agent.selected) {
      world.agentSelected = agent;
      return;
    }
    agent.step(timestep);
    if (options.onStep) {
      options.onStep(world);
    }
  });
  this.iterations++;
  if (this.running) {
    var that = this;
    setTimeout(function() {
      that.step();
    }, timestep);
  }
};

Engine.prototype.stop = function() {
  if (!this.running) {
    return;
  }
  this.running = false;
};
Engine.prototype.reset = function() {
  this.iterations = 0;
  this.running = false;
  this.world.restore();
};

module.exports = Engine;

},{}],4:[function(require,module,exports){

var Entity = function() {
  this.extra = {};
};

module.exports = Entity;

},{}],5:[function(require,module,exports){
var Agent = require('./Agent');
var Entity = require('./Entity');
var Vec2 = require('./Vec2');

var Group = function(world, agentsNumber, initArea, options) {
  Entity.call(this);
  options = Lazy(options).defaults({
    pos: function(area) {
      var x = area[0][0] + Math.random() * (area[1][0] - area[0][0]);
      var y = area[0][1] + Math.random() * (area[1][1] - area[0][1]);
      return Vec2.fromValues(x, y);
    },
    size: function() {
      return 5;
    },
    behavior: this.behaviorRandom,
  }).toObject();
  this.id = Group.id++;

  this.behavior = options.behavior;
  this.world = world;
  var that = this;
  this.agents = [];
  for (var i=0;i<agentsNumber;i++) {
    var pos = options.pos(initArea);
    var size = isNaN(options.size) ? options.size() : options.size;
    var agent = new Agent(that, pos[0], pos[1], size);
    this.agents.push(agent);
  }

  if (options.waypoints) {
    this.waypoints = options.waypoints;
  }
};

Group.prototype.addAgent = function(x,y) {
  var size = isNaN(options.size) ? options.size() : options.size;
  var agent = new Agent(this, x, y, size);
  this.agents.push(agent);
};

Group.prototype.getArea = function() {
  return {
    xmin: Lazy(this.agents).map(function(e) { return e.pos[0] - e.size; }).min(),
    xmax: Lazy(this.agents).map(function(e) { return e.pos[0] + e.size; }).max(),
    ymin: Lazy(this.agents).map(function(e) { return e.pos[1] - e.size; }).min(),
    ymax: Lazy(this.agents).map(function(e) { return e.pos[1] + e.size; }).max()
  };
};

Group.prototype.addAgent = function(agent) {
  this.agents.concat(agent);
};


Group.prototype.behaviorRandom = function(agent, step) {
  var accel = Vec2.fromValues(Math.random() * 2 - 1, Math.random() * 2 - 1);
  var vel = Vec2.create();
  var pos = Vec2.create();
  Vec2.scale(vel,accel,step);
  Vec2.add(agent.vel,agent.vel,vel);
  //this.direction = Math.atan2(entity.vel.y, entity.vel.x);
  Vec2.scale(pos,agent.vel,step);
  Vec2.add(agent.pos,agent.pos,pos);

  if (this.world.wrap) {
    if (agent.pos[0] > this.world.MAX_X) {
      agent.pos[0] = this.world.MIN_X + agent.pos[0] - world.MAX_X;
    }
    if (agent.pos[0] < this.world.MIN_X) {
      agent.pos[0] = this.world.MAX_X - (this.world.MIN_X - entity.pos[0]);
    }
    if (agent.pos[1] > this.world.MAX_Y) {
      agent.pos[1] = this.world.MIN_Y + entity.pos[1] - this.world.MAX_Y;
    }
    if (agent.pos[1] < this.world.MIN_Y) {
      agent.pos[1] = this.world.MAX_Y - (this.world.MIN_Y - entity.pos[1]);
    }
  }
};

Group.id = 0;

module.exports = Group;

},{"./Agent":1,"./Entity":4,"./Vec2":7}],6:[function(require,module,exports){

var Colors = {
  Agent: 0xFF0000,
  Wall: 0x00FF00,
  Group: 0xe1eca0,
  Joint: 0xFFFFFF,
  Waypoint: 0x7a7a7a
};

/*
* Base render prototype
*/
var Entity = function(entity, container, display) {
  this.entitiyModel = entity;
  this.entitiyModel.extra.view = this;
  // add it the container so we see it on our screens..
  display.interactive = true;
  display.buttonMode = true;
  display.mouseover = this.mouseover;
  display.mouseout = this.mouseout;
  display._entityView = this;
  container.addChild(display);
  this.display = display;
};

Entity.prototype.update = function() {
  //this.display.clear();
};

Entity.prototype.mouseover = function() {
  var entity = this._entityView.entityModel;
  console.log(entity.id + ': Mouse Over');
  agent.selected = true;
};

Entity.prototype.mouseout = function() {
  this._entityView.entityModel.selected = false;
};

var Agent = function(agent, container, texture, debugContainer) {
  var sprite = new PIXI.Sprite(texture);
  if (debugContainer) {
    this.graphics = new PIXI.Graphics();
    debugContainer.addChild(this.graphics);
    this.circle = new PIXI.Circle(agent.pos[0], agent.pos[1], agent.size / 2);
  }
  //var display = new PIXI.Sprite(options.texture);
  Entity.call(this, agent, container, sprite);
  this.display.visible = Agent.show.body;
  this.display.anchor.set(0.5);
  //this.display.alpha = 0.5;
  this.display.height = agent.size;
  this.display.width = agent.size;
  this.display.position.x = agent.pos[0];
  this.display.position.y = agent.pos[1];
  this.update();
};

Agent.prototype.update = function() {
  if (!Agent.show || !Agent.show.all) {
    return;
  }
  Entity.prototype.update.call(this);

  var e = this.entitiyModel;
  this.display.position.set(e.pos[0], e.pos[1]);
  this.display.rotation = Math.atan2(e.vel[1], e.vel[0]) - Math.PI / 2;
  if (this.circle) {
    this.graphics.clear();
    this.circle.x = e.pos[0];
    this.circle.y = e.pos[1];

    if (Agent.show.body) {
      this.graphics.lineStyle(1, Colors.Agent);
      this.graphics.drawShape(this.circle);
    }
    if (Agent.show.direction) {
      var scale = 10;
      this.graphics.moveTo(e.pos[0], e.pos[1]);
      this.graphics.lineTo(e.pos[0] + e.vel[0] * scale, e.pos[1] + e.vel[1] * scale);
      this.graphics.endFill();
    }
  }

};
Agent.show = {body: true, direction: true, all: true};

var Wall = function(wall, container) {
  var display = new PIXI.Graphics();
  Entity.call(this, wall, container, display);
  this.joints = [];
  for (var j in wall.path) {
    var joint = wall.path[j];
    var circle = new PIXI.Circle(joint[0], joint[1], wall.width);
    this.joints.push(circle);
  }
  this.update();
};

Wall.prototype.update = function(options) {
  if (!Wall.show || !Wall.show.all) {
    this.display.clear();
    return;
  }
  Entity.prototype.update.call(this);
  //this.display.clear();
  var path = wall.path;
  if (Wall.show.path) {
    //this.display.beginFill(Colors.Wall, 0.1);
    this.display.lineStyle(wall.width, Colors.Wall);
    this.display.moveTo(path[0][0], path[0][1]);
    for (var i = 1; i < path.length ; i++) {
      this.display.lineTo(path[i][0], path[i][1]);
    }
    //this.display.endFill();
  }
  if (Wall.show.corners) {
    this.display.beginFill(Colors.Joint);
    for (var j in this.joints) {
      this.display.drawShape(this.joints[j]);
    }
    this.display.endFill();
  }
};
Wall.show = {path: true, corners: true, all: true};

var Group = function(group, container) {
  var display = new PIXI.Graphics();
  Entity.call(this, group, container, display);
  this.area = new PIXI.Rectangle(0, 0, 0, 0);
  var wps = group.waypoints;
  if (wps) {
    this.waypoints = [];
    for (var i in wps) {
      var wp = wps[i];
      var circle = new PIXI.Circle(wp[0], wp[1], 1);
      this.waypoints.push(circle);
    }
  }
  this.update();
};

Group.prototype.update = function(options) {
  if (!Group.show || !Group.show.all) {
    this.display.clear();
    return;
  }
  this.display.clear();
  Entity.prototype.update.call(this);
  var group = this.entitiyModel;
  if (!group.agents || group.agents.length === 0) {
    return;
  }
  if (Group.show.area) {
    var limits = group.getArea();
    this.area.x = limits.xmin;
    this.area.y = limits.ymin;
    this.area.width = limits.xmax - limits.xmin;
    this.area.height = limits.ymax - limits.ymin;

    this.display.beginFill(Colors.Group, 0.2);
    this.display.drawShape(this.area);
    this.display.endFill();
  }
  var wps = this.waypoints;
  if (Group.show.waypoints && wps) {
    this.display.lineStyle(1, Colors.Group);
    this.display.beginFill(Colors.Joint);
    for (var i in wps) {
      this.display.drawShape(wps[i]);
    }
    this.display.endFill();
    //
    this.display.moveTo(wps[0].x, wps[0].y);
    for (var j = 1; j < wps.length; j++) {
      this.display.lineTo(wps[j].x, wps[j].y);
    }
  }
};

Group.show = {area: true, waypoints: true, all: true};

module.exports.Agent = Agent;
module.exports.Wall = Wall;
module.exports.Group = Group;

},{}],7:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

// Constants
glMatrix.EPSILON = 0.000001;
glMatrix.ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
glMatrix.RANDOM = Math.random;
glMatrix.SIMD_AVAILABLE = (glMatrix.ARRAY_TYPE !== Array) && ('SIMD' in this);
glMatrix.ENABLE_SIMD = false;

/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    glMatrix.ARRAY_TYPE = type;
}

var degree = Math.PI / 180;

/**
* Convert Degree To Radian
*
* @param {Number} Angle in Degrees
*/
glMatrix.toRadian = function(a){
     return a * degree;
}

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */
var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
vec2.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to invert
 * @returns {vec2} out
 */
vec2.inverse = function(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
vec2.random = function (out, scale) {
    scale = scale || 1.0;
    var r = glMatrix.RANDOM() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = vec2.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }

        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }

        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

module.exports = vec2;

},{}],8:[function(require,module,exports){

var Entity = require('./Entity');

var Wall = function(path, options) {
  Entity.call(this);
  if (!path || path.length < 2) {
    throw 'Walls must have at least two points';
  }
  this.width = this.options ? options.width || 2 : 2;
  this.path = path;
};

module.exports = Wall;

},{"./Entity":4}],9:[function(require,module,exports){
/* global window,module, exports : true, define */

var World = function(x1, y1, x2, y2) {
  this.entities = {
    groups: [new CrowdSim.Group(this,0)],
    agents: [],
    walls: []
  };
  this.wrap = true;
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
};

World.prototype.getDefaultGroup = function() {
  return this.entities.groups.first();
};

World.prototype.addGroup = function(group) {
  this.entities.groups = this.entities.groups.concat(group);
  this.entities.agents = this.entities.agents.concat(group.agents);
};

World.prototype.addWall = function(wall) {
  this.entities.walls = this.entities.walls.concat(wall);
};

World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.entities.agents = JSON.parse(this.agentsSave);
};

module.exports = World;

},{}]},{},[2])


//# sourceMappingURL=CrowdSim.js.map