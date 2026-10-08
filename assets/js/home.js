(function () {
  "use strict";

  // First item matches the greeting already written in index.html.
  var greetings = [
    {
      lines: ["愿你在这里放慢脚步，", "看见一点温暖，带走一份好心情。"],
      sig: "—— 世界很大，幸好我们相遇。"
    },
    {
      lines: ["这里没有广告，没有弹窗，", "只有一个人、一句话，和一整片好心情。"],
      sig: "—— 既然来了，就别急着走啦 :)"
    },
    {
      lines: ["每一次睁开眼，都是新的视界；", "每一次出发，都离梦想更近一步。"],
      sig: "—— 愿你眼里有光，心中有梦，脚下有路。"
    },
    {
      lines: ["世界或许不完美，", "但善意、热爱与坚持，总会让一切慢慢变好。"],
      sig: "—— 今天也要元气满满哦！"
    },
    {
      lines: ["生活像一扇窗，推开是风景，关上是安宁。", "愿你在这片视界里，", "既看得见远方，也守得住心安。"],
      sig: "—— 慢慢走，美好都在路上。"
    },
    {
      lines: ["今日份的小确幸已送达：", "一个微笑、一句你好、一整片晴朗。", "请查收，并把它传递下去。"],
      sig: "—— 你也是别人的好心情之一呀。"
    },
    {
      lines: ["外面的世界很热闹，", "这里是一个小小的、安静的角落。", "愿你在这一隅，", "能歇一歇，再出发。"],
      sig: "—— 歇脚处，也是风景。"
    },
    {
      lines: ["温馨提示：", "本站不含焦虑、不含压力、0 卡路里。", "可放心浏览，副作用仅为嘴角上扬。"],
      sig: "—— 请保持微笑，有人在偷偷看你呢。"
    },
    {
      lines: ["所谓视界，", "不过是敢多走一步、多看一眼。", "再远的远方，", "也不过是一步步走到的远方。"],
      sig: "—— 走着走着，花就开了。"
    },
    {
      lines: ["如果你今天有点累，", "那就允许自己只做一件事——", "好好呼吸，好好存在。", "你本身，就已足够好。"],
      sig: "—— 世界需要你这样温柔的人。"
    }
  ];

  var scrollThreshold = 200;

  function renderGreeting(root, greeting) {
    var fragment = document.createDocumentFragment();
    greeting.lines.forEach(function (line) {
      var paragraph = document.createElement("p");
      paragraph.textContent = line;
      fragment.appendChild(paragraph);
    });
    var signature = document.createElement("div");
    signature.className = "sig";
    signature.textContent = greeting.sig;
    fragment.appendChild(signature);
    root.textContent = "";
    root.appendChild(fragment);
  }

  function setToTopVisible(button, visible) {
    button.classList.toggle("is-visible", visible);
    button.setAttribute("aria-hidden", visible ? "false" : "true");
    if (visible) button.removeAttribute("tabindex");
    else button.setAttribute("tabindex", "-1");
  }

  function overlapsFooter(button, footer) {
    var buttonRect = button.getBoundingClientRect();
    var footerRect = footer.getBoundingClientRect();
    return buttonRect.width > 0 &&
      buttonRect.left < footerRect.right &&
      buttonRect.right > footerRect.left &&
      buttonRect.top < footerRect.bottom &&
      buttonRect.bottom > footerRect.top;
  }

  function initGreeting(root) {
    var choice = greetings[Math.floor(Math.random() * greetings.length)];
    renderGreeting(root, choice);
  }

  function initToTop(button, footer) {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function sync() {
      var scrolled = window.scrollY > scrollThreshold;
      setToTopVisible(button, scrolled && !overlapsFooter(button, footer));
    }

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    sync();
  }

  var greeting = document.querySelector("[data-greeting]");
  var toTop = document.querySelector("[data-to-top]");
  var footer = document.querySelector("[data-site-footer]");
  if (greeting) initGreeting(greeting);
  if (toTop && footer) initToTop(toTop, footer);
})();
