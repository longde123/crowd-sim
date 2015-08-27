var Entity = require('../Entity');
var Vec2 = require('../../Common/Vec2');

var Joint = function(x, y, parent, options, id) {
  this.options = Lazy(options).defaults(Joint.defaults).toObject();
  Entity.call(this, x, y, parent, this.options);
  delete this.options.previousJoint; // delete not neccesary
  this.id = id || 'J' + Joint.id++;
  Joint.id = Entity.prototype.calcNewId.call(this, Joint.id);
};

Joint.prototype.destroy = function() {
  if (this.parent) {
    this.parent.removeEntity(this);
  }
};

Joint.prototype.getRadius = function() {
  return this.options.radius;
};

Joint.prototype.in = function(pos) {
  var dist = Vec2.distance(pos, this.pos);
  return dist < this.options.radius;
};

Joint.prototype.setRadius = function(radius) {
  if (this.options.scalable) {
    this.options.radius = radius;
  }
};

Joint.prototype.incrRadius = function(dr) {
  if (this.options.scalable) {
    this.options.radius = Math.abs(this.options.radius + dr);
  }
};

Joint.defaults = {
  radius: 4,
  previousJoint: null,
  scalable: true
};
Joint.id = 0;
Joint.type = 'joint';

module.exports = Joint;
