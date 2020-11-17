'use strict'

const SELECT_BOX = document.querySelector('#sub_region')
const NAME_WRAPPER = document.querySelector('#cauntry_name_wrapper')
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

SELECT_BOX.addEventListener('click', event => {
  console.log(event.target.textContent);
  correctCount = 0;
  initElements(NAME_WRAPPER, FLAG_WRAPPER)
  if (referMarkers) {
    removeMarker(referMarkers)
  }

  fetch(baseUrl + 'subregion/' + event.target.textContent)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      // const nameData = shuffle(formatData(data).nameData)
      const flagData = shuffle(formatData(data))
      setDOM(flagData)
      return flagData
    })
    .then((data) => {
      const markers = data.map(d => {
        return makeMarker([d.latlng[0], d.latlng[1]], d.translations.ja, 'link')
      })
      //markersの参照(referMarkers)をつくる
      referMarkers = markers
      markers.forEach(marker => {
        marker.addTo(WORLDMAP)
      })
      return data
    })
    .then((data) => {
      const MARKERS_DOM = document.querySelectorAll(".leaflet-marker-icon");
      MARKERS_DOM.forEach((dom, i) => {
        dom.classList.add(data[i].latlng.join('_'))
        // const newClass = dom.className.split(" ")
        // newClass.splice(2, 0, data[i].latlng.join("_")) 
        // dom.setAttribute('class', newClass)
      })
    })
    .then(() => {
      const MARKERS = document.querySelectorAll(".leaflet-marker-icon");
      const FLAGS = document.querySelectorAll(".flag_pic");
      const CARDS = [...MARKERS, ...FLAGS];
      console.log(CARDS);
      playGame(CARDS)
    });
})

const playGame = (CARDS) => {
  if (correctCount === CARDS.length / 2) {
    gemaClear()
    return
  }
  let answers = []
  // console.log(referMarkers);
  // console.log(CARDS);
  CARDS.forEach((card) => {
    card.onclick = e => {
      const ansPlace = e.target.className.split(' ')[0]
      const ansLatLng = e.target.className.split(' ')[3]
      console.log(ansPlace);
      console.log(ansLatLng);
      console.log(answers);
      // １枚めと同じ場所のカードは選択できない
      if (answers.length === 1 && answers[0][0] === ansPlace) {
        return
      } else {
        e.target.classList.add('clicked')
        answers.push([ansPlace, ansLatLng])
      }
      if (answers.length === 2) {
        judge(answers, CARDS);
      }
    };
  });
};

const judge = (answers, CARDS) => {
  if (answers[0][1] === answers[1][1]) {
    console.log('正解！');
    setTimeout(() => changeClass(/*del =*/ "clicked", /*add =*/ "corrected"), 1000)
    correctCount++
    console.log(correctCount);
  } else {
    console.log('間違い');
    setTimeout(() => changeClass(/*del =*/ "clicked", /*add =*/ false), 1000)
  }
  answers.length = 0
  playGame(CARDS)
}

const gemaClear = () => {
  correctCount = 0
  initElements(NAME_WRAPPER, FLAG_WRAPPER)
  NAME_WRAPPER.innerHTML = '<h1>Mission Complete!!</h1>'
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
  // let nameData = [];
  let flagData = [];
  data.forEach((d) => {
    // nameData.push({
    //   name: d.name,
    //   translations: d.translations
    // });
    flagData.push({
      name: d.name,
      flag: d.flag,
      latlng: [d.latlng[0], d.latlng[1]],
      translations: d.translations
    });
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
