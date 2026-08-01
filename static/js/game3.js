/*
 * MINI-GAME #3: Web of Memory (Spider-Man Memory Match)
 * -------------------------------------------------------
 * Loaded only on /game/3 (see templates/games/game3.html).
 *
 * Two "web layers" of 3 logo/name pairs each (6 cards per layer).
 * Clear all pairs in the top layer -- they pop off the board -- then the
 * next layer of cards fades in underneath. Clearing the final layer calls
 * completeGame('3').
 *
 * All art lives in static/games/game3/.
 */
(function () {
  "use strict";

  var ASSET_BASE = "/static/games/game3/";
  var CARD_BACK = ASSET_BASE + "card-back.svg";

  var LAYERS = [
    [
      { id: "js", name: "JavaScript", logo: "logo-javascript.svg" },
      { id: "python", name: "Python", logo: "logo-python.svg" },
      { id: "react", name: "React", logo: "logo-react.svg" }
    ],
    [
      { id: "html5", name: "HTML5", logo: "logo-html5.svg" },
      { id: "css3", name: "CSS3", logo: "logo-css3.svg" },
      { id: "git", name: "Git", logo: "logo-git.svg" }
    ]
  ];

  var boardEl = document.getElementById("mm-board");
  var layerValueEl = document.getElementById("mm-layer-value");
  var pairsValueEl = document.getElementById("mm-pairs-value");
  var bannerEl = document.getElementById("mm-layer-banner");
  var hintEl = document.getElementById("mm-hint");

  if (!boardEl) return;

  var currentLayerIndex = 0;
  var flippedCards = [];
  var lockBoard = false;
  var pairsRemaining = 0;

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function buildCardEl(card) {
    var wrap = document.createElement("div");
    wrap.className = "mm-card" + (card.kind === "logo" ? " is-logo" : "");
    wrap.dataset.pairId = card.pairId;
    wrap.dataset.kind = card.kind;

    var inner = document.createElement("div");
    inner.className = "mm-card-inner";

    var back = document.createElement("div");
    back.className = "mm-card-face mm-card-back";
    var backImg = document.createElement("img");
    backImg.src = CARD_BACK;
    backImg.alt = "";
    back.appendChild(backImg);

    var front = document.createElement("div");
    front.className = "mm-card-face mm-card-front";
    if (card.kind === "logo") {
      var img = document.createElement("img");
      img.src = ASSET_BASE + card.logo;
      img.alt = card.name;
      front.appendChild(img);
    } else {
      var label = document.createElement("div");
      label.className = "mm-card-name";
      label.textContent = card.name;
      front.appendChild(label);
    }

    inner.appendChild(back);
    inner.appendChild(front);
    wrap.appendChild(inner);

    wrap.addEventListener("click", function () {
      onCardTap(wrap);
    });

    return wrap;
  }

  function renderLayer(layerIndex) {
    var entries = LAYERS[layerIndex];
    pairsRemaining = entries.length;
    flippedCards = [];
    lockBoard = false;

    var cards = [];
    entries.forEach(function (entry) {
      cards.push({ pairId: entry.id, kind: "logo", logo: entry.logo, name: entry.name });
      cards.push({ pairId: entry.id, kind: "name", name: entry.name });
    });
    shuffle(cards);

    boardEl.innerHTML = "";
    cards.forEach(function (card) {
      boardEl.appendChild(buildCardEl(card));
    });

    layerValueEl.textContent = (layerIndex + 1) + "/" + LAYERS.length;
    pairsValueEl.textContent = String(pairsRemaining);
  }

  function onCardTap(cardEl) {
    if (lockBoard) return;
    if (cardEl.classList.contains("is-flipped")) return;
    if (cardEl.classList.contains("is-matched")) return;
    if (flippedCards.indexOf(cardEl) !== -1) return;

    cardEl.classList.add("is-flipped");
    flippedCards.push(cardEl);

    if (flippedCards.length === 2) {
      lockBoard = true;
      checkMatch();
    }
  }

  function checkMatch() {
    var a = flippedCards[0];
    var b = flippedCards[1];
    var isMatch = a.dataset.pairId === b.dataset.pairId && a.dataset.kind !== b.dataset.kind;

    if (isMatch) {
      setTimeout(function () {
        a.classList.add("is-matched");
        b.classList.add("is-matched");
        flippedCards = [];
        lockBoard = false;
        pairsRemaining -= 1;
        pairsValueEl.textContent = String(pairsRemaining);

        if (pairsRemaining <= 0) {
          setTimeout(advanceLayer, 550);
        }
      }, 320);
    } else {
      a.classList.add("is-wrong");
      b.classList.add("is-wrong");
      setTimeout(function () {
        a.classList.remove("is-flipped", "is-wrong");
        b.classList.remove("is-flipped", "is-wrong");
        flippedCards = [];
        lockBoard = false;
      }, 700);
    }
  }

  function showBanner(text, callback) {
    bannerEl.innerHTML = '<div class="mm-layer-banner-text">' + text + "</div>";
    bannerEl.classList.add("is-active");
    setTimeout(function () {
      bannerEl.classList.remove("is-active");
      bannerEl.innerHTML = "";
      if (callback) callback();
    }, 900);
  }

  function advanceLayer() {
    currentLayerIndex += 1;
    if (currentLayerIndex >= LAYERS.length) {
      hintEl.textContent = "Web fully mapped! Securing the network...";
      showBanner("WEB SECURED!", function () {
        completeGame("3");
      });
      return;
    }
    showBanner("LAYER CLEARED!", function () {
      renderLayer(currentLayerIndex);
    });
  }

  renderLayer(currentLayerIndex);
})();
