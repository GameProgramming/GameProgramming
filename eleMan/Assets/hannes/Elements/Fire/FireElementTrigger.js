
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
        player.GetComponent("EleManStats").SetElement("fire");
        textDisplay.text = "PlayerHit"+ player.GetComponent("EleManStats").element +"Element";
		
        //print("hit");
        
    }
}