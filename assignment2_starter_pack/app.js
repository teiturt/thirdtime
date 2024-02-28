// I was in this class last year so my code is probably similar  as it was last year
const LOCAL_API_URL = 'http://localhost:3000/api/v1/tunes';
const synth = new Tone.Synth().toDestination();

let tunes = [];
let recording = [];
let isRecording = false;
let startTime = 0;

const keyMap = new Map();
keyMap.set('a', 'c4');
keyMap.set('s', 'd4');
keyMap.set('d', 'e4');
keyMap.set('f', 'f4');
keyMap.set('g', 'g4');
keyMap.set('h', 'a4');
keyMap.set('j', 'b4');
keyMap.set('k', 'c5');
keyMap.set('l', 'd5');
keyMap.set(';', 'e5');
keyMap.set('æ', 'e5');
keyMap.set('w', 'c#4');
keyMap.set('e', 'd#4');
keyMap.set('t', 'f#4');
keyMap.set('y', 'g#4');
keyMap.set('u', 'bb4');
keyMap.set('o', 'c#5');
keyMap.set('p', 'd#5');

const pianoKeyClick = (element) => {
    let elementId = element.id;
    synth.triggerAttackRelease(elementId, "8n");
    if (isRecording) {
        let time = Date.now() - startTime;
        recording.push({note: elementId, duration: "8n", timing: time/1000});
    }
}

document.addEventListener("keydown", (e) => {
    if (keyMap.has(e.key) && document.activeElement.id !== "recordName") {
        let tone = keyMap.get(e.key);
        if (isRecording === true) {
            let time = Date.now() - startTime;
            recording.push({note: tone, duration: "8n", timing: time/1000});
        }
        let pianoKey = document.getElementById(tone);
        pianoKey.style.backgroundColor =  "rgb(150, 150, 150)";
        
        synth.triggerAttackRelease(tone, "8n");

        setTimeout(function (pianoKey) {
            pianoKey.style.backgroundColor =  "";
            }, 100, pianoKey);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const keyboardDiv = document.getElementById('keyboardDiv');

    keyboardDiv.addEventListener('click', function(event) {
        const target = event.target;

        if (target.tagName === 'BUTTON' && target.id) {
            pianoKeyClick(target);
        }
    });
});


const getTunes = () => {
    // Make a GET request to the API URL using Axios.
    axios.get(LOCAL_API_URL)
        .then(function (response) {
            console.log("Data retrieved:", response.data);
            tunes = response.data;
            console.log("Tunes:", tunes)
            updateOptions();
        })
        .catch(function (error) {
            console.log("Error:", error);
        })
}


const updateOptions = () => {
    //Gets the tunes
    let selector = document.getElementById("tunesDrop");
    selector.innerHTML = "";
    tunes.forEach((tune, i) => {
        let currentOpt = document.createElement("option");
        currentOpt.value = i;
        currentOpt.textContent = tune.name;
        selector.appendChild(currentOpt);
    });
}

// Post tune to backend server using Axios
const postTune = (recordName) => {
    axios.post(LOCAL_API_URL, { name: recordName, tune: recording})
        .then(function (response) {
            console.log("Successfully written: ", response.data);
            getTunes();
        })
        .catch(function (error) {
            console.log(error);
        })
}

//Here we play the audio files going through the lists
document.getElementById("tunebtn").addEventListener("click", (e) => {
    tune = tunes[document.getElementById("tunesDrop").value].tune;
    let now = Tone.now();
    tune.forEach((noteData) => {
        synth.triggerAttackRelease(noteData.note, noteData.duration, now + noteData.timing);
    });
});

//Pressing record button
document.getElementById("recordbtn").addEventListener("click", (e) => {
    let recordBtn = document.getElementById("recordbtn");
    let stopBtn = document.getElementById("stopbtn");

    recordBtn.disabled = true;
    stopBtn.disabled = false;

    recording = [];
    startTime = Date.now();
    isRecording = true;
});

//Orignal solution
document.getElementById("stopbtn").addEventListener("click", (e) => {
    let recordBtn = document.getElementById("recordbtn");
    let stopBtn = document.getElementById("stopbtn");
    recordBtn.disabled = false;
    stopBtn.disabled = true;

    startTime = 0;
    isRecording = false;
    if (recording.length > 0) {
        let inputField = document.getElementById("recordName");
        let recordName = inputField.value.trim();

        postTune(recordName || "No-name Tune");

        inputField.value = "";
    }
});

getTunes();