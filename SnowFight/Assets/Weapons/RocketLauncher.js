#pragma strict
private var owner : GameObject;
private var ownerArmJoint :Transform;

private var bulletSpawn : Transform;
private var playerMotor : CharacterMotorSF;
private var playerStatus :PlayerStatus;

private var progress :float = 0.0;

var c1 : Color = Color.yellow;
var c2 : Color = Color.red;
var lengthOfLineRenderer : int = 20;
private var lineRenderer :LineRenderer;

    
private var weaponModel :Transform;
private var aimingCircleOuter :Transform;
private var aimingCircleInner :Transform;

private var itemModel :Transform;
private var ammoModels :Transform[];

var mat1 :Material;

var aimAngle :float = 5;
var aimFor : float = 4.0; 
private var viewAngle : Vector3;
private var locked :boolean;

private var target : GameObject; 
var targetName : String = "Ufo"; 

//var lifeTime :float = 15;
//private var everUsed :boolean = false;
//private var unusedTime :float = 0;

var onLockingSound : AudioClip;
var onLockedSound : AudioClip;

var initialAmmo :int = 4;
private var ammo :int = initialAmmo;
private var alive :boolean = true;

private var terrheight :float;

function Start() {
    lineRenderer = GetComponent(LineRenderer);
    lineRenderer.SetVertexCount(3);
    
    aimingCircleOuter = transform.Find("AimingCircleOuter");
    aimingCircleInner = transform.Find("AimingCircleInner");
    weaponModel = transform.Find("Weapon");
	bulletSpawn = transform.Find("Weapon/BulletSpawn");
	itemModel = transform.Find("Item");
	ammoModels = new Transform[initialAmmo];
	for (var i :int = 0; i < initialAmmo; i++) {
		ammoModels[i] = transform.Find("Item/Ammo"+i.ToString());
	}
	terrheight = Terrain.activeTerrain.SampleHeight(transform.position) + 1;
	weaponModel.gameObject.active = false;
	itemModel.gameObject.SetActiveRecursively(true);
}

function Update () {
	if (owner) {
		transform.eulerAngles.x = -playerMotor.rotationY-10;
		weaponModel.renderer.enabled = true;
		if (owner.networkView.isMine) {
		
			AimTarget(targetName);
			
			transform.eulerAngles.x = -playerMotor.rotationY-10;
		  	if(target == null){
				progress = 0;
			}	  		
				
			var canShoot : boolean = bulletSpawn.GetComponent(BulletSpawn).reloadProgress <= 0;
			//var hasSnowballs : boolean = owner.GetComponent(PlayerStatus).GetCurrentSnowballs() >= bulletSpawn.GetComponent(BulletSpawn).snowCosts;
			
			
			if (canShoot) {
				
				if(target){
					//Debug.Log("Hold Aim for " + (aimFor - progress) + "seconds");		
					if (progress < aimFor){
						progress += Time.deltaTime;
						locked = true;
						if (playerMotor.inputFire && ammo > 0) {
							bulletSpawn.GetComponent(BulletSpawn).FireHeatSeekingRocket(null);
							ammo--;
							progress = 0;
						}
					}else if (progress >= aimFor) {
						//Debug.Log("SHOOT!!!!!!!!");
						if (playerMotor.inputFire && ammo > 0) {
							bulletSpawn.GetComponent(BulletSpawn).FireHeatSeekingRocket(target);
							progress = 0;
							ammo--;
							networkView.RPC("SetAmmo", RPCMode.Others, ammo);
						}
					}
				}else{
					if (playerMotor.inputFire && ammo > 0) {
						bulletSpawn.GetComponent(BulletSpawn).FireHeatSeekingRocket(null);
						progress = 0;
						ammo--;
						networkView.RPC("SetAmmo", RPCMode.Others, ammo);
					}
				}	
			}else{
				progress = 0;
			}
			weaponModel.renderer.enabled = true;
			RenderAimingLine ();
		}
	} else if (alive) {
		lineRenderer.enabled = false;
		aimingCircleOuter.renderer.enabled = false;
		aimingCircleInner.renderer.enabled = false;
		transform.position.y = Mathf.MoveTowards(transform.position.y, terrheight, 15*Time.deltaTime);
		
//		if (everUsed) {
//			unusedTime += Time.deltaTime;
//			if (unusedTime > lifeTime - 2) {
//				if (unusedTime % 0.5 > 0.25) {
//					weaponModel.renderer.enabled = true;
//				} else {
//					weaponModel.renderer.enabled = false;
//				}
//			}
//			if (unusedTime > lifeTime && Network.isServer) {
//				Network.Destroy(gameObject);
//			}
//		}
		if (ammo <= 0) alive = false;
	} else {
		transform.position.y += Time.deltaTime * (10+transform.position.y);
		if (Mathf.Abs(transform.position.y) > 100 && Network.isServer) {
			if (Network.isServer) {
				GameObject.FindGameObjectWithTag("Game").SendMessage("LogDestruction", networkView.viewID);
			}
			Network.Destroy(gameObject);
		}
	}
}

//function Fire (style) {
//	
//	if(style == 1){
//		bulletSpawn.GetComponent(BulletSpawn).Fire();
//	}else if(style == 2){
//		bulletSpawn.GetComponent(BulletSpawn).FireHeatSeekingRocket(target);
//	}
//	
//	progress = 0;
//}

function Release () {
	owner = null;
	playerStatus = null;
	transform.parent = null;
	collider.enabled = true;
	weaponModel.gameObject.active = false;
	itemModel.gameObject.SetActiveRecursively(true);
	bulletSpawn.GetComponent(BulletSpawn).ConnectToPlayer(null);
	terrheight = Terrain.activeTerrain.SampleHeight(transform.position) + 1;
	transform.localRotation = Quaternion.identity;
	for (var i :int = ammo; i < initialAmmo; i++) {
		ammoModels[i].gameObject.SetActiveRecursively(false);
	}
}

function PickItem(player :GameObject) {
	owner = player;
//	ownerArmJoint = owner.transform.Find("Model/joint29/joint1/joint2/joint3");
	collider.enabled = false;
	playerMotor = player.GetComponent(CharacterMotorSF);
	playerStatus = owner.GetComponent(PlayerStatus);
//	if (!ownerArmJoint) {
//		Debug.Log("Rocketlauncher didnt find Player Arm to attach.");
//	} else {
//		transform.parent = ownerArmJoint;
//		transform.localPosition = Vector3 (-1,-1,1);
//		//transform.localRotation = Quaternion.zero;
//		transform.localRotation.x = 0;
//		transform.localRotation.y = 0;
//		transform.localRotation.z = 270;
//	}
	
	transform.parent = owner.transform;
	transform.localPosition = Vector3 (0.4,1,0.9);
	//transform.localRotation = Quaternion.zero;
	transform.localRotation.x = 0;
	transform.localRotation.y = 0;
	transform.localRotation.z = 0;
	bulletSpawn.GetComponent(BulletSpawn).ConnectToPlayer (player.transform);
	weaponModel.gameObject.active = true;
	itemModel.gameObject.SetActiveRecursively(false);
}

   // Find the name of the closest enemy
function AimTarget (enemyTag : String) {
    // Find all game objects with tag enemyTag
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag(enemyTag); 
    
    var closestDistanceToEnemy = Mathf.Infinity; 
    
    // If target
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
	var enemyDirection :Vector3 = (object.transform.position - transform.position).normalized;
	// Calculate the x-axis relative to the camera
	var viewAngle :Vector3 = transform.TransformDirection (Vector3.forward);
	return Vector3.Angle(viewAngle, enemyDirection) < aimAngle;
	
	////if relativeCameraAngle [blikwinkel] ~~ enemyDirection
	//Debug.Log("viewAngle" + viewAngle);
	//Debug.Log("enemyDirection" + enemyDirection);
	
//	var targetInDirectionX : boolean = enemyDirection.x > (viewAngle.x - 0.2) && enemyDirection.x < (viewAngle.x + 0.2); 
//	if(!targetInDirectionX)
//		return false;
//	var targetInDirectionY : boolean = enemyDirection.y > (viewAngle.y - 0.2) && enemyDirection.y < (viewAngle.y + 0.2);
//	if(!targetInDirectionY)
//		return false;
//	var targetInDirectionZ : boolean = enemyDirection.z > (viewAngle.z - 0.2) && enemyDirection.z < (viewAngle.z + 0.2);
//	if(!targetInDirectionZ)
//		return false;
//	return true;
}

function RenderAimingLine () {
	if (playerStatus.IsMainPlayer()) {
		var bsp :Vector3 = transform.InverseTransformPoint(bulletSpawn.transform.position);
		lineRenderer.enabled = true;
		lineRenderer.SetPosition(0, bsp);
		
		if (target) {
			var localEnemyPos :Vector3 = transform.InverseTransformPoint(target.transform.position);
			lineRenderer.SetPosition(1, Vector3(0,0,localEnemyPos.z));
			lineRenderer.SetPosition(2, localEnemyPos);
			
			aimingCircleOuter.localPosition = localEnemyPos;
			aimingCircleInner.localPosition = localEnemyPos;
			aimingCircleOuter.renderer.enabled = true;
			aimingCircleInner.renderer.enabled = true;
			aimingCircleInner.renderer.material.SetColor ("_SpecColor", Color.red);
			var scale :float = Mathf.Sin(aimAngle) * localEnemyPos.z;
			if(scale > 10){
				scale /= 3;
			}
			Debug.Log(scale);
			aimingCircleOuter.localScale = Vector3(scale, scale, scale);
			
			scale *= (1.5 - progress/aimFor);
			
			aimingCircleInner.localScale = Vector3(scale, scale, scale);
//			 Mathf.Atan(Vector3(localEnemyPos.x, localEnemyPos.y, 0).magnitude
//												/ localEnemyPos.z)
//								/ aimAngle;
//			

			if(progress >= aimFor){
				lineRenderer.SetColors(c2,c2);
		    }else if(progress > 0 && progress < aimFor){
				lineRenderer.SetColors(c1,c2);
			
			}
		} else {
			lineRenderer.SetPosition(1, bsp + Vector3(0,0,20));
			lineRenderer.SetPosition(2, bsp + Vector3(0,0,40));
			lineRenderer.SetColors(c1,c1);
			aimingCircleOuter.renderer.enabled = false;
			aimingCircleInner.renderer.enabled = false;			
		}
	} else {
		lineRenderer.enabled = false;
		aimingCircleOuter.renderer.enabled = false;
		aimingCircleInner.renderer.enabled = false;
	}
}

function OnGUI(){
	if (owner != null && playerStatus.IsMainPlayer()) {
	    
	    var aimTexture1 : Texture2D = new Texture2D(1, 1);
	    var aimTexture2 : Texture2D = new Texture2D(1, 1);
		var outerTexture : Texture2D = new Texture2D(1, 1);
		var aimStyle1 = new GUIStyle();
		var aimStyle2 = new GUIStyle();
		var outerStyle = new GUIStyle();
		var totalWidth = Screen.width/10; 
		var boxWidth=10;
		var aimColor1 : Color;
		var aimColor2 : Color;
		var outerColor : Color;
		
		var aiming:String= "";
		    
		boxWidth = Screen.width/10;
			
		var progrAim :float ;
		if (!target){
			progrAim = 1 ;
			aimColor1 = new Color(1, 1, 0,0.2);
			aimColor2 = new Color(1, 1, 0,0.2);
			outerColor = new Color(0, 0, 0,0.5);
			aiming = "No Target";
			StopAudio();
		}else if (target){
			
		    
			if(progress >= aimFor){
				aimColor1 = new Color(1, 0, 0,0.6);
				aimColor2 = new Color(0, 1, 1,0.6);
				outerColor = new Color(1, 0, 0,0.8);
				progrAim = 1 ;
				aiming = "Target locked";
				PlayAudio(onLockedSound);
				boxWidth = Screen.width/7 - 12;
		    }else if(progress > 0 && progress < aimFor){
				aimColor1 = new Color(0, 1, progress,0.4);
				aimColor2 = new Color(0, 1, progress,0.4);
				outerColor = new Color(0, 0, 0,0.5);
				progrAim = progress/aimFor ;
				aiming = "Locking target";
				PlayAudio(onLockingSound);
				boxWidth = Screen.width/7 - 17;
			}else{
				StopAudio();
				progrAim = 1 ;
				aimColor1 = new Color(1, 1, 0,0.5);
				aimColor2 = new Color(1, 1, 0,0.2);
				outerColor = new Color(0, 0, 0,0.5);
				aiming = "Locking not possible";
				boxWidth = Screen.width/5 - 16;
			}
		}
		aimTexture1.SetPixel(0, 0, aimColor1);
		aimTexture1.Apply();
		aimStyle1.normal.background = aimTexture1;
		aimTexture2.SetPixel(0, 0, aimColor2);
		aimTexture2.Apply();
		aimStyle2.normal.background = aimTexture2;
		outerTexture.SetPixel(0, 0, outerColor);
		outerTexture.Apply();
		outerStyle.normal.background = outerTexture;
		
		aimingCircleInner.renderer.material.SetColor("_TintColor", aimColor2); 
		aimingCircleOuter.renderer.material.SetColor("_TintColor", aimColor1); 
		
		
		if(target){
			var cam : Camera = Camera.main;
		    var screenPos : Vector3 = cam.WorldToScreenPoint(target.transform.position);
		    GUI.Box (Rect (screenPos.x - 6, Screen.height - screenPos.y - 6,12,12), "",aimStyle2);
			GUI.Box (Rect (screenPos.x - 5, Screen.height - screenPos.y - 5,10,10), "",aimStyle1);
		}
		//GUI.Box (Rect (Screen.width/2-10 -25, Screen.height/2-3, 20, 6), "",aimStyle2);
		//GUI.Box (Rect (Screen.width/2-3 -25, Screen.height/2-10, 6, 20), "",aimStyle1);
		
		
		if (target) {
			GUI.Box (Rect (Screen.width / 2 - boxWidth/2-1, Screen.height - 47, boxWidth+2, 18), "", outerStyle);
			GUI.Box (Rect (Screen.width / 2 - boxWidth/2, Screen.height - 46, boxWidth * progrAim ,16), aiming,aimStyle2);
		}

		
			
	}
}

function getProgress(){
	return progress;
}


function addToProgress(progr:float){
	progress += progr ;
	return progress ;
}
function PlayAudio(audio : AudioClip){
	transform.audio.clip=audio;
	if(!transform.audio.isPlaying){
	    	   	transform.audio.Play();
	}
}
function StopAudio(){
	if(transform.audio.isPlaying){
	    	   	transform.audio.Pause();
	}
}

function OnPlayerConnected (player :NetworkPlayer) {
	networkView.RPC("NetSyncPos", player, transform.localPosition);
}

@RPC
function NetSyncPos ( pos :Vector3 ) {
	transform.localPosition = pos;
}


@RPC
function SetAmmo (newAmmo :int) {
	ammo = newAmmo;
}

function GetAmmo () :int {
	return ammo;
}

function HasAmmo () :boolean {
	return ammo > 0;
}

function SetTarget(tar : GameObject) {
	target = tar;
}

@script RequireComponent (NetworkView)