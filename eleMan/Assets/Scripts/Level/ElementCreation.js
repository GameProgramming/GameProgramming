var currentElement : String;
var airElement : Rigidbody;
var earthElement : Rigidbody;
var fireElement : Rigidbody;
var waterElement : Rigidbody;

function Start () {
	currentElement = "";
}

function Update () {
	//Instantiate the right objects --> ask Hannes!
	if (!currentElement.Equals("")) {
		Spawnpoint = transform;
		SpawnVector = Vector3(Spawnpoint.position.x, Spawnpoint.position.y, Spawnpoint.position.z);
		var clone : Rigidbody;
		if (currentElement.Equals("water")) {
			clone = Instantiate(waterElement, SpawnVector, Spawnpoint.rotation);
		} else if (currentElement.Equals("fire")) {
			clone = Instantiate(fireElement, SpawnVector, Spawnpoint.rotation);
		} else if (currentElement.Equals("air")) {
			clone = Instantiate(airElement, SpawnVector, Spawnpoint.rotation);
		} else if (currentElement.Equals("earth")) {
			clone = Instantiate(earthElement, SpawnVector, Spawnpoint.rotation);
		}
		currentElement = "";
	}
}

//Set the element because we need to create the right element when pressing Ctrl.
function SetElement(element : String) {
	currentElement = element;
}