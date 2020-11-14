'use strict'

const SELECT_BOX = document.querySelector('#sub_region')
const NAME_WRAPPER = document.querySelector('#cauntry_name_wrapper')
const FLAG_WRAPPER = document.querySelector('#cauntry_flag_wrapper')

let correctCount = null

const baseUrl = 'https://restcountries.eu/rest/v2/';

(() => {
  fetch(baseUrl + 'all')
    .then((res) => res.json())
    .then((data) => {
      const dict = makeDict(data)
      dict.forEach((v, key) => {
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
  
  fetch(baseUrl + 'subregion/' + event.target.textContent)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      const nameData = shuffle(formatData(data).nameData)
      const flagData = shuffle(formatData(data).flagData)
      setDOM(nameData, flagData)
    })
    .then(() => {
      const NAME_CARDS = document.querySelectorAll(".flag_name");
      const FLAG_CARDS = document.querySelectorAll(".flag_pic");
      const CARDS = [...NAME_CARDS, ...FLAG_CARDS];
      playGame(CARDS)
    });
})

const playGame = (CARDS) => {
  if (correctCount === CARDS.length / 2) {
    gemaClear()
    return
  }
  let answers = []
  CARDS.forEach((card) => {
    card.onclick = e => {
      const cardName = e.target.className.split(' ')[1]
      const cardPlace = e.target.className.split(' ')[0]
      // １枚めと同じ場所のカードは選択できない
      if (answers.length === 1 && answers[0][0] === cardPlace) {
        return
      } else {
        e.target.classList.add('clicked')
        answers.push([cardPlace, cardName])
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

