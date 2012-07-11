private var hit : boolean = false;
private var hitTime : float = 0.0;	
private var inUFO : boolean = false;

private var ammoTime : float = 0.0;	

private var blinkingTime : float = 0.0;
private var hasRocketLauncher : boolean = false;
private var rocketLauncher :RocketLauncher;

var neutralStyle : GUIStyle;
var snowballTexture : Texture2D;
var rocketTexture : Texture2D;
var noAmmoTexture : Texture2D;
var noAmmoTextureBlink : Texture2D;

var healthIcon :Texture;
var healthIconGrey :Texture;
var ufoIcon :Texture;
var energyIcon :Texture;

function OnGUI() {
	var player :PlayerStatus = gameObject.GetComponent(PlayerStatus);	
	if (player.IsMainPlayer() && !player.IsDead()) {
		var hpPercent : float = parseFloat(player.GetHp()) / parseFloat(player.GetFullHp());
		var x :float = 10;
		var y :float = Screen.height - 50;
		if (hit) {
			hitTime += Time.deltaTime;
			if (hitTime >= 3.0) {
				hitTime = 0.0;
				hit = false;
			}
		}
		
		ammoTime = Mathf.Clamp(ammoTime-2*Time.deltaTime, 0,3);
		
		var playerInfoShift :float = 0;
		if (inUFO || hasRocketLauncher) playerInfoShift = 10;
		GUI.Label (Rect (x, y-15+2*playerInfoShift, 60-2*playerInfoShift, 60-2*playerInfoShift), player.team.teamIcon);
		GUI.Label (Rect (x+20, y+2*playerInfoShift, (60-2*playerInfoShift), (60-2*playerInfoShift)), healthIconGrey);
		var iconSize :float = hpPercent*(60-2*playerInfoShift);
		var iconOff :float = ((60-2*playerInfoShift)-iconSize)*.5;
		GUI.Label (Rect (x+20+iconOff, y+2*playerInfoShift+iconOff, iconSize, iconSize), healthIcon);
//		DrawBar ( Rect(x - 200+3*playerInfoShift, y-5*playerInfoShift, 180-3*playerInfoShift, 20), hpPercent,
//					Color(0.8, 0.0, 0.0,0.5), 0);
		
		var ammoMaxNumber : int = player.GetMaximumSnowballs();
		var ammoNumber : int = player.GetCurrentSnowballs();
		var h :float = 45-1.5*playerInfoShift;
		var w :float = 2*3*(30-playerInfoShift) / ammoMaxNumber;
		var currX :float = x+50+2*playerInfoShift+ 2*3*(30-playerInfoShift);
		for (var i :int = 0; i < ammoMaxNumber; i++) {
			var tex :Texture =
				i >= (ammoMaxNumber-ammoNumber) ? snowballTexture
							   				    : (ammoTime%1 > 0.5 ? noAmmoTextureBlink : noAmmoTexture);
			GUI.Label( Rect (currX, y+2*playerInfoShift, h, h), tex);
			currX -= w;
		}
		
		if (hasRocketLauncher) {
			ammoMaxNumber = rocketLauncher.initialAmmo;
			ammoNumber= rocketLauncher.GetAmmo();
			h = 60;
			w = 120 / ammoMaxNumber;
			currX = x+20+120;
			for (i = 0; i < ammoMaxNumber; i++) {
				tex =
					i >= (ammoMaxNumber-ammoNumber) ? rocketTexture
								   				    : (ammoTime%1 > 0.5 ? noAmmoTextureBlink : noAmmoTexture);
				GUI.Label( Rect (currX, y-40, h, h), tex);
				currX -= w;
			}
		}
		
		if (inUFO) {
			var ray : FreezingRay = transform.GetComponentInChildren(FreezingRay);
			GUI.Label( Rect (x+35, y-10, 30, 30), energyIcon);
			if(ray)
				DrawBar ( Rect(x+50, y+2, 180-3*playerInfoShift, 10), ray.energy / ray.energyMax,
					Color(0.6, 0.8, 0.0,0.6), 0);
		}
		
//		if (!inUFO) {
//			
//		} else {
//			//The UFO Health display.
//			var uFOScript : Ufo = transform.GetComponentInChildren(Ufo);
//			if (uFOScript) {
//				var uFOHealthPercent = uFOScript.hp / uFOScript.maxHp;		
//				var uFOHealthTexture : Texture2D = new Texture2D(1, 1);
//				var uFOHealthColor : Color = color;
//				var uFOHealthStyle : GUIStyle = new GUIStyle();
//				var uFOHealthBoxWidth = uFOHealthPercent * (Screen.width/4);
//				uFOHealthTexture.SetPixel(0, 0, uFOHealthColor);
//				uFOHealthTexture.Apply();
//				uFOHealthStyle.normal.background = uFOHealthTexture;
//				GUI.Label (Rect (1, Screen.height - 80, 30, 30), ufoIcon);
//				GUI.Box (Rect (29, Screen.height - 75, totalWidth + 2, boxHeight+2), "");
//				GUI.Box (Rect (30, Screen.height - 74, uFOHealthBoxWidth, boxHeight), "", uFOHealthStyle);
//				
//				//The freezing ray display.
//				var uFOFreezingTexture : Texture2D = new Texture2D(1, 1);
//				var uFOFreezingColor : Color = Color(.8, 1, 0.2,0.6);;
//				var uFOFreezingStyle : GUIStyle = new GUIStyle();
//				var ray : FreezingRay = transform.GetComponentInChildren(FreezingRay);
//				var rayPercent = ray.energy / ray.energyMax;
//				var freezingRayBoxWidth = rayPercent * (Screen.width/4);
//				uFOFreezingTexture.SetPixel(0, 0, uFOFreezingColor);
//				uFOFreezingTexture.Apply();
//				uFOFreezingStyle.normal.background = uFOFreezingTexture;
//				GUI.Label (Rect (1, Screen.height - 50, 30, 30), energyIcon);
//				GUI.Box (Rect (29, Screen.height - 50, totalWidth + 2, boxHeight+2), "");
//				GUI.Box (Rect (30, Screen.height - 49, freezingRayBoxWidth, boxHeight), "", uFOFreezingStyle);
//				
//				//The player health
//				GUI.Label (Rect (1, Screen.height - 30, 20, 20), player.team.teamIcon);
//				GUI.Label (Rect (10, Screen.height - 25, 20, 20), healthIcon);
//				GUI.Box (Rect (29, Screen.height - 25, (totalWidth+2)/2, (boxHeight+2)/2), "");
//				GUI.Box (Rect (30, Screen.height - 24, boxWidth/2, boxHeight/2), "",style);
//			}
//		}
//		
//		
//		//Create a new texture and style.
//		texture = new Texture2D(1, 1);
//		color = new Color(1, 1, 1, 1);
//		style = new GUIStyle();
//		//Width of a single box.
//		boxWidth = 18;
//		//Height of a single box.
//		boxHeight = 18;
//		//Set the style.
//		texture.SetPixel(0, 0, color);
//		texture.Apply();
//		style.normal.background = texture;
//		
//		//Get the number of maximum balls.
//		var numberOfBoxes = player.GetMaximumSnowballs();
//		//Get the number of current snowballs.
//		var numberOfSnowballs = player.GetCurrentSnowballs();
//		var j : int = boxWidth * numberOfBoxes + 50;
//		
//		if (!inUFO) {
//			//Create the boxes for the rocket launcher.
//			if (hasRocketLauncher) {
//				var maxNumberOfRockets : int = rocketLauncher.initialAmmo;
//				var numberOfRockets : int = rocketLauncher.GetAmmo();
//				j = boxWidth*2*maxNumberOfRockets + 50;
//				for (i=0; i<maxNumberOfRockets; i++) {
//					if (i < numberOfRockets) {
//						GUI.Label (Rect (Screen.width - j, Screen.height - boxHeight * 4, boxWidth*4, boxHeight*4), rocketTexture);
//					}
//					j -= boxWidth * 2;
//				}
//				if (numberOfRockets == 0) {
//					GUI.Label (Rect (Screen.width - 200, Screen.height - boxHeight * 2, 200, 30), "No Rockets anymore.", neutralStyle);
//				}
//			} else {
//				//Now create the boxes.
//				for (i=0; i<numberOfBoxes; i++) {			
//					if (i < numberOfSnowballs) {
//						GUI.Label (Rect (Screen.width - j, Screen.height - boxHeight * 2, boxWidth*2, boxHeight*2), snowballTexture);
//					}
//					j -= boxWidth;
//				}
//				if (numberOfSnowballs == 0) {
//					GUI.Label (Rect (Screen.width - 200, Screen.height - boxHeight * 2, 200, 30), "No Snowballs anymore.", neutralStyle);
//				}
//			}
//
//
//		} else {
//			j = boxWidth * numberOfBoxes * 0.8 + 50;
//			//Now create the boxes.
//			for (i=0; i<numberOfBoxes; i++) {
//				if (i < numberOfSnowballs) {
//					GUI.Label (Rect (Screen.width - j, Screen.height - boxHeight * 1.5, boxWidth * 1.5, boxHeight*1.5), snowballTexture);
//				}
//				j -= boxWidth * 0.8;
//			}
//			if (numberOfSnowballs == 0) {
//				GUI.Label (Rect (Screen.width - 200, Screen.height - boxHeight, 200, 30), "No Snowballs anymore.", neutralStyle);
//			}
//		}
//
		//GUI.Box (Rect (Screen.width/1.4 + (totalWidth-boxWidth), 10, boxWidth, boxHeight), "",style);
	}
}

function DrawBar ( r :Rect, ratio :float, color :Color, off :float) {
	var tex : Texture2D = new Texture2D(1, 1);
	var style = new GUIStyle();
	tex.SetPixel(0, 0, color);
	tex.Apply();
	style.normal.background = tex;
	
	GUI.Box (r, "");
	GUI.Box (Rect (r.x+1, r.y+1+off, ratio * (r.width - 2 - off*2), r.height-2-2*off), "", style);
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

function SetHit () {
	hitTime = 0.0;
	hit = true;
}

function SetInUFO (newInUFO : boolean) {
	inUFO = newInUFO;
}

function GetInUFO () : boolean {
	return inUFO;
}

function OnCantThrow () {
	if (ammoTime < 0.5) ammoTime = 3;
}

function OnItemChange(itemManager :ItemManager) {
	var item : GameObject = itemManager.GetItem();
	if (item != null) {
		hasRocketLauncher = item && item.CompareTag("Weapon");
		inUFO = item && item.CompareTag("Ufo");
		if (hasRocketLauncher) {
			rocketLauncher = item.GetComponent(RocketLauncher);
		}
	} else {
		inUFO = false;
		hasRocketLauncher = false;
	}
}