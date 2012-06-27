private var hit : boolean = false;
private var hitTime : float = 0.0;	
		
function OnGUI() {
	
	if (transform.tag.Equals("Player")) {
	var player = gameObject.GetComponent("PlayerStatus");
	
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
		GUI.Box (Rect (9, Screen.height - 25, totalWidth+2, boxHeight+2), "");
		GUI.Box (Rect (10, Screen.height - 24, boxWidth, boxHeight), "",style);
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