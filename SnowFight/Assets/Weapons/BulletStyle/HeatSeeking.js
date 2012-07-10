

    public var searchTag : String;

    var missleTarget : GameObject;
    

    private var target : Transform;
    
    private var time : float = 0.0;

	var speed :float;
	var maxSpeed :float;
	var speedUp :float;
	var turnSpeed :float;

    function Start(){
        //transform.collider.isTrigger = true;
        if(missleTarget){
        	target = missleTarget.transform;
		}
		
    }   

    function Update(){
    	time += Time.deltaTime;
//    	if (time < 1){
//	    	transform.collider.isTrigger = true;
//        }else if (time >= 1 && time < maxLifeTime ){
//    		transform.collider.isTrigger = false;
//    	}
    	speed = Mathf.Clamp(speed + speedUp * Time.deltaTime, 0, maxSpeed);
    	if (target && time > 0.5){
    		var aimDir :Vector3 = target.position - transform.position;
    		transform.rotation = Quaternion.RotateTowards(transform.rotation,
    								Quaternion.LookRotation(aimDir), Time.deltaTime * turnSpeed);
    	}
    	transform.Translate(Vector3.forward * speed * Time.deltaTime);
    }
    
    function GetTarget () : Transform {
    	return target;
    }