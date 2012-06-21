

    public var searchTag : String;

    private var closetMissle : GameObject;

    private var target : Transform;
    
    private var time : float = 0.0;

    

    function Start(){
        closetMissle = FindClosestEnemy();
		transform.collider.isTrigger = true;
        if(closetMissle){
            target = closetMissle.transform;
		}
		
    }   

    

    function Update(){   
    	time += Time.deltaTime;
	    if (time > 3){
	    	transform.collider.isTrigger = false;
	    }
        transform.LookAt(target);
        transform.Translate(Vector3.forward * 15.0f * Time.deltaTime);
        transform.Rotate(0,-180,0);
        
    }

    

   // Find the name of the closest enemy
function FindClosestEnemy () : GameObject {
    // Find all game objects with tag Enemy
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag("Bot"); 
    var closest : GameObject; 
    var distance = Mathf.Infinity; 
    var position = transform.position; 
    
    
    // Iterate through them and find the closest one
    for (var go : GameObject in gos)  { 
    	if(go.transform.GetComponent(PlayerStatus).GetTeam() != transform.GetComponent(Projectile).team){
    		Debug.Log(go.GetComponent(PlayerStatus).GetTeam());
        	var diff = (go.transform.position - position);
	        var curDistance = diff.sqrMagnitude; 
	        if (curDistance < distance) { 
            	closest = go; 
            	distance = curDistance; 
        	} 
        }
    } 
    return closest;    
}

