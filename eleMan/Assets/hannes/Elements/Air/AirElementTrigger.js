
var textDisplay : GUIText;
var jumpHeight : float = 1;
var extraJumpHeight = 8;
var gravity : float = 20;
var speed = 5;
var inAirControlAcceleration = 0.5;
var speedSmoothing = 0.5;


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
    	
    	yield(1.0);
    	//set earth values
       	player.GetComponent("EleManStats").SetElement("air");
        player.GetComponent(PlayerController).jump.height = jumpHeight;
        player.GetComponent(PlayerController).jump.extraHeight = extraJumpHeight;
        player.GetComponent(PlayerController).movement.gravity = gravity;
        player.GetComponent(PlayerController).movement.runSpeed = speed;
        player.GetComponent(PlayerController).movement.inAirControlAcceleration = inAirControlAcceleration;	
        player.GetComponent(PlayerController).movement.flying = true;
        player.GetComponent(PlayerController).movement.speedSmoothing = speedSmoothing;
        
        Physics.IgnoreLayerCollision (LayerMask.NameToLayer("Player"), LayerMask.NameToLayer("Grid"), true);
        
		textDisplay.text = "PlayerHit"+ player.GetComponent("EleManStats").element +"Element";
		Debug.Log("PlayerHit"+ player.GetComponent("EleManStats").element +"Element", this);
        Destroy(transform.parent.gameObject);
    }
}