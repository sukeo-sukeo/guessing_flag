'use strict'

const SELECT_BOX = document.querySelector('#sub_region')
const FLAG_WRAPPER = document.querySelector('#cauntry_flag_wrapper')

let correctCount = null
let referMarkers

const baseUrl = 'https://restcountries.eu/rest/v2/';

(() => {
  fetch(baseUrl + 'all')
    .then((res) => res.json())
    .then((data) => {
      const subregions = makeDict(data)
      subregions.forEach((_, key) => {
        if (key) {
          createTag(
             /*tag*/     "button",
            [
              [/*attr1*/ "id", `${key.replace(/\s+/g, "_")}`],
              [/*attr2*/ "class", `subregion btn btn-primary m-1 p-1`]
            ],
             /*value*/   key,
             /*append*/  SELECT_BOX
          );
        }
      });
    });
})();

document
  .querySelector("#title")
  .addEventListener("click", () => WORLDMAP.setView([36, 138], 2));

SELECT_BOX.addEventListener('click', event => {
  if (event.target.id === 'sub_region') {
    return
  }

  correctCount = 0;
  initElements(FLAG_WRAPPER)

  if (referMarkers) {
    removeMarker(referMarkers)
  }

  fetch(baseUrl + 'subregion/' + event.target.textContent)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      const flagData = shuffle(formatData(data))
      setDOM(flagData)
      return flagData
    })
    .then((data) => {
      console.log(data);
      const markers = data.map(d => {
        return makeMarker([d.latlng[0], d.latlng[1]], d.translations.ja, 'link')
      })
      //どこからでも参照できるようにmarkers[]の参照(referMarkers[])をつくっておく
      referMarkers = markers
      let sumLat = null
      let sumLng = null
      markers.forEach(marker => {
        sumLat += marker._latlng.lat
        sumLng += marker._latlng.lng
        marker.addTo(WORLDMAP)
      })
      WORLDMAP.setView([sumLat / markers.length, sumLng / markers.length], 4);
      return data
    })
    .then((data) => {
      const MARKERS_DOM = document.querySelectorAll(".leaflet-marker-icon");
      const FLAGS_DOM = document.querySelectorAll(".flag_pic");
      MARKERS_DOM.forEach((dom, i) => dom.classList.add(data[i].latlng.join('_')))
      return [...MARKERS_DOM, ...FLAGS_DOM];
    })
    .then((TARGET_DOMS) => {
      playGame(TARGET_DOMS)
    });
})

const playGame = (TERGET_DOMS) => {
  if (correctCount === TERGET_DOMS.length / 2) {
    gemaClear()
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
        console.log(answers[0], answers[1]);
        console.log(TERGET_DOMS);
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
  }
  answers.length = 0
  playGame(TERGET_DOMS)
}

const gemaClear = () => {
  correctCount = 0
  initElements(FLAG_WRAPPER)
  FLAG_WRAPPER.innerHTML = '<h1>Mission Complete!!</h1>'
}


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

const setDOM = (flagData) => {
  // nameData.forEach((el) => {
  //   createTag(
  //     "p",
  //     ["class", `flag_name ${el.name.replace(/\s/g, "_")}`],
  //     `${el.translations.ja}`,
  //     NAME_WRAPPER
  //   );
  // });
  flagData.forEach((el) => {
    createTag(
      "img",
      [
        ["src", el.flag],
        ["class", `flag_pic ${el.name.replace(/\s/g, "_")} _ ${el.latlng.join('_')}`],
      ],
      false,
      FLAG_WRAPPER
    );
  });
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

//createTag('p', ['id', 'user_name' ], 'username: ', data_wrapper) return <p id='user_name'>username: </p>
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
