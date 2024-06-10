const speechIcons = document.querySelectorAll("#speechIcon");
const form = document.getElementById("msf");

const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.maxAlternatives = 1;
recognition.lang = 'fi-FI';
recognition.activeFieldIndex = 0;
recognition.isStarted = false;

let currentTab = 0;
showTab(currentTab); // Display the current tab

function showTab(n) {
   let formTab = document.getElementsByClassName("form-tab");
   formTab[n].style.display = "block";

   if (n == 0) {
      document.getElementById("prevBtn").style.display = "none";
   } else {
      document.getElementById("prevBtn").style.display = "inline";
   }
   if (formTab == (formTab.length - 1)) {
      document.getElementById("nextBtn").innerText = "Submit";
   } else {
      document.getElementById("nextBtn").innerText = "Next";
   }

   changeStepIndicator(n)
}

function nextPrev(n) {
   const formTab = document.querySelectorAll(".form-tab");

   if(recognition.isStarted) {
      alert("Täytä ensin kenttä loppuun!");
      return;
   }

   formTab[currentTab].style.display = "none";
   currentTab = currentTab + n;

   if (currentTab >= formTab.length) {
      document.getElementById("msf").submit();
      return;
   }

   showTab(currentTab);
   if (n === 1) recognition.start(); // if prev we won't start the recognition
}

function changeStepIndicator(n) {
   const stepIndicator = document.getElementById("stepIndicator");
   const formTabs = document.getElementsByClassName("form-tab");
   stepIndicator.innerText = `${n + 1} / ${formTabs.length}`
}

recognition.onstart = function () {
   console.log("Puhetunnistus alkoi!");
   recognition.isStarted = true;

   const input = form.querySelectorAll("input, textarea");
   const icon = form.querySelectorAll("#speechIcon");

   input[currentTab].classList.add("speechActive");
   icon[currentTab].classList.add("speechActive");
};

// Kun tulos saadaan puhetunnistuksesta
recognition.onresult = function (event) {
   let final_transcript = '';
   for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
         final_transcript += event.results[i][0].transcript;
      }
   }

   let inputs = form.querySelectorAll("input, textarea");
   // Erityiskäsittely puhelinnumeroille
   if (inputs[currentTab].type === "tel") {
      // Poistetaan turhat välilyönnit jotka saattavat tulla välillä
      inputs[currentTab].value = final_transcript.replace(/\s+/g, '');
      recognition.stop();
      return;
   }

   // Asetetaan tunnistettu teksti aktiiviseen kenttään
   if (inputs[currentTab]) {
      // Vaihdetaan sanat "piste", "pilkku", "kysymysmerkki", "huutomerkki" sanat oikeihin merkkeihin
      inputs[currentTab].value = final_transcript.split(' ').join(" ").replace(/\s?piste\b/gi, '.').replace(/\s?pilkku\b/gi, ',').replace(/\s?huutomerkki\b/gi, '!').replace(/\s?kysymysmerkki\b/gi, '?').replace(/\s?ät\b/gi, '@').replace(/\s?miukku maukku\b/gi, '@').replace(/\s?at\b/gi, '@');;
      recognition.stop();
   }
};

recognition.onerror = function (event) {
   alert("Ongelma puhetunnistuksessa!");
   console.error("Ongelma puhetunnistuksessa: ", event.error);
};


recognition.onend = function () {
   console.log("Puhetunnistus loppui!");
   recognition.isStarted = false;

   const input = form.querySelectorAll("input, textarea");
   const icon = form.querySelectorAll("#speechIcon");

   input[currentTab].classList.remove("speechActive");
   icon[currentTab].classList.remove("speechActive");
};

speechIcons.forEach(icon => icon.addEventListener("click", () => {
   if(recognition.isStarted) {
      alert("Täytä ensin kenttä loppuun!");
      return;
   }
   recognition.start();
}))
