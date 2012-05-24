
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
        if(player.GetComponent("EleManStats").element == "earth"){
			GetComponent("Detonator").Explode();
//			transform.parent.gameObject.active = false;
			transform.parent.FindChild("BreakableWoodObject").active = false;
			transform.gameObject.active = false;
			yield WaitForSeconds(5);
			Destroy (transform.parent.gameObject);
		}
		if(player.GetComponent("EleManStats").element == "Normal"){
			
		}
		textDisplay.text = ""+player.GetComponent("EleManStats").element + "PlayerHitWood";
        Debug.Log(""+player.GetComponent("EleManStats").element + "PlayerHitWood", this);
        print(""+player.GetComponent("EleManStats").element + "PlayerHitWood");
    }
}