
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
    		for (var e : ParticleEmitter in GetComponentsInChildren(ParticleEmitter)) {
    			e.emit = false;
    		}
    		yield WaitForSeconds(5);
    		Destroy (gameObject);
    	}
    	else if (player.GetComponent("EleManStats").element == "fire")
        {
        
        }
        else{//reset values that might habe been changed by other elements
    	 	player.SendMessage ("OnDeath", SendMessageOptions.DontRequireReceiver);
        }
        
        textDisplay.text = player.GetComponent("EleManStats").element + "PlayerHitFire";
		//print("hit");
        
    }
}