
var textDisplay : GUIText;


function Start() {
    if(GameObject.Find("Text Display")) {
	    textDisplay = GameObject.Find("Text Display").guiText;
	    textDisplay.text = "";
    } 
}


function OnTriggerEnter(col : Collider) {
	
	
    if (col.gameObject.tag == "Player") {
        if(col.gameObject.GetComponent("EleManStats").element == "earth"){
			textDisplay.text = "EarthPlayerHitWood";
			
			Destroy (transform.parent.gameObject);
		}
		if(col.gameObject.GetComponent("EleManStats").element == "normal"){
			textDisplay.text = "NormalPlayerHitWood";
		}
        print(col.gameObject.GetComponent("EleManStats").element);
        
    }
}