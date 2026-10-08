(function () {
  "use strict";

  var repo = "wlwenming/wlwenming.github.io";
  var workflow = "update-ai-hot.yml";
  var branch = "main";
  var button = document.querySelector("[data-update-start]");
  var tokenInput = document.querySelector("#github-token");
  var status = document.querySelector("[data-update-status]");

  function setStatus(message) {
    status.textContent = message;
  }

  function triggerWorkflow(token) {
    return fetch("https://api.github.com/repos/" + repo + "/actions/workflows/" + workflow + "/dispatches", {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({ ref: branch })
    }).then(function (response) {
      return response.text().then(function (text) {
        var body = {};
        try {
          body = text ? JSON.parse(text) : {};
        } catch (error) {
          body = {};
        }
        if (!response.ok) {
          throw new Error("GitHub API " + response.status + (body.message ? ": " + body.message : ""));
        }
      });
    });
  }

  if (!button || !tokenInput || !status) return;
  button.addEventListener("click", function () {
    var token = tokenInput.value.trim();
    if (!token) {
      setStatus("请先填写 GitHub Token。");
      return;
    }
    button.disabled = true;
    setStatus("正在触发 GitHub Actions 实时采集……");
    triggerWorkflow(token).then(function () {
      tokenInput.value = "";
      setStatus("已触发实时采集。GitHub Actions 完成后会自动更新最新数据并归档旧数据。");
      button.disabled = false;
    }).catch(function (error) {
      setStatus("触发失败：" + error.message + "。Token 需要 Actions: Read and write 权限。");
      button.disabled = false;
    });
  });
})();