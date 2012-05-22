var textDisplay : GUIText;

function Start () {
	if (GameObject.Find("Text Display")) {
		textDiplay = GameObject.Find("Text Display").guiText;
		textDisplay.text = "";
	}
}

function OnTriggerEnter (col : Collider) {
	//Get the player game Object.
	if (col.gameObject.tag == "Player") {
		player = col.gameObject;
		//Check if he is water or air.
		if (player.GetComponent("ElemanStats").element == "water" || player.GetComponent("ElemanStats").element == "air") {
			//Insert here that he falls through the grid
		}
		//Message text display.
		textDisplay.text = player.GetComponent("ElemanStats").element + "Player Hit Grid";
	}

}