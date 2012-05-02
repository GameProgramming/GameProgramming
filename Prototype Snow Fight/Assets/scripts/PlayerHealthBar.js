		
		
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
		
		
		GUI.Box (Rect (Screen.width/1.4-1, 9, totalWidth+2, boxHeight+2), "");
		GUI.Box (Rect (Screen.width/1.4, 10, boxWidth, boxHeight), "",style);
		//GUI.Box (Rect (Screen.width/1.4 + (totalWidth-boxWidth), 10, boxWidth, boxHeight), "",style);
	}
}
