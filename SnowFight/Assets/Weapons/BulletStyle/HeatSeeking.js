

    public var searchTag : String;

    private var closetMissle : GameObject;

    private var target : Transform;
    
    private var time : float = 0.0;

    

    function Start(){
        closetMissle = AimTarget("Bot");
		transform.collider.isTrigger = true;
        if(closetMissle){
            target = closetMissle.transform;
		}
		
    }   

    

    function Update(){   
    	time += Time.deltaTime;
	    if (time > 1){
	    	transform.collider.isTrigger = false;
	    }else{
	    transform.Translate(Vector3.forward * 15.0f * Time.deltaTime);
	    }
        transform.LookAt(target);
        transform.Translate(Vector3.forward * 15.0f * Time.deltaTime);
        transform.Rotate(0,-180,0);
        
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
    	var enemyTag = go.transform.GetComponent(PlayerStatus).GetTeam();
	    var myTag = gameObject.transform.parent.transform.GetComponent(PlayerStatus).GetTeam();
    	if(enemyTag != myTag){
    	
    		var diff = (go.transform.position - position);
	        var curDistance = diff.sqrMagnitude; 
	        if (curDistance < closestDistance) { 
            		closest = go; 
            		closestDistance = curDistance; 
        	} 
        	var distance = diff.magnitude;
			var direction = diff / distance;  // This is now the normalized direction.
			Debug.Log("direction"+direction);
		   	if (curDistance < 50 * 50) {
				// Target is within range.
				Debug.Log("+++++++++++"+direction);
			}
        	
        }
    } 
    // Gets a vector that points from the player's position to the target's.
	
    
    return closest;    
}


// Find the name of the closest enemy
function AimTarget (enemy) : GameObject {
    // Find all game objects with tag Enemy
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag(enemy); 
    var closest : GameObject; 
    var position = transform.position; 
    
    var closestDistanceToEnemy = Mathf.Infinity; 
      
    
    // Iterate through them and find the closest one
    for (var go : GameObject in gos)  { 
    Debug.Log("1GOOOOOOO "+go.transform.position);
	    var enemyTag = go.transform.GetComponent(PlayerStatus).GetTeam();
	    var myTag = GameObject.Find("Player").transform.GetComponent(PlayerStatus).GetTeam();
    	if(enemyTag != myTag){
    	 Debug.Log("2GOOOOOOO "+go.transform.position);
    		var diffToEnemy = (go.transform.position - position);
    		var enemyDistance = diffToEnemy.magnitude;
			var enemyDirection = diffToEnemy / enemyDistance;  // This is now the normalized direction.
			
			Debug.Log("2222222222222enemy direction"+enemyDirection);
			
			// Calculate the x-axis relative to the camera
			var cam : Transform = Camera.main.transform;
			var relativeCameraAngle : Vector3 = cam.TransformDirection (Vector3.forward);
    	
		   	//Debug.Log("relativeCameraAngle"+relativeCameraAngle);
		   	
		   	////if relativeCameraAngle [blikwinkel] ~~ enemyDirection
		   	if (enemyDirection.x > (relativeCameraAngle.x - 0.2) && enemyDirection.x < (relativeCameraAngle.x + 0.2) &&
		   		enemyDirection.z > (relativeCameraAngle.z - 0.2) && enemyDirection.z < (relativeCameraAngle.z + 0.2)  ) {
   		 		
   		 		
   		 		closest = go;	
    			Debug.Log("3GOOOOOOO "+go.transform.position);
			}
        	
        }
    } 
    return closest;
}