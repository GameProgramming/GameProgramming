#pragma strict
private var owner : GameObject;
private var bulletSpawn : Transform;
private var playerMotor : CharacterMotorSF;

private var progress :float = 0;

var c1 : Color = Color.yellow;
var c2 : Color = Color.red;
var lengthOfLineRenderer : int = 20;

var mat1 :Material;

function Start() {
    var lineRenderer : LineRenderer = GetComponent(LineRenderer);
    lineRenderer.material = mat1;
    lineRenderer.SetColors(c1, c2);
    lineRenderer.SetWidth(1,1);
    lineRenderer.SetVertexCount(2);

	bulletSpawn = transform.Find("Weapon/BulletSpawn");
}

function Update () {
	if (owner) {
		AimTarget("Bot");
	  	transform.eulerAngles.x = -playerMotor.rotationY-10;
		if (playerMotor.inputFire && progress == 0 && bulletSpawn.GetComponent(BulletSpawn).reloadProgress <= 0 
			&& owner.GetComponent(PlayerStatus).GetCurrentSnowballs() > 0) {
			progress = 1;
			//gameObject.SendMessage ("OnLoadThrow", SendMessageOptions.DontRequireReceiver);
		} else if (progress > 0) {
			progress += Time.deltaTime * 4;
			if (!playerMotor.inputFire) {
				if (progress > 2) {
					bulletSpawn.GetComponent(BulletSpawn).Fire();;
				}
				progress = 0;
			}
		} else {
			//gameObject.SendMessage ("OnUnloadThrow", SendMessageOptions.DontRequireReceiver);
			progress = 0;
		
		}
		
    	
        
	}
}

function Move (offset : Vector3) {
	
}

function Release () {
	owner = null;
	transform.parent = null;
	collider.enabled = true;
}

function PickItem(player :GameObject) {
	owner = player;
	collider.enabled = false;
	playerMotor = player.GetComponent(CharacterMotorSF);
	transform.parent = owner.transform;
	transform.localPosition = Vector3.zero;
	transform.localRotation = Quaternion.identity;
	bulletSpawn.GetComponent(BulletSpawn).ConnectToPlayer (player.transform);
}

   // Find the name of the closest enemy
function AimTarget (target) : GameObject {
    // Find all game objects with tag Enemy
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag(target); 
    var closest : GameObject; 
    var position = transform.position; 
    
    var closestDistanceToEnemy = Mathf.Infinity; 
      
    
    // Iterate through them and find the closest one
    for (var go : GameObject in gos)  { 
	    var enemyTag = go.transform.GetComponent(PlayerStatus).GetTeam();
	    var myTag = gameObject.transform.parent.transform.GetComponent(PlayerStatus).GetTeam();
    	if(enemyTag != myTag){
    	 
    		var diffToEnemy = (go.transform.position - position);
    		var enemyDistance = diffToEnemy.magnitude;
			var enemyDirection = diffToEnemy / enemyDistance;  // This is now the normalized direction.
			
			//Debug.Log("enemy direction"+enemyDirection);
			
			// Calculate the x-axis relative to the camera
			var cam : Transform = Camera.main.transform;
			var relativeCameraAngle : Vector3 = cam.TransformDirection (Vector3.forward);
    	
		   	//Debug.Log("relativeCameraAngle"+relativeCameraAngle);
		   	
		   	var lineRenderer : LineRenderer = GetComponent(LineRenderer);
   		 		
		   	////if relativeCameraAngle [blikwinkel] ~~ enemyDirection
		   	if (enemyDirection.x > (relativeCameraAngle.x - 0.2) && enemyDirection.x < (relativeCameraAngle.x + 0.2) &&
		   		enemyDirection.z > (relativeCameraAngle.z - 0.2) && enemyDirection.z < (relativeCameraAngle.z + 0.2)  ) {
				// Target is within range.
				closest = go;	
     			lineRenderer.SetPosition(0, position);
    			lineRenderer.SetPosition(1, closest.transform.position);
    			
				Debug.Log("+++++++++++"+enemyDirection);
			}//else {
		   	//	Debug.Log("-----------"+enemyDirection);
   		 	//	lineRenderer.SetPosition(0, position);
    		//	lineRenderer.SetPosition(1, position);
		   	//	}
        		
        }
    } 
}