var currentElement : String;

function Start () {
	currentElement = "";
}

function Update () {
	//We must move the spawn Point a little bit away from the player.
	if (!currentElement.Equals("")) {
		
	}
}

//Set the element because we need to create the right element when pressing Ctrl.
function setElement(element : String) {
	currentElement = element;
}