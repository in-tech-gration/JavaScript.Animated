const { clear, log } = console; clear();
const $               = document.querySelector.bind(document);
const slices          = [];
const start           = $("#start");
const ratios          = [0,27.75,55.5,83.25,111,138.75,166.5,194.25,222,249.75,277.5,305.25,332.25];
const pizzaEl         = $("#source");
const pizzaTarget     = $("#target")
const sliceRatio      = 27.75;
const editArea        = $("#code");
const reset           = $("#reset");
const negIdx          = $("#negative");
const sliceBtn        = $("#slice-btn");
const animationDelays = [];
const cut             = [1,8];
let currentSlice      = null;
let pizza             = 360;
let isNegIdx          = false;
let currentChallenge  = 0;
let currentExercise   = null;
let gameStarted       = false;
let debugMode         = false;
let bgPlay            = null;
const exercises = originalExercises.slice();
const exercisesLen = originalExercises.length;
function createSlice({ i, neg, missing }){
  const nextRatio = (pizza -= sliceRatio).toFixed(2);
  const pizzaSliceDeg = nextRatio > 0 ? nextRatio : 0;
  const slice = document.createElement("div");
  slice.setAttribute("class","slice");
  const deg = `rotate(-${ratios[i]}deg)`;
  slice.style.transform = deg;
  const num = document.createElement("span");
  num.setAttribute("class","slice-num");
  const swap = (((13-i))%13)+1;
  num.textContent = neg ? swap - 14 : swap;
  num.style.transform = `rotate(${ratios[i]}deg)`;
  slice.appendChild(num);
  slice.classList.toggle("missing", missing);
  return slice;
}
function renderPizza({ el, from = 1, to = 14, neg = false }){

  // Handle Negative Indices:
  if ( from < 0 ){ from = 14 - Math.abs(from) }
  if ( to < 0 ){ to = 14 - Math.abs(to) }

  el.innerHTML = "";
  for ( let i = 0; i <= 12; i++ ){
    let missing = false;
    const swap = (((13-i))%13)+1;
    if ( swap < from || swap >= to ){
      missing = true;
    }
    const slice = createSlice({ i, neg, missing });
    // if ( !missing ){
    //   el.appendChild(slice);
    // }
    el.appendChild(slice);
  }
}
function play(audioFile, loop = false) {
  const muted = mute.dataset.Mute === "true";
  if (muted && !loop) return;
  const audio = new Audio("assets/" + audioFile);
  audio.loop = loop;
  !debugMode && audio.play();
  muted && audio.pause();
  return audio;
}
function toggleMute() {
  mute.textContent = mute.dataset.Mute === "false" ? "🔊" : "🔇";
  mute.dataset.Mute = mute.dataset.Mute === "false" ? "true" : "false";
  try {
    mute.dataset.Mute === "false" ? bgPlay.play() : bgPlay.pause();
  } catch (e) {}
}
function pizzaCheck(){
  if ( !gameStarted ){
    return false;
  }
  play("mixkit-sword-blade-lashes-chainmail-armor-2776.wav");

  sliceBtn.style.animation = "slice 1s normal forwards";
  sliceBtn.addEventListener("animationend", e =>{
    sliceBtn.style.animation = "";
  });

  pizzaEl.innerHTML = "";
  currentSlice = code.textContent.split(",");
  renderPizza({ el: pizzaEl, from: currentSlice[0], to: currentSlice[1], neg: isNegIdx });
  const areSame = comparePizzas(pizzaEl, pizzaTarget);
  if ( areSame ){
    pizzaEl.classList.add("match");
    pizzaTarget.classList.add("match");
    setTimeout(()=>{

      const nextExercise = exercises.shift();
      if (!nextExercise){
        start.style.background = `lime`;
        start.textContent = `Completed: ${currentChallenge} out of ${exercisesLen}`
        return Swal.fire({
          title: "Congratulations!",
          text: "You've completed all the pizza slices challenges!",
          icon: "success"
        }).then(()=>{
          confettis();
        })
      }
      currentExercise = nextExercise;

      Swal.fire({
        title: "Good job!",
        text: "The 2 pizzas match!",
        icon: "success"
      }).then(()=>{
        const percentage = Math.floor((currentChallenge/exercisesLen)*100)
        start.style.background = `linear-gradient(90deg, lime ${percentage}%, lightgray ${percentage}%, lightgray 100%)`;

          let { level, neg } = currentExercise;
          level = "🌶️".repeat(level);
          isNegIdx = neg ? neg : isNegIdx;
          start.textContent = `Challenge: ${++currentChallenge} out of ${exercisesLen} ${level}`
          renderPizza({ el: pizzaEl, from: currentSlice[0], to: currentSlice[1], neg: isNegIdx });
          pizzaEl.classList.remove("match");
          pizzaTarget.classList.remove("match");
          renderPizza({ el: pizzaTarget, from: currentExercise.args[0], to: currentExercise.args[1], neg: isNegIdx });
      })
    },1500);
  } else {
    pizzaEl.classList.remove("match");
    pizzaTarget.classList.remove("match");
    setTimeout(()=>{
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Pizzas don't match!"
      });
    },1000);
  }

}
function comparePizzas( a, b ){

  const areDifferent = Array.from(a.children).some((s,i) => {
    if ( s.outerHTML !== b.children[i].outerHTML ){
      // log(s.outerHTML, b.children[i].outerHTML)
    }
    return s.outerHTML !== b.children[i].outerHTML;
  });
  return !areDifferent;

}
function startGame(e){
  if ( gameStarted ){
    return false;
  }
  bgPlay = play("mixkit-yo-chucky-861.mp3", true);
  pizzaEl.classList.add("active");
  gameStarted = true;
  // DRY:
  currentExercise = exercises.shift();
  let { level, neg } = currentExercise;
  level = "🌶️".repeat(level);
  isNegIdx = neg;
  start.textContent = `Challenge: ${++currentChallenge} out of ${exercisesLen} ${level}`
  renderPizza({ el: pizzaTarget, from: currentExercise.args[0], to: currentExercise.args[1], neg: isNegIdx });

}
function resetGame(e){
  pizzaEl.classList.remove("match");
  pizzaTarget.classList.remove("match");
  exercises.length = 0;
  exercises.push(...originalExercises);
  currentChallenge = 0;
  const percentage = Math.floor((currentChallenge/exercisesLen)*100)
  start.style.background = `linear-gradient(90deg, lime ${percentage}%, lightgray ${percentage}%, lightgray 100%)`;
  start.textContent = `Challenge: ${++currentChallenge} out of ${exercisesLen}`
  currentExercise = exercises.shift();
  renderPizza({ el: pizzaTarget, from: currentExercise.args[0], to: currentExercise.args[1], neg: isNegIdx });
}
// INIT UI:
renderPizza({ el: pizzaEl });

// LISTENERS:
code.addEventListener("input", e =>{
  e.preventDefault();
  e.target.textContent = e.target.textContent.replace(/[a-zA-Z]/g,"");
});
code.addEventListener("keyup", e =>{
  e.preventDefault();
  if ( e.code === "Enter"){
    pizzaCheck();
  }
});
sliceBtn.addEventListener("click", e =>{
  pizzaCheck();
});
start.addEventListener("click", startGame);
reset.addEventListener("click", resetGame);
negIdx.addEventListener("click", e=>{
  if ( isNegIdx ){

    isNegIdx = false;

    if ( currentSlice ){
      renderPizza({ el: pizzaEl, from: currentSlice[0], to: currentSlice[1] });
    } else {
      renderPizza({ el: pizzaEl });
    }

    if ( currentExercise ){
      renderPizza({ el: pizzaTarget, from: currentExercise.args[0], to: currentExercise.args[1] });
    } else {
      renderPizza({ el: pizzaTarget });
    }

    negIdx.style.background = "white";
    negIdx.style.color = "black";

  } else {
    isNegIdx = true;

    if ( currentSlice ){
      renderPizza({ el: pizzaEl, from: currentSlice[0], to: currentSlice[1], neg: true });
    } else {
      renderPizza({ el: pizzaEl, neg: true });
    }

    if ( currentExercise ){
      renderPizza({ el: pizzaTarget, from: currentExercise.args[0], to: currentExercise.args[1], neg: true });
    } else {
      renderPizza({ el: pizzaTarget, neg: true });
    }

    negIdx.style.background = "black";
    negIdx.style.color = "white";
  }
});
// editArea.focus();
mute.addEventListener("click", toggleMute);