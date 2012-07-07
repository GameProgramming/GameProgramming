private var inUFO : boolean = false;
private var blinkingTime : float = 0.0;

function OnGUI() {

	//Get the player status script.
	var player :PlayerStatus = gameObject.GetComponent(PlayerStatus);
	if (player.IsMainPlayer() && !player.IsDead()) {
	
		
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
		
		if (!inUFO) {
			//Now create the boxes.
			for (i=0; i<numberOfBoxes; i++) {			
				GUI.Box (Rect (Screen.width - j - 1, Screen.height-25, boxWidth+2, boxHeight+2), "");
				if (i < numberOfSnowballs) {
					GUI.Box(Rect (Screen.width - j, Screen.height-25, boxWidth, boxHeight), "", style);
				}
				j -= boxWidth;
			}
			if (numberOfSnowballs == 0) {
				blinkingTime += Time.deltaTime;
				//Create the red layout if there is no ammu anymore.
				var noAmmuTexture : Texture2D = new Texture2D(1, 1);
				var noAmmuStyle : GUIStyle = new GUIStyle();
				var noAmmuColor : Color = new Color(1, 0, 0, 0.5);
				noAmmuTexture.SetPixel(0, 0, noAmmuColor);
				noAmmuTexture.Apply();
				noAmmuStyle.normal.background = noAmmuTexture;
				if (blinkingTime <= 0.3) {
					GUI.Box (Rect (Screen.width - 231, Screen.height - 25, 181, 20), "");
					GUI.Box (Rect (Screen.width - 230, Screen.height - 25, 180, 20), "", noAmmuStyle);
				} else if (blinkingTime >= 0.6) {
					blinkingTime = 0.0;
				}
			}
		} else {
			//Now create the boxes.
			for (i=0; i<numberOfBoxes; i++) {			
				GUI.Box (Rect (Screen.width - j - 1, Screen.height-25, (boxWidth+2)/2, (boxHeight+2)/2), "");
				if (i < numberOfSnowballs) {
					GUI.Box(Rect (Screen.width - j, Screen.height-25, boxWidth/2, boxHeight/2), "", style);
				}
				j -= boxWidth/2;
			}
		}


	}
	
}

function OnItemChange(itemManager :ItemManager) {
	var item :GameObject = itemManager.GetItem();
	if (item != null) {
		inUFO = item && item.CompareTag("Ufo");
	} else {
		inUFO = false;
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

function SetInUFO (newInUFO : boolean) {
	inUFO = newInUFO;
}