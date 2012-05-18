
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
    	//reset values that might habe been changed by other elements
    	player.GetComponent("EleManStats").ResetNormalPlayerStats();
    	//set earth values
        player.GetComponent("EleManStats").element = "earth";
        player.GetComponent(PlayerController).jumpHeight = 0.5;
		textDisplay.text = "PlayerHitEarthElement";
		
        //print("hit");
        
    }
}