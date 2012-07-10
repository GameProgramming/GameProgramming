private var inUFO : boolean = false;
private var blinkingTime : float = 0.0;
private var hasRocketLauncher : boolean = false;

var neutralStyle : GUIStyle;
var snowballTexture : Texture2D;

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
			//Create the boxes for the rocket launcher.
			if (hasRocketLauncher) {
				var maxNumberOfRockets : int = numberOfBoxes/3;
				var numberOfRockets : int = numberOfSnowballs/3;
				j = boxWidth*2*maxNumberOfRockets + 50;
				for (i=0; i<maxNumberOfRockets; i++) {
					if (i < numberOfRockets) {
						GUI.Label (Rect (Screen.width - j, Screen.height - boxHeight * 4, boxWidth*4, boxHeight*4), snowballTexture);
					}
					j -= boxWidth * 2;
				}
				if (numberOfRockets == 0) {
					GUI.Label (Rect (Screen.width - 200, Screen.height - boxHeight * 2, 200, 30), "No Rockets anymore.", neutralStyle);
				}
			} else {
				//Now create the boxes.
				for (i=0; i<numberOfBoxes; i++) {			
					if (i < numberOfSnowballs) {
						GUI.Label (Rect (Screen.width - j, Screen.height - boxHeight * 2, boxWidth*2, boxHeight*2), snowballTexture);
					}
					j -= boxWidth;
				}
				if (numberOfSnowballs == 0) {
					GUI.Label (Rect (Screen.width - 200, Screen.height - boxHeight * 2, 200, 30), "No Snowballs anymore.", neutralStyle);
				}
			}


		} else {
			j = boxWidth * numberOfBoxes * 0.8 + 50;
			//Now create the boxes.
			for (i=0; i<numberOfBoxes; i++) {
				if (i < numberOfSnowballs) {
					GUI.Label (Rect (Screen.width - j, Screen.height - boxHeight * 1.5, boxWidth * 1.5, boxHeight*1.5), snowballTexture);
				}
				j -= boxWidth * 0.8;
			}
			if (numberOfSnowballs == 0) {
				GUI.Label (Rect (Screen.width - 200, Screen.height - boxHeight, 200, 30), "No Snowballs anymore.", neutralStyle);
			}
		}


	}
	
}

function OnItemChange(itemManager :ItemManager) {
	var item : GameObject = itemManager.GetItem();
	if (item != null) {
		hasRocketLauncher = item && item.CompareTag("Weapon");
		inUFO = item && item.CompareTag("Ufo");
	} else {
		inUFO = false;
		hasRocketLauncher = false;
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