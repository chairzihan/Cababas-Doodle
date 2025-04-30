let shapes = ["square", "circle", "triangle",];

//randomly chooses a shape from the array
function getRandomShape(shapesArray)
{
    return shapesArray[Math.floor(Math.random() * shapesArray.length)]
}

console.log("Random Shape: ", getRandomShape(shapes));