private var hit : boolean = false;
private var hitTime : float = 0.0;	
private var inUFO : boolean = false;

function OnGUI() {
	var player = gameObject.GetComponent("PlayerStatus");	
	if (player.IsMainPlayer()) {
		var hpPercent : float = parseFloat(player.GetHp()) / parseFloat(player.GetFullHp());
		
	    var texture : Texture2D = new Texture2D(1, 1);
		
		var color = new Color(1-hpPercent, hpPercent, 0,0.5);
		var style = new GUIStyle();
		
		var totalWidth = Screen.width/4; 
		var boxWidth = hpPercent * (Screen.width/4);
		var boxHeight = 20;
		
		
		texture.SetPixel(0, 0, color);
		texture.Apply();
		style.normal.background = texture;
		
		if (hit) {
			hitTime += Time.deltaTime;
			var hitTexture : Texture2D = new Texture2D(1, 1);
			var hitColor = Color.red;
			var hitStyle = new GUIStyle();
			texture.SetPixel(0, 0, hitColor);
			texture.Apply();
			style.normal.background = texture;
			GUI.Box (Rect (5, Screen.height - 27, boxWidth+10, boxHeight+6), "", hitStyle);
			if (hitTime >= 3.0) {
				hitTime = 0.0;
				hit = false;
			}
		}
		if (!inUFO) {
			GUI.Box (Rect (9, Screen.height - 25, totalWidth+2, boxHeight+2), "");
			GUI.Box (Rect (10, Screen.height - 24, boxWidth, boxHeight), "",style);
		} else {
			//The UFO Health display.
			var uFOScript : Ufo = transform.GetComponentInChildren(Ufo);
			var uFOHealthPercent = uFOScript.hp / uFOScript.maxHp;		
			var uFOHealthTexture : Texture2D = new Texture2D(1, 1);
			var uFOHealthColor : Color = new Color(1-hpPercent, hpPercent, 0,0.5);
			var uFOHealthStyle : GUIStyle = new GUIStyle();
			var uFOHealthBoxWidth = uFOHealthPercent * (Screen.width/4);
			uFOHealthTexture.SetPixel(0, 0, uFOHealthColor);
			uFOHealthTexture.Apply();
			uFOHealthStyle.normal.background = uFOHealthTexture;
			GUI.Box (Rect (9, Screen.height - 75, totalWidth + 2, boxHeight+2), "");
			GUI.Box (Rect (10, Screen.height - 74, uFOHealthBoxWidth, boxHeight), "", uFOHealthStyle);
			
			//The freezing ray display.
			var uFOFreezingTexture : Texture2D = new Texture2D(1, 1);
			var uFOFreezingColor : Color = Color.blue;
			var uFOFreezingStyle : GUIStyle = new GUIStyle();
			var ray : FreezingRay = transform.GetComponentInChildren(FreezingRay);
			var rayPercent = ray.energy / ray.energyMax;
			var freezingRayBoxWidth = rayPercent * (Screen.width/4);
			uFOFreezingTexture.SetPixel(0, 0, uFOFreezingColor);
			uFOFreezingTexture.Apply();
			uFOFreezingStyle.normal.background = uFOFreezingTexture;
			GUI.Box (Rect (9, Screen.height - 50, totalWidth + 2, boxHeight+2), "");
			GUI.Box (Rect (10, Screen.height - 49, freezingRayBoxWidth, boxHeight), "", uFOFreezingStyle);
			
			//The player health.
			GUI.Box (Rect (9, Screen.height - 25, (totalWidth+2)/2, (boxHeight+2)), "");
			GUI.Box (Rect (10, Screen.height - 24, boxWidth/2, boxHeight/2), "",style);
		}

		//GUI.Box (Rect (Screen.width/1.4 + (totalWidth-boxWidth), 10, boxWidth, boxHeight), "",style);
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

function SetHit () {
	hit = true;
}

function SetInUFO (newInUFO : boolean) {
	inUFO = newInUFO;
}

function GetInUFO () : boolean {
	return inUFO;
}