console.log("js loaded");

class GithubFile {
  constructor() {
    this.$files = $('.files');
  }
  fetchUrl(repoUrl) {
    let repoBits = repoUrl.split('/');
    return `https://api.github.com/repos/${repoBits[3]}/${repoBits[4]}/contents/README.md`
  }

  gotData(data) {
    this.fileTitle = data.path;
    this.fileContents = window.atob(data.content);
    this.renderSelf();
  }

  renderSelf() {
    this.$files.text(`
        <div>
          <h2>${this.fileTitle}</h2>
          <p>${this.fileContents}</p>
        </div>
      `)
  }
}
$(document).ready(function() {
  let model = new GithubFile();
  let $tb = $('.repo-url')
  $('.file-finder').on('submit', function(event) {
    event.preventDefault();
    $.ajax({
      method: "GET",
      url: model.fetchUrl($tb.val()),
      success: model.gotData.bind(model)
    });
  })

});
