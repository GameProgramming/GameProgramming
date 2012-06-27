#pragma strict
private var owner : GameObject;


private var bulletSpawn : Transform;
private var playerMotor : CharacterMotorSF;

private var progress :float = 0;

var c1 : Color = Color.yellow;
var c2 : Color = Color.red;
var lengthOfLineRenderer : int = 20;

var mat1 :Material;

var aimFor : int = 4; 
var relativeCameraAngle : Vector3;
var locked :boolean;

var target : GameObject; 


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
	
		AimTarget("Ufo");
		
		transform.eulerAngles.x = -playerMotor.rotationY-10;
	  	if(target == null){
			progress = 0;
		}	  		
			
		var canShoot : boolean = bulletSpawn.GetComponent(BulletSpawn).reloadProgress <= 0;
		var hasSnowballs : boolean = owner.GetComponent(PlayerStatus).GetCurrentSnowballs() > 0;
		
		
		if (canShoot && hasSnowballs) {
			
			if(target){
				//Debug.Log("Hold Aim for " + (aimFor - progress) + "seconds");		
				if (progress < aimFor){
					progress += Time.deltaTime;
					locked = true;
					if (playerMotor.inputFire) {
						Fire(1);
					}
				}else if (progress >= aimFor) {
					//Debug.Log("SHOOT!!!!!!!!");
					if (playerMotor.inputFire) {
						Fire(2);
					}
				}
			}else{
				if (playerMotor.inputFire) {
					Fire(1);
				}
			}	
		}else{
			progress = 0;
		}
			 
	
	}
}

function Fire (style) {
	
	if(style == 1){
		bulletSpawn.GetComponent(BulletSpawn).Fire();
	}else if(style == 2){
		bulletSpawn.GetComponent(BulletSpawn).FireHeatSeekingRocket(target);
	}
	
	progress = 0;
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
	transform.localPosition = Vector3 (0.4,1,0.6);
	//transform.localRotation = Quaternion.zero;
	transform.localRotation.x = 0;
	transform.localRotation.y = 0;
	transform.localRotation.z = 0;
	bulletSpawn.GetComponent(BulletSpawn).ConnectToPlayer (player.transform);
}

   // Find the name of the closest enemy
function AimTarget (enemyTag : String) : GameObject {
    // Find all game objects with tag enemyTag
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag(enemyTag); 
    
    var closestDistanceToEnemy = Mathf.Infinity; 
    
    // If target
    var lineRenderer : LineRenderer = GetComponent(LineRenderer);
    if(target){
    	//Debug.Log("has target");
     	//check if still in range
     	if (!InDirection(target)) {				
			//	Debug.Log("lost target");
				target = null;
		}
    }
    //needs to stay in seperat if
    if(target == null){
	    lineRenderer.SetPosition(0, transform.position);
		lineRenderer.SetPosition(1, transform.position);
		//Debug.Log("lost target");
	  	target = null;
		// Iterate through them and find the closest one
	    for (var go : GameObject in gos)  { 
			if ( target == null && InDirection(go) ) {
				target = go;
		//		Debug.Log("found new target");
			} 
	    }
    }
        		  
}


function InDirection( object : GameObject){
	var diffToEnemy = (object.transform.position - transform.position);
	var enemyDistance = diffToEnemy.magnitude;
	var enemyDirection = diffToEnemy / enemyDistance;  // This is now the normalized direction.
	// Calculate the x-axis relative to the camera
	var cam : Transform = Camera.main.transform;
	relativeCameraAngle = cam.TransformDirection (Vector3.forward);
	////if relativeCameraAngle [blikwinkel] ~~ enemyDirection
	//Debug.Log("relativeCameraAngle" + relativeCameraAngle);
	//Debug.Log("enemyDirection" + enemyDirection);
	var targetInDirectionX : boolean = enemyDirection.x > (relativeCameraAngle.x - 0.1) && enemyDirection.x < (relativeCameraAngle.x + 0.1); 
	if(!targetInDirectionX)
		return false;
	var targetInDirectionY : boolean = enemyDirection.y > (relativeCameraAngle.y - 0.1) && enemyDirection.y < (relativeCameraAngle.y + 0.1);
	if(!targetInDirectionY)
		return false;
	var targetInDirectionZ : boolean = enemyDirection.z > (relativeCameraAngle.z - 0.1) && enemyDirection.z < (relativeCameraAngle.z + 0.1);
	if(!targetInDirectionZ)
		return false;
	return true;
}
function OnGUI(){
	if (owner != null && owner.GetComponent(PlayerStatus).IsMainPlayer()) {
	    var outerTexture : Texture2D = new Texture2D(1, 1);
	    var texture : Texture2D = new Texture2D(1, 1);
		var style = new GUIStyle();
		var outerStyle = new GUIStyle();
		var totalWidth = Screen.width/10; 
		var boxWidth=10;
		var color : Color;
		var outerColor : Color;
		
			boxWidth = Screen.width/10;
			
		
		if (!target){
			color = new Color(1, 1, 0,0.2);
			outerColor = new Color(1, 1, 0,0.2);
		
		}else if (target){
			color = new Color(1, 0, 0,0.2);
			outerColor = new Color(1, 0, 0,0.2);
			if(progress >= aimFor){
				color = new Color(0, 1, 0,0.2);
				outerColor = new Color(1, 0, 0,0.2);
			}else if(progress > 0 && progress < aimFor){
				color = new Color(0, aimFor/progress, aimFor/4.0-progress,0.2);
				outerColor = new Color(0, aimFor/progress, aimFor/4.0-progress,0.2);
			}
		}
		texture.SetPixel(0, 0, color);
		texture.Apply();
		style.normal.background = texture;
		outerTexture.SetPixel(0, 0, outerColor);
		outerTexture.Apply();
		outerStyle.normal.background = outerTexture;
		GUI.Box (Rect (Screen.width/2-10, Screen.height/2-3, 20, 6), "",outerStyle);
		GUI.Box (Rect (Screen.width/2-3, Screen.height/2-10, 6, 20), "",style);
		if(target){
			var cam : Camera = Camera.main;
		    var screenPos : Vector3 = cam.WorldToScreenPoint(target.transform.position);
		    var counter:String;
		    counter = "";
		    if((aimFor-progress) >= 1){
		    	counter = (aimFor-progress).ToString('#.#');
		    }else{
		    	counter = "0" + (aimFor-progress).ToString('#.#');
		    }
		    GUI.Box (Rect (screenPos.x - 11, Screen.height - screenPos.y - 11,22,22), "",outerStyle);
			GUI.Box (Rect (screenPos.x - 10, Screen.height - screenPos.y - 10,20,20), counter,style);
		}	
	}
}