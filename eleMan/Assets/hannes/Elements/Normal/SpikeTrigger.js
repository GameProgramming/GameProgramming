
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
		if(player.GetComponent("EleManStats").element == "normal")
		{
    	    //reset values that might habe been changed by other elements
    	 	player.SendMessage ("OnDeath", SendMessageOptions.DontRequireReceiver);
        }
        
        textDisplay.text = player.GetComponent("EleManStats").element + "PlayerHitSpikes";
		//print("hit");
        
    }
}