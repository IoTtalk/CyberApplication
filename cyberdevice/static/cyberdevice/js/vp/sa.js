let audio = {}

const preloadAudio = function(filename) {
  if (audio[filename] == undefined) {
    audio[filename] = new Audio(`/cyberdevice/static/vp/${vpName}/` + filename);
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

  // console.log(jsCode);
  program(function(err){
    if (err) console.log(err);
  });
};

const fetchCode = function(url){
  $.get(url)
   .done(function (data) {
     execute(data);
   })
   .fail(function (jqxhr, settings, execption) {
     console.log(execption);
  });
};

const renderInfo = function (info){
  document.getElementById('content').innerHTML = `<h4>${info}</h4>`;
}

window.__context = {
  glowscript_container: $('#glowscript'),
};

$(function () {
  fetchCode(`/cyberdevice/static/vp/${vpName}/${vpName}.py`);
});
