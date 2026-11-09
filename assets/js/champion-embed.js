(function () {
  const frame = document.getElementById("championFrame");
  const status = document.getElementById("championStatus");
  const openLink = document.getElementById("championOpenLink");
  if (!frame || !status || !openLink) return;

  const url = String(window.FORERUNNERS_CHAMPION_WEB_APP_URL || "").trim();
  const validUrl = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(url);

  const messages = {
    en: {
      ready: "The public assessment is loading below. If it does not appear, open it in a new tab.",
      missing: "The assessment will appear here once its secure public deployment URL is configured."
    },
    my: {
      ready: "Public Assessment ကို အောက်တွင် ဖွင့်နေပါသည်။ မပေါ်ပါက Tab အသစ်တွင် ဖွင့်နိုင်ပါသည်။",
      missing: "လုံခြုံသော Public Deployment URL ထည့်သွင်းပြီးပါက Assessment ကို ဤနေရာတွင် ပြသပါမည်။"
    }
  };

  function updateStatus() {
    const language = document.documentElement.lang === "my" ? "my" : "en";
    status.textContent = validUrl ? messages[language].ready : messages[language].missing;
  }

  if (validUrl) {
    frame.src = url;
    frame.hidden = false;
    openLink.href = url;
    openLink.hidden = false;
    status.dataset.i18n = "championReady";
  }

  updateStatus();
  new MutationObserver(updateStatus).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });
})();
