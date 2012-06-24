function OnGUI() {

	if (transform.tag.Equals("Player")) {
	
		//Get the player status script.
		var player = gameObject.GetComponent("PlayerStatus");
		//Create a new texture and style.
		var texture : Texture2D = new Texture2D(1, 1);
		var color = new Color(1, 1, 1, 1);
		var style = new GUIStyle();
		//Width of a single box.
		var boxWidth = 18;
		//Height of a single box.
		var boxHeight = 18;
		//Set the style.
		texture.SetPixel(0, 0, color);
		texture.Apply();
		style.normal.background = texture;
		
		//Get the number of maximum balls.
		var numberOfBoxes = player.GetMaximumSnowballs();
		//Get the number of current snowballs.
		var numberOfSnowballs = player.GetCurrentSnowballs();
		var j : int = boxWidth * numberOfBoxes + 50;
		
		//Now create the boxes.
		for (i=0; i<numberOfBoxes; i++) {
			GUI.Box (Rect (Screen.width - j - 1, Screen.height-25, boxWidth+2, boxHeight+2), "");
			if (i < numberOfSnowballs) {
				GUI.Box(Rect (Screen.width - j, Screen.height-25, boxWidth, boxHeight), "", style);
			}
			j -= boxWidth;
			
		}
		
	}
	
}

function OnSetBot () {
	enabled = false;
}
function OnSetMainPlayer () {
	enabled = true;
}
function OnSetRemote () {
	enabled = false;
}