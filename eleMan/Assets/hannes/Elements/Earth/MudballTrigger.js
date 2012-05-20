
var textDisplay : GUIText;


function Start() {
    if(GameObject.Find("Text Display")) {
	    textDisplay = GameObject.Find("Text Display").guiText;
	    textDisplay.text = "";
    } 
}


function OnTriggerEnter(col : Collider) {
	
    if (col.gameObject.tag == "Wood" || col.gameObject.tag == "Soil" || col.gameObject.tag == "Grass"|| col.gameObject.tag == "Mudball") {
        transform.parent.gameObject.rigidbody.constraints = RigidbodyConstraints.FreezePositionX | RigidbodyConstraints.FreezePositionY | RigidbodyConstraints.FreezePositionZ | RigidbodyConstraints.FreezeRotationX | RigidbodyConstraints.FreezeRotationY | RigidbodyConstraints.FreezeRotationZ;
		textDisplay.text = "mudball stcks on "+ col.gameObject.tag;
		//Remove this trigger
		Destroy (gameObject);
	    
    }
}