console.log("js loaded");

class GithubFile {
  constructor(filePath) {
    this.filePath = filePath;
    this.className = filePath.replace("/", "-").replace(".", "-")
    this.$div = $('<div/>').addClass(this.className).html(`
      <h2>${this.filePath}</h2>
      <p></p>
    `);
  }
  fetchUrl(repoUrl) {
    let repoBits = repoUrl.split('/');
    return `https://api.github.com/repos/${repoBits[3]}/${repoBits[4]}/contents/${this.filePath}`
  }

  gotData(data) {
    this.filePath = data.path;
    this.fileContents = window.atob(data.content);
    this.renderSelf();
  }

  gotError() {
    this.fileContents = "File not found";
    this.renderSelf();
  }

  renderSelf() {
    this.$div.children("h2").text(this.filePath);
    this.$div.children("p").text(this.fileContents);
  }
}
$(document).ready(function() {
  const $tb = $('.repo-url');
  const $fb = $('.file-paths');
  const $files = $('.files')
  const models = {};
  const DEFAULT_FILE_PATHS = {
    node: "README.md,package.json,server.js,public/index.html,public/app.js",
    rails: "i dunno nathan, what do you want"
  }
  function getModel(filePath) {
    let model = models[filePath];
    if (!model) {
      model = new GithubFile(filePath);
      models[filePath] = model;
    }
    $files.append(model.$div);
    return model;
  }

  function startFileSearch(file) {
    const model = getModel(file);
    $.ajax({
      method: "GET",
      url: model.fetchUrl($tb.val()),
      success: model.gotData.bind(model),
      error: model.gotError.bind(model)
    });
  }

  function isWeirdFile(file) {
    return file.substring(file.length - 3) in {
      "ico": true,
      "png": true,
      "jpg": true
    }
  }

  function startDirectorySearch(path) {
    const splitPath = path.split("*");

    const repoBits = $tb.val().split("/")
    $.ajax({
      method: "GET",
      url: `https://api.github.com/repos/${repoBits[3]}/${repoBits[4]}/git/trees/master`,
      success: function(res) {
        let searchableThing = res.tree.find(thing => thing.path + "/" === splitPath[0]);
        console.log("searchableThing", searchableThing, res.tree, splitPath)
        if (searchableThing) {
          $.ajax({
            method: "GET",
            url: searchableThing.url,
            success: function(finalRes) {
              for (const file of finalRes.tree) {
                console.log("starting file search for", file)
                if (!isWeirdFile(file.path)) {
                  startFileSearch(`${splitPath[0]}${file.path}${splitPath[1]}`)
                }
              }
            }
          })
        }
      }
    })
  }
  function containsWildcard(file) {
    return file.includes("*");
  }
  $('.file-finder').on('submit', function(event) {
    event.preventDefault();
    $('.files').html('');
    let files = $fb.val().split(',');
    for (const file of files) {
      if (containsWildcard(file)) {
        startDirectorySearch(file);
      } else {
        startFileSearch(file);
      }
    }
  });

  $('.file-sets').on('change', function(event) {
    $fb.val(DEFAULT_FILE_PATHS[event.target.value])
  })

});
