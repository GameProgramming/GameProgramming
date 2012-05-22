
var textDisplay : GUIText;
var jumpHeight = 1;
var extraJumpHeight = 8;
var gravity = 20;
var speed = 5;
var inAirControlAcceleration = 0.5;


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
       	player.GetComponent("EleManStats").SetElement("air");
        player.GetComponent(PlayerController).jump.height = jumpHeight;
        player.GetComponent(PlayerController).jump.extraHeight = extraJumpHeight;
        player.GetComponent(PlayerController).movement.gravity = gravity;
        player.GetComponent(PlayerController).movement.runSpeed = speed;
        player.GetComponent(PlayerController).movement.inAirControlAcceleration = inAirControlAcceleration;	
        
		textDisplay.text = "PlayerHit"+ player.GetComponent("EleManStats").element +"Element";
		Debug.Log("PlayerHit"+ player.GetComponent("EleManStats").element +"Element", this);
        
    }
}