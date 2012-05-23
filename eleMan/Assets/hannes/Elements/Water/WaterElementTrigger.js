
var textDisplay : GUIText;
var slopeLimit : float = 10;


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
    	
        player.GetComponent("EleManStats").SetElement("water");
        
        //player.GetComponent(PlayerController).movement.slopeLimit = slopeLimit;
        
        Physics.IgnoreLayerCollision (LayerMask.NameToLayer("Player"), LayerMask.NameToLayer("Grid"), true);
        
		textDisplay.text = "PlayerHit"+  player.GetComponent("EleManStats").element +"Element";
		Debug.Log("PlayerHit"+ player.GetComponent("EleManStats").element +"Element", this);
        //print("hit");
        Destroy(transform.parent.gameObject);
    }
}