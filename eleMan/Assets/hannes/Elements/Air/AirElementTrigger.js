
var textDisplay : GUIText;
var jumpHeight : float = 1;
var extraJumpHeight = 8;
var gravity : float = 20;
var speed = 5;
var inAirControlAcceleration = 0.5;
var riseFactor = 0.2;
var speedSmoothing = 0.5;

var airElement : Rigidbody;
var earthElement : Rigidbody;
var waterElement : Rigidbody;
var fireElement : Rigidbody;

private var canTrigger = false;

function Start() {
    canTrigger = false;
    if(GameObject.Find("Text Display")) {
	    textDisplay = GameObject.Find("Text Display").guiText;
	    textDisplay.text = "";
    } 
    yield WaitForSeconds(1.5);
    canTrigger = true;
}


function OnTriggerEnter(col : Collider) {
	
    if (canTrigger && col.gameObject.tag == "Player") {
        player = col.gameObject;
        
        //Drop old element
        if (player.GetComponent("EleManStats").element == "normal") {
	//        var elementSpawn = GameObject.Find("ElementSpawnPoint");
	//        Spawnpoint = elementSpawn.transform;
	//        SpawnVector = Vector3(Spawnpoint.position.x, Spawnpoint.position.y, Spawnpoint.position.z);
	//        var clone : Rigidbody;
	//        var oldElement = player.GetComponent("EleManStats").element;
	//		if (oldElement.Equals("water")) {
	//			clone = Instantiate(waterElement, SpawnVector, Spawnpoint.rotation);
	//		} else if (oldElement.Equals("fire")) {
	//			clone = Instantiate(fireElement, SpawnVector, Spawnpoint.rotation);
	//		} else if (oldElement.Equals("air")) {
	//			clone = Instantiate(airElement, SpawnVector, Spawnpoint.rotation);
	//		} else if (oldElement.Equals("earth")) {
	//			clone = Instantiate(earthElement, SpawnVector, Spawnpoint.rotation);
	//		}
	        
	    	//reset values that might habe been changed by other elements
	    	player.GetComponent("EleManStats").ResetNormalPlayerStats();
	    	
	    	yield(2.0);
	    	//set earth values
	       	player.GetComponent("EleManStats").SetElement("air");
	//       	player.GetComponent(PlayerController).movement.speed = 0;
	//       	player.GetComponent(PlayerController).movement.verticalSpeed = 0;
	       	player.GetComponent(PlayerController).movement.velocity.x = 0;
	        player.GetComponent(PlayerController).jump.height = jumpHeight;
	        player.GetComponent(PlayerController).jump.extraHeight = extraJumpHeight;
	        player.GetComponent(PlayerController).movement.gravity = gravity;
	        player.GetComponent(PlayerController).movement.runSpeed = speed;
	        player.GetComponent(PlayerController).movement.inAirControlAcceleration = inAirControlAcceleration;	
	        player.GetComponent(PlayerController).movement.flying = true;
	        player.GetComponent(PlayerController).movement.speedSmoothing = speedSmoothing;
	        player.GetComponent(PlayerController).movement.riseFactor = riseFactor;
	        
	        Physics.IgnoreLayerCollision (LayerMask.NameToLayer("Player"), LayerMask.NameToLayer("Grid"), true);
	        
			textDisplay.text = "PlayerHit"+ player.GetComponent("EleManStats").element +"Element";
			Debug.Log("PlayerHit"+ player.GetComponent("EleManStats").element +"Element", this);
	        Destroy(transform.parent.gameObject);
        }
    }
}