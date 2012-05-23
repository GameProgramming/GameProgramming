
var textDisplay : GUIText;
var slopeLimit : float = 10;

var airElement : Rigidbody;
var earthElement : Rigidbody;
var fireElement : Rigidbody;
var waterElement : Rigidbody;

function Start() {
    if(GameObject.Find("Text Display")) {
	    textDisplay = GameObject.Find("Text Display").guiText;
	    textDisplay.text = "";
    } 
}


function OnTriggerEnter(col : Collider) {
	
	if (col.gameObject.tag == "Player") {
		player = col.gameObject;
		
		//Drop old element
        var elementSpawn = GameObject.Find("ElementSpawnPoint");
        Spawnpoint = elementSpawn.transform;
        SpawnVector = Vector3(Spawnpoint.position.x, Spawnpoint.position.y, Spawnpoint.position.z);
        var clone : Rigidbody;
        var oldElement = player.GetComponent("EleManStats").element;
		if (oldElement.Equals("water")) {
			clone = Instantiate(waterElement, SpawnVector, Spawnpoint.rotation);
		} else if (oldElement.Equals("fire")) {
			clone = Instantiate(fireElement, SpawnVector, Spawnpoint.rotation);
		} else if (oldElement.Equals("air")) {
			clone = Instantiate(airElement, SpawnVector, Spawnpoint.rotation);
		} else if (oldElement.Equals("earth")) {
			clone = Instantiate(earthElement, SpawnVector, Spawnpoint.rotation);
		}
		
		
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