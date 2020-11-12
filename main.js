'use strict'

const SELECT_BOX = document.querySelector('#sub_region')
const NAME_WRAPPER = document.querySelector('#cauntry_name_wrapper')
const FLAG_WRAPPER = document.querySelector('#cauntry_flag_wrapper')

let correct = null

const baseUrl = 'https://restcountries.eu/rest/v2/';

const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

(() => {
  fetch(baseUrl + 'all')
    .then((res) => res.json())
    .then((data) => {
      const dict = new Map();
      data.forEach((e) => {
        if (dict.has(e.subregion)) {
          const x = dict.get(e.subregion);
          dict.set(e.subregion, parseInt(x + 1));
        } else {
          dict.set(e.subregion, 1);
        }
      });
      dict.forEach((v, key) => {
        createTag('option', ['value', key], key + ' : ' + v + 'カ国', SELECT_BOX)
      });
    });
})();

SELECT_BOX.addEventListener('change', event => {
  console.log(event.target.value);
  initElements(NAME_WRAPPER, FLAG_WRAPPER)
  
  fetch(baseUrl + 'subregion/' + event.target.value)
    .then((res) => res.json())
    .then((data) => createHTML(data))
    .then(() => startGame());
})

const createHTML = (data) => {
  data.forEach((el) => {
    createTag('p', ['class', `flag_name ${el.name.replace(/\s/g, '_')}`], `${el.translations.ja}`, NAME_WRAPPER);
    createTag('img', [['src', el.flag],['class', `flag_pic ${el.name.replace(/\s/g, '_')}`]], false, FLAG_WRAPPER);
  });
}


const startGame = () => {
  const NAME_CARDS = document.querySelectorAll('.flag_name');
  const FLAG_CARDS = document.querySelectorAll('.flag_pic');
  const CARDS = [...NAME_CARDS, ...FLAG_CARDS]
  
  let answers = []

  CARDS.forEach((flag) => {
    flag.addEventListener('click', (e) => {
      const card = e.target
      const cardName = card.className.split(' ')[1]
      const cardID = card.className.split(' ')[0]
      if (answers.length === 1 && answers[0][0] === cardID) {
        return
      } else {
        card.classList.add('clicked')
        answers.push([cardID, cardName])
      }
      if (answers.length === 2) {
        doJudge(answers, card);
      }
    });
  });
};

const doJudge = answers => {
  if (answers[0][1] === answers[1][1]) {
    console.log('正解');
    correct += 1
    setTimeout(() => classNames_remove_or_add('clicked', 'corrected'), 1000)
  } else {
    console.log('間違い');
    setTimeout(() => classNames_remove_or_add('clicked', false), 1000)
  }
  answers.length = 0
  startGame()
}

const classNames_remove_or_add = (className, addName) => {
  const elements = document.querySelectorAll(`.${className}`)
  elements.forEach(element => element.classList.remove(className))
  if (addName) {
    elements.forEach(element => element.classList.add(addName));
  }
}


const initElements = (...args) => {
  args.forEach(arg => {
    while (arg.firstChild) {
      arg.removeChild(arg.firstChild);
    }
  });
};





//createTag('p', ['id', 'user_name' ], 'username: ', data_wrapper) return <p id='user_name'>username: </p>
//attrs, contentが不要の時はfalseを引数に入れてください
const createTag = (elementName, attrs, content, parentNode) => {
  const el = document.createElement(elementName)

  if (attrs !== false) {
    if (typeof attrs !== 'object') {
      console.error(
        '第２引数は配列、ペアでお願いします[attribute, attributeName]\n属性やテキストが必要ないときは"false"を入れてください'
      );
      return;
    }

    if (typeof attrs[0] === 'object') {
      attrs.forEach(attr => {
        el.setAttribute(attr[0], attr[1])
      })
    } else {
      el.setAttribute(attrs[0], attrs[1])
    }
  }

  if (content !== false) el.textContent = content

  if (parentNode) parentNode.appendChild(el)

  return el
}


