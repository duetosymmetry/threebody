/*jshint quotmark: double, unused: false*/
"use strict";
/* global d3,
  Simulation
 */
 
Simulation.prototype.choosePresetInitialConditions = function(choice) {
  if (choice === "figure 8") {
    this.setFigureEight();
  }
  else if (choice === "equilateral, equal masses") {
    this.setEquilateralUnstable();
  }
  else if (choice === "equilateral, star-planet-planet") {
    this.setEquilateralStable();
  }
    else if (choice === "Pythagorean") {
    this.setPythagorean();
  }
 
  this.activatePresetInitialConditions();
};

Simulation.prototype.setFigureEight = function() {
  var bodies = this.system.bodies;
  
  bodies[0].mass = 1;
  bodies[0].pos = [0.97000436, -0.24308753, 0];
  bodies[0].vel = [0.466203685, 0.43236573, 0];
  
  bodies[1].mass = 1;
  bodies[1].pos = [-0.97000436, 0.24308753, 0];
  bodies[1].vel = [0.466203685, 0.43236573, 0];

  bodies[2].mass = 1;
  bodies[2].pos = [0, 0, 0];
  bodies[2].vel = [-0.93240737, -0.86473146, 0];
  
  this.setSpatialPlotDomain(3);
};

Simulation.prototype.setEquilateralStable = function() {
  var bodies = this.system.bodies,
    scale;
  
  bodies[0].mass = 50;
  bodies[1].mass = 1;
  bodies[2].mass = 0.1;
  
  // set bodies up at equilateral triangle
  bodies[0].pos = [Math.cos(0), Math.sin(0), 0];
  bodies[1].pos = [Math.cos(2 * Math.PI / 3), Math.sin(2 * Math.PI / 3), 0];
  bodies[2].pos = [Math.cos(-2 * Math.PI / 3), Math.sin(-2 * Math.PI / 3), 0];
  
  // move to center of mass (don't worry about velocity translation, it will be undone */
  this.system.moveToCenterOfMomentum();
  scale = 3;
  bodies[0].vel = [-scale * bodies[0].pos[1], scale * bodies[0].pos[0], 0];
  bodies[1].vel = [-scale * bodies[1].pos[1], scale * bodies[1].pos[0], 0];
  bodies[2].vel = [-scale * bodies[2].pos[1], scale * bodies[2].pos[0], 0];
  
  this.setSpatialPlotDomain(5);
};

Simulation.prototype.setEquilateralUnstable = function() {
  var bodies = this.system.bodies,
    angle,
    scale;
  
  bodies[0].mass = 1;
  bodies[1].mass = 1;
  bodies[2].mass = 1;
  
  // set bodies up at equilateral triangle
  bodies[0].pos = [Math.cos(0), Math.sin(0), 0];
  bodies[1].pos = [Math.cos(2 * Math.PI / 3), Math.sin(2 * Math.PI / 3), 0];
  bodies[2].pos = [Math.cos(-2 * Math.PI / 3), Math.sin(-2 * Math.PI / 3), 0];
  
  // move to center of mass (don't worry about velocity translation, it will be undone */
  this.system.moveToCenterOfMomentum();
  
  scale = 0.5;
  bodies[0].vel = [-scale * bodies[0].pos[1], scale * bodies[0].pos[0], 0];
  bodies[1].vel = [-scale * bodies[1].pos[1], scale * bodies[1].pos[0], 0];
  bodies[2].vel = [-scale * bodies[2].pos[1], scale * bodies[2].pos[0], 0];
  
  this.setSpatialPlotDomain(5);
};

Simulation.prototype.setPythagorean = function() {
  var bodies = this.system.bodies,
    angle,
    scale;
  
  bodies[0].mass = 3;
  bodies[1].mass = 4;
  bodies[2].mass = 5;
  
  // set bodies up at pythagorean triangle
  bodies[0].pos = [1, 3, 0];
  bodies[1].pos = [-2, -1, 0];
  bodies[2].pos = [1, -1, 0];
  
  bodies[0].vel = [0, 0, 0];
  bodies[1].vel = [0, 0, 0];
  bodies[2].vel = [0, 0, 0];

  this.setSpatialPlotDomain(15);
};


Simulation.prototype.activatePresetInitialConditions = function() {
  this.populateInitialConditionsForm();
  this.resetInitialConditions();
};

Simulation.prototype.resetInitialConditions = function() {
  this.integrator.clearIntegrator();
  this.timeNextAnimate = 0;
  this.applyInitialConditionsForm();
  this.system.calcTotalEnergy();
  this.system.initialEnergy = this.system.totalEnergy;
  this.system.calcTimescale(); 
  this.calcDtAnimate();
};



Simulation.prototype.populateInitialConditionsForm = function() {
  var bodies = this.system.bodies,
    i,
    k;
    
  for (i = 0; i < this.system.N; i += 1) {
    $("#ic-b"+i+"m").val(bodies[i].mass);
    for (k = 0; k < 3; k += 1) {
      $("#ic-b"+i+"p"+k).val(bodies[i].pos[k]);
      $("#ic-b"+i+"v"+k).val(bodies[i].vel[k]);
    }
  }
};

Simulation.prototype.applyInitialConditionsForm= function() {  
  var bodies = this.system.bodies,
    bodySelection = d3.selectAll(".nbody"),
    shapeSelection = d3.selectAll(".shape-point"),
    shapeSizeSelection = d3.selectAll(".shape-point-size"),
    bodySvg = d3.select("#bodies-trail-layer"),
    shapeSvg = d3.select("#shape-layer"),
    i,
    k;

  for (i = 0; i < this.system.N; i += 1) {
    bodies[i].mass = +$("#ic-b"+i+"m").val();
    for (k = 0; k < 3; k += 1) {
      bodies[i].pos[k] = +$("#ic-b"+i+"p"+k).val();
      bodies[i].vel[k] = +$("#ic-b"+i+"v"+k).val();
      bodies[i].pos[k] = +$("#ic-b"+i+"p"+k).val();
      bodies[i].vel[k] = +$("#ic-b"+i+"v"+k).val();
    }
  }
  
  this.system.moveToCenterOfMomentum();
  this.system.calcAccels();
  
  this.integrator.copyBodiesToBodiesLast();
  this.system.calcTriangleSizeAndShape();
 
  this.transitionBodies(10, bodySelection, bodySvg);
  this.transitionShapePoint(10, shapeSelection, shapeSvg);
  this.transitionShapePointSize(10, shapeSizeSelection);
};