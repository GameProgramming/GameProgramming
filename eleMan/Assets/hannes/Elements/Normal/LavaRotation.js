var textDisplay : GUIText;
var degree : float;
var direction : String;
function Start () {
if(GameObject.Find("Text Display")) {
	    textDisplay = GameObject.Find("Text Display").guiText;
	    textDisplay.text = "";
    } 
}

function Update () {
	textDisplay.text = ""+transform.rotation.x;
	
	if (direction == "right")
		transform.Rotate(Vector3.right * Time.deltaTime * degree);
	if (direction == "left")
		transform.Rotate(Vector3.left * Time.deltaTime * degree);
	if (direction == "up")
		transform.Rotate(Vector3.up * Time.deltaTime * degree);
	if (direction == "down")
		transform.Rotate(Vector3.down * Time.deltaTime * degree);
}