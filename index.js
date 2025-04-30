let shapes = ["square", "circle", "triangle"];

//randomly chooses a shape from the array
function getRandomShape(shapesArray)
{
    return shapesArray[Math.floor(Math.random() * shapesArray.length)]
}

let randomShape = getRandomShape(shapes);

console.log("Random Shape: ", randomShape);

let speech = new SpeechSynthesisUtterance();
speech.text = randomShape;
speech.volume = 20;
speech.rate = 1;
speech.pitch = 1;
window.speechSynthesis.speak(speech);