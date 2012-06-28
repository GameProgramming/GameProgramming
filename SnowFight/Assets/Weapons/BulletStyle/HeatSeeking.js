

    public var searchTag : String;

    var missleTarget : GameObject;
    

    private var target : Transform;
    
    private var time : float = 0.0;

    

    function Start(){
        transform.collider.isTrigger = true;
		//transform.localPosition.x += 2;
        transform.localPosition.y += 0.5;
        transform.localPosition.z -= 0.4;
        if(missleTarget){
            target = missleTarget.transform;
		}
		
    }   

    

    function Update(){   
    	time += Time.deltaTime;
    	transform.Rotate(0,-180,0);
	    if (time < 1){
	    	transform.collider.isTrigger = true;
        }else if (time >= 1 && time < 30 ){
    		transform.collider.isTrigger = false;
    	}
    	transform.LookAt(target);
    	transform.Translate(Vector3.forward * 15.0f * Time.deltaTime);
    	if (time >= 30){
    		Destroy (gameObject);
    	}
	    
    }

    

   // Find the closest enemy object
function FindClosestEnemy (enemy) : GameObject {
    // Find all game objects with tag Enemy
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag(enemy); 
    var closest : GameObject; 
    var position = transform.position; 
    var closestDistance = Mathf.Infinity; 
    // Iterate through them and find the closest one
	for (var go : GameObject in gos)  { 
		var diff = (go.transform.position - position);
		var curDistance = diff.sqrMagnitude; 
		if (curDistance < closestDistance) { 
			closest = go; 
			closestDistance = curDistance; 
		} 
		var distance = diff.magnitude;
		var direction = diff / distance;  // This is now the normalized direction.
		if (curDistance < 50 * 50) {
			// Target is within range.
			//Debug.Log("+++++++++++"+direction);
		}
	} 
    return closest;    
}


