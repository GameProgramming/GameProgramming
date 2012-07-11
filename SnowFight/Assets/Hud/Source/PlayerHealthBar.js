private var hit : boolean = false;
private var hitTime : float = 0.0;	
private var inUFO : boolean = false;

var healthIcon :Texture;
var ufoIcon :Texture;
var energyIcon :Texture;

function OnGUI() {
	var player :PlayerStatus = gameObject.GetComponent(PlayerStatus);	
	if (player.IsMainPlayer() && !player.IsDead()) {
		var hpPercent : float = parseFloat(player.GetHp()) / parseFloat(player.GetFullHp());
		
	    var texture : Texture2D = new Texture2D(1, 1);
		
		var color = new Color(0.8, 0.0, 0.0,0.5);
		var style = new GUIStyle();
		
		var totalWidth = Screen.width/4; 
		var boxWidth = hpPercent * (Screen.width/4);
		var boxHeight = 12;
		
		
		texture.SetPixel(0, 0, color);
		texture.Apply();
		style.normal.background = texture;
		
		if (hit) {
			hitTime += Time.deltaTime;
			var hitTexture : Texture2D = new Texture2D(1, 1);
			var hitColor :Color = Color(1, 0.4, 0.2,0.6);
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
			GUI.Label (Rect (1, Screen.height - 30, 30, 30), player.team.teamIcon);
			GUI.Label (Rect (10, Screen.height - 25, 30, 30), healthIcon);
			GUI.Box (Rect (23, Screen.height - 25, totalWidth+2, boxHeight+2), "");
			GUI.Box (Rect (24, Screen.height - 24, boxWidth, boxHeight), "",style);
		} else {
			//The UFO Health display.
			var uFOScript : Ufo = transform.GetComponentInChildren(Ufo);
			if (uFOScript) {
				var uFOHealthPercent = uFOScript.hp / uFOScript.maxHp;		
				var uFOHealthTexture : Texture2D = new Texture2D(1, 1);
				var uFOHealthColor : Color = color;
				var uFOHealthStyle : GUIStyle = new GUIStyle();
				var uFOHealthBoxWidth = uFOHealthPercent * (Screen.width/4);
				uFOHealthTexture.SetPixel(0, 0, uFOHealthColor);
				uFOHealthTexture.Apply();
				uFOHealthStyle.normal.background = uFOHealthTexture;
				GUI.Label (Rect (1, Screen.height - 80, 30, 30), ufoIcon);
				GUI.Box (Rect (29, Screen.height - 75, totalWidth + 2, boxHeight+2), "");
				GUI.Box (Rect (30, Screen.height - 74, uFOHealthBoxWidth, boxHeight), "", uFOHealthStyle);
				
				//The freezing ray display.
				var uFOFreezingTexture : Texture2D = new Texture2D(1, 1);
				var uFOFreezingColor : Color = Color(.8, 1, 0.2,0.6);;
				var uFOFreezingStyle : GUIStyle = new GUIStyle();
				var ray : FreezingRay = transform.GetComponentInChildren(FreezingRay);
				var rayPercent = ray.energy / ray.energyMax;
				var freezingRayBoxWidth = rayPercent * (Screen.width/4);
				uFOFreezingTexture.SetPixel(0, 0, uFOFreezingColor);
				uFOFreezingTexture.Apply();
				uFOFreezingStyle.normal.background = uFOFreezingTexture;
				GUI.Label (Rect (1, Screen.height - 50, 30, 30), energyIcon);
				GUI.Box (Rect (29, Screen.height - 50, totalWidth + 2, boxHeight+2), "");
				GUI.Box (Rect (30, Screen.height - 49, freezingRayBoxWidth, boxHeight), "", uFOFreezingStyle);
				
				//The player health
				GUI.Label (Rect (1, Screen.height - 30, 20, 20), player.team.teamIcon);
				GUI.Label (Rect (10, Screen.height - 25, 20, 20), healthIcon);
				GUI.Box (Rect (29, Screen.height - 25, (totalWidth+2)/2, (boxHeight+2)/2), "");
				GUI.Box (Rect (30, Screen.height - 24, boxWidth/2, boxHeight/2), "",style);
			}
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
	hitTime = 0.0;
	hit = true;
}

function SetInUFO (newInUFO : boolean) {
	inUFO = newInUFO;
}

function GetInUFO () : boolean {
	return inUFO;
}

function OnItemChange(itemManager :ItemManager) {
	var item : GameObject = itemManager.GetItem();
	if (item != null) {
		inUFO = item && item.CompareTag("Ufo");
	} else {
		inUFO = false;
	}
}