
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
		if(player.GetComponent("EleManStats").element == "water")
		{
    		Destroy (gameObject);
    	}
    	else if (player.GetComponent("EleManStats").element == "fire")
        {
        
        }
        else{//reset values that might habe been changed by other elements
    	 	player.GetComponent("EleManStats").SetElement("normal");
    		player.GetComponent("PlayerStatus").Spawn();
        }
        
        textDisplay.text = player.GetComponent("EleManStats").element + "PlayerHitFire";
		//print("hit");
        
    }
}