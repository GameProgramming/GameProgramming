		
		
function OnGUI() {
	
	if (transform.tag.Equals("Player")) {
	var player = gameObject.GetComponent("PlayerStatus");
	
		var hpPercent : float = parseFloat(player.GetHp()) / parseFloat(player.GetFullHp());
		
	    var texture : Texture2D = new Texture2D(1, 1);
		
		var color = new Color(1-hpPercent, hpPercent, 0,0.5);
		var style = new GUIStyle();
		
		var boxWidth = hpPercent * (Screen.width - 140);
		var boxHeight = 20;
		
		
		texture.SetPixel(0, 0, color);
		texture.Apply();
		style.normal.background = texture;
		
		
		GUI.Box (Rect (70, 10, boxWidth, boxHeight), "",style);
	}
}
