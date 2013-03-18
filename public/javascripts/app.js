'use strict';

(function (window) {

  var container, camera, scene, projector,
      renderer, theta  = 0, radius = 600,
      PI2 = Math.PI * 2, mouse = { x: 0, y: 0 }, INTERSECTED;

  //default material
  var fill = function (context) {
    context.beginPath();
    context.arc(0, 0, 1, 0, PI2);
    context.fill();
    context.closePath();
  };

  init();
  animate();

  function init() {
    //get the container and set width and height
    container        = document.getElementById('container');
    container.width  = window.innerWidth;
    container.height = window.innerHeight;

    //camera settings
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 300, 300);

    //create a THREE scene
    scene = new THREE.Scene();

    for (var i = 0, total = window.mentions.length; i < total; i ++) {
      var mention = window.mentions[i],
          //create a particle with the material and the user link color
          particle = new THREE.Particle(new THREE.ParticleCanvasMaterial({ color: "#" + mention.user.profile_link_color, program: fill }));

      //put the particle in a random position
      particle.position.x = Math.random() * 800 - 400;
      particle.position.y = Math.random() * 800 - 400;
      particle.position.z = Math.random() * 800 - 400;
      particle.mention    = mention;

      //make the particle size proportional to the text size in the mention
      particle.scale.x = particle.scale.y = particle.mention.text.length / 3;
      //set a random opacity
      particle.material.opacity = 0.6;

      //add the particle to the scene
      scene.add(particle);
    }

    //create the projector
    projector = new THREE.Projector();

    //create the render object
    renderer  = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    //insert the render element in the container
    container.appendChild(renderer.domElement);

    //move the camera with the mouse move and the window resize
    document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    //rotate the camera
    theta += 0.1;
    camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
    camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
    camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));

    //camera look to the scene
    camera.lookAt(scene.position);

    //find intersections
    camera.updateMatrixWorld();

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    projector.unprojectVector(vector, camera);

    var raycaster  = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize()),
        intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      if (INTERSECTED != intersects[0].object) {
        if (INTERSECTED) {
          INTERSECTED.material.opacity = 0.6;
        }

        INTERSECTED = intersects[0].object;
        INTERSECTED.material.opacity = 1;

        showMention(INTERSECTED);
      }
    } else {
      if (INTERSECTED) {
        INTERSECTED.material.opacity = 0.6;
      }

      cleanMention();
      INTERSECTED = null;
    }

    renderer.render(scene, camera);
  }


  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

  //compile the mention template with the particle data
  function showMention(particle) {
    var mention  = particle.mention,
      template   = '<div class="circle mention" style="background-color: #{{ color }}"><p>{{ text }}</p><img src="{{ profile_image }}"><small>@{{ screen_name }}</small></div>',
      compiled   = Hogan.compile(template),
      data       = {
        text: mention.text,
        screen_name: mention.user.screen_name,
        profile_image: mention.user.profile_image_url,
        color: mention.user.profile_link_color
      };

    document.getElementById('mention').innerHTML = compiled.render(data);
  }

  //clean the mention
  function cleanMention() {
    document.getElementById('mention').innerHTML = "";
  }

})(window);
