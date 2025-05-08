let shapes = ["swipe up", "swipe down", "swipe right", "swipe right"];

//randomly chooses a shape from the array
function speakRandomShape()
{
    let randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    console.log("Random Shape: ", randomShape);

    //sets up the speech synthesis
    let speech = new SpeechSynthesisUtterance(randomShape);
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

   //actually speaks the shape
    window.speechSynthesis.speak(speech);
    

    speech.onend = function()
    {
        setTimeout(speakRandomShape, 1000); //Delay 1 second before next shape

    };
}

//start the loop after voices are loaded (Without this, the text to speech will not play)
window.speechSynthesis.onvoiceschanged = function()
{
    speakRandomShape();
}