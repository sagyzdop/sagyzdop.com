(function () {
  "use strict";

  var langNames = {
    py: "Python",
    python: "Python",
    js: "JavaScript",
    javascript: "JavaScript",
    ts: "TypeScript",
    typescript: "TypeScript",
    sh: "Shell",
    shell: "Shell",
    bash: "Bash",
    zsh: "Zsh",
    html: "HTML",
    htm: "HTML",
    css: "CSS",
    json: "JSON",
    xml: "XML",
    yaml: "YAML",
    yml: "YAML",
    toml: "TOML",
    ini: "INI",
    go: "Go",
    golang: "Go",
    rust: "Rust",
    java: "Java",
    kt: "Kotlin",
    kotlin: "Kotlin",
    swift: "Swift",
    c: "C",
    cpp: "C++",
    cs: "C#",
    csharp: "C#",
    php: "PHP",
    ruby: "Ruby",
    sql: "SQL",
    diff: "Diff",
    patch: "Diff",
    markdown: "Markdown",
    md: "Markdown",
    dockerfile: "Dockerfile",
    makefile: "Makefile",
    nginx: "Nginx",
    text: "Text",
    plaintext: "Text",
  };

  function fallbackCopy(text, onDone) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {}
    document.body.removeChild(ta);
    onDone();
  }

  document.querySelectorAll(".code-copy-btn").forEach(function (btn) {
    var langEl = btn.querySelector(".code-copy-lang");
    var lang = (btn.getAttribute("data-lang") || "").toLowerCase();
    if (langEl) {
      var label =
        langNames[lang] ||
        (lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : "Text");
      langEl.textContent = label;
    }

    btn.addEventListener("click", function () {
      var done = function () {
        btn.classList.add("copied");
        setTimeout(function () {
          btn.classList.remove("copied");
        }, 2000);
      };
      var text = btn.getAttribute("data-code") || "";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done, function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    });
  });
})();