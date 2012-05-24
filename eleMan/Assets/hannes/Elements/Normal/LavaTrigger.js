
var textDisplay : GUIText;


function Start() {
    if(GameObject.Find("Text Display")) {
	    textDisplay = GameObject.Find("Text Display").guiText;
	    textDisplay.text = "";
    } 
}


function OnTriggerEnter(col : Collider) {
	
	if (col.gameObject.tag == "Player") {
		player = col.gameObject;
		player.SendMessage ("OnDeath", SendMessageOptions.DontRequireReceiver);
        
        textDisplay.text = player.GetComponent("EleManStats").element + "PlayerHitLava";
		//print("hit");
        
    }
}