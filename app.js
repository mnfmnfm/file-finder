console.log("js loaded");

class GithubFile {
  constructor(filePath) {
    this.filePath = filePath;
    this.className = filePath.replace("/", "-").replace(".", "-")
    this.$div = $('<div/>').addClass(this.className).html(`
      <h2>${this.filePath}</h2>
      <p></p>
    `);
    // add to page
    $('.files').append(this.$div);
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

  renderSelf() {
    this.$div.children("h2").text(this.filePath);
    this.$div.children("p").text(this.fileContents);
  }
}
$(document).ready(function() {
  let $tb = $('.repo-url');
  let $fb = $('.file-paths');
  let models = [];
  function getModel(filePath) {
    let model = models.find((model) => model.filePath == filePath);
    if (!model) {
      model = new GithubFile(filePath);
      models.push(model);
    }
    return model;
  }
  $('.file-finder').on('submit', function(event) {
    event.preventDefault();
    let files = $fb.val().split(',');
    for (let file of files) {
      let model = getModel(file);
      $.ajax({
        method: "GET",
        url: model.fetchUrl($tb.val()),
        success: model.gotData.bind(model)
      });
    }
  })

});
