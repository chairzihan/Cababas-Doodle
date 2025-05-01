let shapes = ["square", "circle", "triangle"];

//randomly chooses a shape from the array
function speakRandomShape()
{
    let randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    console.log("Random Shape: ", randomShape);

    let speech = new SpeechSynthesisUtterance(randomShape);
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

   
    window.speechSynthesis.speak(speech);
    

    speech.onend = function()
    {
        setTimeout(speakRandomShape, 1000); //Delay 1 second before next shape

    };
}

//start the loop after voices are loaded
window.speechSynthesis.onvoiceschanged = function()
{
    speakRandomShape();
}