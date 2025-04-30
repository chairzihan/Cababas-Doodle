let shapes = ["square", "circle", "triangle"];

//randomly chooses a shape from the array
function getRandomShape(shapesArray)
{
    return shapesArray[Math.floor(Math.random() * shapesArray.length)]
}

//stores the random shape in a ariable
let randomShape = getRandomShape(shapes);

console.log("Random Shape: ", randomShape);

//stores the random text to speech shape in a variable
let speech = new SpeechSynthesisUtterance(randomShape);

speech.volume = 1;
speech.rate = 1;
speech.pitch = 1;

//loads the voices and allows the text to speech to occur once the voices have loaded
window.speechSynthesis.onvoiceschanged = function()
{
    window.speechSynthesis.speak(speech);
}






