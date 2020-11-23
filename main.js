'use strict'

const W_MAP = document.getElementById('worldmap')
const SELECT_BOX = document.getElementById('sub_region')
const START_BTN = document.getElementById('start_btn')
const MENUE_BTN = document.getElementById('menue_btn')
const SWITCH_BTN = document.getElementById('name_switch')
const MODAL_MENUE = document.getElementById('status_chart')
const FLAG_WRAPPER = document.getElementById('cauntry_flag_wrapper')
const TITLE = document.getElementById("title")

const Q_LEVEL = {
  easy:    5,
  normal: 10,
  hard:   15
}

let level = Q_LEVEL.normal

let correctCount = null
let mistakeCount = null

let referMarkers = []
let referCircle
let subregionName = null

let isPlaying = false
let nameHidden = false

const baseUrl = 'https://restcountries.eu/rest/v2/';

//ページ来訪時にデータをとりにいきHTMLタグを生成
(() => {
  fetch(baseUrl + 'all')
    .then((res) => res.json())
    .then((data) => {
      const headerDict = makeDict(data)
      createSubregionTags(headerDict);
    })
})();

//タイトルクリックで世界地図全体図にズームアウト
TITLE.addEventListener("click", () => WORLDMAP.setView(INITIAL_LATLNG, 2));

SWITCH_BTN.addEventListener('click', () => hiddenName());

START_BTN.addEventListener('click', () => {
  if (isPlaying) {
    if (confirm("テストをあきらめて地域選択にもどりますか？")) {
      changeBtn('テストにチャレンジ')
      clearView()
      if (dataManage[subregionName].challengeCount !== 0) {
        dataManage[subregionName].challengeCount--;
      }
      return
    } else {
      return;
    }
  }

  if (referMarkers.length === 0) {
    alert('地域を選択してください')
    return
  }

  dataManage[subregionName].challengeCount++
  console.log(dataManage[subregionName]);
  setFlagDOM(referMarkers)
  const MARKERS_DOM = document.querySelectorAll(".leaflet-marker-icon");
  const FLAGS_DOM = document.querySelectorAll(".flag_pic");
  MARKERS_DOM.forEach(d => {
    d.setAttribute('src', MARKER_URL)
    d.style.width = "30px";
    d.style.height = "30px";
  })
  changeBtn('もどる')

  const TARGET_DOMS = [...MARKERS_DOM, ...FLAGS_DOM]
  playGame(TARGET_DOMS)

})

//エリア選択で
SELECT_BOX.addEventListener('click', event => {
  console.log(event.target.className.split(' ')[0]);
  if (event.target.className.split(" ")[0] !== "subregion") {
    return;
  }
  if (isPlaying) {
    return
  }
  
  referMarkers.forEach(d => {
    d.closePopup()
  })

  initElements(FLAG_WRAPPER)

  subregionName = event.target.textContent
  const target = event.target.id.replace(/_/g, " ");
  fetch(baseUrl + 'subregion/' + target)
    .then((res) => res.json())
    .then((data) => {
      //dataを整形
      return shuffle(formatData(data))
    })
    .then((data) => {
      //マーカーを設置
      console.time('test')
      const markers = data.map(d => {
        return makeMarker([d.latlng[0], d.latlng[1]], d.translations.ja, 'link')
      })
    console.timeEnd('test')

      //マーカーデータの参照を作成
      referMarkers = markers

      //ズームインの為の座標値を算出
      let sumLat = null
      let sumLng = null
      markers.forEach(marker => {
        sumLat += marker._latlng.lat
        sumLng += marker._latlng.lng
        marker.addTo(WORLDMAP)
      })
      //ズームしてポインタを表示
      WORLDMAP.setView([sumLat / markers.length, sumLng / markers.length], 4);
      const circle = makeCircle(sumLat / markers.length, sumLng / markers.length)
      referCircle = circle
      circle.addTo(MINIMAP)
      return data
    })
    .then((data) => {
      const MARKERS_DOM = document.querySelectorAll(".leaflet-marker-icon");
      MARKERS_DOM.forEach((DOM, i) => {
        //classの座標値でjudgeする方向性
        DOM.classList.add(data[i].latlng.join("_"));
        //マーカーのimgを国旗に変更
        DOM.setAttribute("src", data[i].flag);
        DOM.style.width = "60px";
        DOM.style.height = "40px";
      })
    })
})


const playGame = (TERGET_DOMS) => {
  isPlaying = true
  if (correctCount === level) {
    isPlaying = false
    clearView('Mission Complete!!')
    changeBtn("テストにチャレンジ");
    dataManage[subregionName].clearCount++;
    return
  }
  let answers = []
  TERGET_DOMS.forEach((target_dom) => {
    target_dom.onclick = e => {
      const ansContainer = e.target.className.split(' ')[0]
      const ansLatLng = e.target.className.split(' ')[3]
      if (
        // １枚めと同じcontainerは選択できない
        answers.length === 1 && answers[0][0] === ansContainer ||
        // 正解したマーカーは選択できない
        e.target.getAttribute("name") === "corrected"
      ) {
        return;
      } else {
        e.target.classList.add("clicked");
        answers.push([ansContainer, ansLatLng, e.target]);
      }
      if (answers.length === 2) {
        judge(answers, TERGET_DOMS);
      }
    };
  });
};

const judge = (answers, TERGET_DOMS) => {
  if (answers[0][1] === answers[1][1]) {
    console.log('正解！');
    const markerDom = getImgSrc(answers).markerDom
    const flagSrc = getImgSrc(answers).flagSrc
    const flagDom = getImgSrc(answers).flagDom
    console.log(markerDom, flagSrc);
    setTimeout(() => {
      changeClass(/*del =*/ "clicked", /*add =*/ false)
      flagDom.classList.add('corrected')
      markerDom.setAttribute('name', 'corrected')
      markerDom.setAttribute('src', flagSrc)
      markerDom.style.width = '40px'
      markerDom.style.height = '30px'
    }, 1000)
    correctCount++
    console.log(correctCount);
  } else {
    console.log('間違い');
    setTimeout(() => changeClass(/*del =*/ "clicked", /*add =*/ false), 1000)
    mistakeCount++
    if (mistakeCount === 3) {
      clearView('game over...')
      changeBtn("テストにチャレンジ");
      return
    }
  }
  answers.length = 0
  playGame(TERGET_DOMS)
}

const clearView = (...args) => {
  isPlaying = false
  console.log(args[0]);
  if (args.length) {
    console.log(args);
    FLAG_WRAPPER.innerHTML = `<h1>${args[0]}</h1>`;
  }
  correctCount = 0;
  mistakeCount = 0;
  initElements(FLAG_WRAPPER);
  referMarkers.length = 0;
};

const makeDict = (data) => {
  const dict = new Map();
  data.forEach((e) => {
    if (dict.has(e.subregion)) {
      const x = dict.get(e.subregion);
      dict.set(e.subregion, parseInt(x + 1));
    } else {
      dict.set(e.subregion, 1);
    }
  });
  return dict;
};

const createSubregionTags = (dict) => {
  let i = 0
  let renameKey = []
  let japaneseKey = Object.keys(dataManage);
  dict.forEach((val, key) => {
    renameKey.push(key.replace(key, japaneseKey[i]))
    if (key) {
      const outlineTag = createTag('div', ['class', 'select_btn my-1 mr-3'], false, false)
      createTag(
          /*tag*/     "button",
        [
          [/*attr1*/ "id", `${key.replace(/\s+/g, "_")}`],
          [/*attr2*/ "class", `subregion btn btn-dark py-1 px-3`]
        ],
          /*value*/   renameKey[i],
          /*append*/  outlineTag
      );
      const innerTag = createTag('div', ['class', 'content_wrap m-0 p-0'], false, outlineTag)
      createTag('p', ['class', 'cauntry_count subregion_content m-0 p-0'], `${val}カ国`, innerTag)
      createTag("p", ["class", "level subregion_content m-0 p-0"], '', innerTag);
      createTag('a', [['class', 'info subregion_content m-0 p-0'],['href', '#']], `${renameKey[i]}を調べる`, outlineTag)
      SELECT_BOX.appendChild(outlineTag)
    }
    i++;
  });
  createChart(renameKey);
}


const formatData = (data) => {
  let flagData = [];
  data.forEach((d) => {
    if (d.latlng[0] !== undefined || d.latlng[1] !== undefined) {
      flagData.push({
        name: d.name,
        flag: d.flag,
        latlng: [d.latlng[0], d.latlng[1]],
        translations: d.translations
      })
    }
  });
  return flagData
};

const setFlagDOM = (flagData) => {
  for (let i = 0; i < level; i++) {
    if (i >= flagData.length) return;
    createTag(
      "img",
      [
        ["src", flagData[i]._icon.currentSrc],
        ["class", `flag_pic _ _ ${flagData[i]._latlng.lat}_${flagData[i]._latlng.lng}`],
      ],
      false,
      FLAG_WRAPPER
    );
  }
};

const shuffle = ([...arr]) => {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    console.log(i);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
};

const initElements = (...args) => {
  if (referMarkers) {
    removeMarker(referMarkers);
  }
  if (referCircle) {
    removeCircle(referCircle);
  }
  args.forEach((arg) => {
    while (arg.firstChild) {
      arg.removeChild(arg.firstChild);
    }
  });
};

const changeClass = (delClassName, addClassName) => {
  const elements = document.querySelectorAll(`.${delClassName}`);
  elements.forEach((element) => element.classList.remove(delClassName));
  if (addClassName) {
    elements.forEach((element) => element.classList.add(addClassName));
  }
};

const getImgSrc = (answers) => {
  console.log(answers[0][0], answers[1][0]);
  if (answers[0][0] !== "flag_pic") {
    return {
      markerDom: answers[0][2],
      markerSrc: answers[0][2].getAttribute("src"),
      flagDom: answers[1][2],
      flagSrc: answers[1][2].getAttribute("src"),
    };
  } else {
    return {
      markerDom: answers[1][2],
      markerSrc: answers[1][2].getAttribute("src"),
      flagDom: answers[0][2],
      flagSrc: answers[0][2].getAttribute("src"),
    };
  }
}

const changeBtn = (text) => {
  if (text === "もどる") {
    START_BTN.textContent = text;
    START_BTN.classList.remove("btn-info");
    START_BTN.classList.add("btn-danger");
  } else if (text === "テストにチャレンジ") {
    START_BTN.textContent = text;
    START_BTN.classList.remove("btn-danger");
    START_BTN.classList.add("btn-info");
  }
};


//createTag('p', ['id', 'user_name' ], 'username: ', data_wrapper)
//attrs, contentが不要の時はfalseを引数に入れてください
const createTag = (elementName, attrs, content, parentNode) => {
  const el = document.createElement(elementName);

  if (attrs !== false) {
    if (typeof attrs !== "object") {
      console.error(
        '第２引数は配列、ペアでお願いします[attribute, attributeName]\n属性やテキストが必要ないときは"false"を入れてください'
      );
      return;
    }

    if (typeof attrs[0] === "object") {
      attrs.forEach((attr) => {
        el.setAttribute(attr[0], attr[1]);
      });
    } else {
      el.setAttribute(attrs[0], attrs[1]);
    }
  }

  if (content !== false) el.textContent = content;

  if (parentNode) parentNode.appendChild(el);

  return el;
};


const dataManage = {
  "南アジア": {
    challengeCount: null,
    clearCount: null
  },
  "北ヨーロッパ": {
    challengeCount: null,
    clearCount: null
  },
  "南ヨーロッパ": {
    challengeCount: null,
    clearCount: null
  },
  "北アフリカ": {
    challengeCount: null,
    clearCount: null
  },
  "ポリネシア": {
    challengeCount: null,
    clearCount: null
  },
  "中央アフリカ": {
    challengeCount: null,
    clearCount: null
  },
  "カリブ海": {
    challengeCount: null,
    clearCount: null
  },
  "": {
    challengeCount: null,
    clearCount: null
  },
  "南アメリカ": {
    challengeCount: null,
    clearCount: null
  },
  "西アジア": {
    challengeCount: null,
    clearCount: null
  },
  "オーストラリア": {
    challengeCount: null,
    clearCount: null
  },
  "西ヨーロッパ": {
    challengeCount: null,
    clearCount: null
  },
  "東ヨーロッパ": {
    challengeCount: null,
    clearCount: null
  },
  "中央アメリカ": {
    challengeCount: null,
    clearCount: null
  },
  "西アフリカ": {
    challengeCount: null,
    clearCount: null
  },
  "北アメリカ": {
    challengeCount: null,
    clearCount: null
  },
  "南部アフリカ": {
    challengeCount: null,
    clearCount: null
  },
  "東アフリカ": {
    challengeCount: null,
    clearCount: null
  },
  "東南アジア": {
    challengeCount: null,
    clearCount: null
  },
  "東アジア": {
    challengeCount: null,
    clearCount: null
  },
  "メラネシア": {
    challengeCount: null,
    clearCount: null
  },
  "ミクロネシア": {
    challengeCount: null,
    clearCount: null
  },
  "中央アジア": {
    challengeCount: null,
    clearCount: null
  },
};