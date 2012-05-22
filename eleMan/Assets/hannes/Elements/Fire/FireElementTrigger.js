
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
    	
        player.GetComponent("EleManStats").SetElement("fire");
        textDisplay.text = "PlayerHit"+ player.GetComponent("EleManStats").element +"Element";
		Destroy(transform.parent.gameObject);
        //print("hit");
        
    }
}