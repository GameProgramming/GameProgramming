var currentElement : String;

var airElement : Transform;
var earthElement : Transform;
var fireElement : Transform;
var waterElement : Transform;

private var layDownProgress = 0;

function Start () {
	currentElement = "";
}

function Update () {
	//We must move the spawn Point a little bit away from the player.
	layDownProgress -= Time.deltaTime;
	if (!currentElement.Equals("") && layDownProgress <= 0) {
		layDownProgress = 100;
		Spawnpoint = transform;
		SpawnVector = Vector3(Spawnpoint.position.x, Spawnpoint.position.y, Spawnpoint.position.z);
		var clone : Transform;
		if (currentElement.Equals("water")) {
			clone = Instantiate(waterElement);
		} else if (currentElement.Equals("fire")) {
			clone = Instantiate(fireElement);
		} else if (currentElement.Equals("air")) {
			clone = Instantiate(airElement);
		} else if (currentElement.Equals("earth")) {
			clone = Instantiate(earthElement);
		}
		currentElement = "";
		layDownProgress = 100;
	}
}

//Set the element because we need to create the right element when pressing Ctrl.
function SetElement(element : String) {
	currentElement = element;
}