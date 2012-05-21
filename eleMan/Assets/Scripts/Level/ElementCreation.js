var currentElement : String;
var airElement : Transform;
var earthElement : Transform;
var fireElement : Transform;
var waterElement : Transform;

function Start () {
	currentElement = "";
}

function Update () {
	//Instantiate the right objects --> ask Hannes!
	if (!currentElement.Equals("")) {
		if (currentElement.Equals("water")) {
		} else if (currentElement.Equals("fire")) {
		} else if (currentElement.Equals("air")) {
		} else if (currentElement.Equals("earth")) {
		}
	}
}

//Set the element because we need to create the right element when pressing Ctrl.
function setElement(element : String) {
	currentElement = element;
}