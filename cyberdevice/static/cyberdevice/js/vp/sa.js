let audio = {}

const preloadAudio = function(filename) {
  if (audio[filename] == undefined) {
    audio[filename] = new Audio(`/cyberdevice/static/vp/${vp_name}/` + filename);
  }
};

const playAudio = function(filename) {
  preloadAudio(filename);
  if (audio[filename] != undefined) {
    audio[filename].play();
  }
};

const execute = function (code) {
  const options = {
    lang: 'vpython',
    version: 2.7
  };

  const jsCode = glowscript_compile(code, options);
  const program = eval(jsCode);

  console.log(js_code);
  program(function(err){
    if (err) console.log(err);
  });
};

const fetch_code = function(url){
  $.get(url)
   .done(function (data) {
     execute(data);
   })
   .fail(function (jqxhr, settings, execption) {
     console.log(execption);
  });
};

window.__context = {
  glowscript_container: $('#glowscript'),
};

var originHash;
$(function () {
  originHash = window.location.hash;
  fetch_code(`/cyberdevice/static/vp/${vp_name}/${vp_name}.py`);
});

$(window).on('hashchange', function (a) {
  if (window.location.hash != originHash) {
    window.location.hash = originHash;
  }
});

