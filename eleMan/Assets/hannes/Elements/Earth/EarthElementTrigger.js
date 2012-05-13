
var textDisplay : GUIText;


function Start() {
    if(GameObject.Find("Text Display")) {
	    textDisplay = GameObject.Find("Text Display").guiText;
	    textDisplay.text = "test";
    } 
}


function OnTriggerEnter(col : Collider) {
	
	
    if (col.gameObject.tag == "Player") {
        col.gameObject.GetComponent("EleManStats").element = "earth";
		textDisplay.text = "PlayerHitEarthElement";
		
        //print("hit");
        
    }
}