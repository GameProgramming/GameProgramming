#pragma strict
#pragma downcast

var bullet : Rigidbody;

private var player : PlayerStatus;
private var motor :CharacterMotorSF;

var reloadProgress : float = 0.0;

var startYSpeed :float = 0.0;

var snowCosts :int = 1;

var onUfoShotSound : AudioClip;
var onThrowSound : AudioClip;

//would prevent hitting oneself.. but poorly done.
var netExtrapolationTime :float = 0.0;

var ammoIcon :Texture;

function PlayAudio(audio : AudioClip){
	transform.audio.clip=audio;
	if(!transform.audio.isPlaying){
	    	   	transform.audio.Play();
	}
}

class BufferedShot {
	var time :float;
	var bullet :GameObject;
}
private var bufferedShots :Array = Array();

function Start() {
	ConnectToPlayer(transform.parent);
	startYSpeed = 0.0;
}

function ConnectToPlayer (t :Transform) {
	if (t) {
		player = t.GetComponent(PlayerStatus);
		motor = t.GetComponent(CharacterMotorSF);
	} else {
		player = null;
		motor = null;
	}
	for (var child :Transform in transform) {
		child.SendMessage("ConnectToPlayer", t, SendMessageOptions.DontRequireReceiver);
	}
}

function Update () {
	reloadProgress -= Time.deltaTime;
}

function CanFire () {
	return reloadProgress <= 0.0 && player.GetCurrentSnowballs() >= snowCosts;
}

function Fire () {
	if(player){
		if(CanFire()){
			if (player.IsRidingUfo()){
				PlayAudio(onUfoShotSound);
			}else{
				PlayAudio(onThrowSound);
			}
		  	var projectile = GetProjectile();
		  	
		  	if (projectile) {
			  	var clone : Rigidbody;	
				clone = Instantiate(projectile, transform.position, transform.rotation);
				var speed :float = clone.GetComponent(Projectile).speed;
			  	clone.velocity = Vector3.ClampMagnitude(speed
			  				* transform.TransformDirection (Vector3.forward
							+ new Vector3(0, startYSpeed, 0)), speed );
				clone.GetComponent(Damage).shooter = player.gameObject;
				SendFire(clone);
				player.SendMessage("OnBulletSpawnFired", this, SendMessageOptions.DontRequireReceiver);
				reloadProgress = clone.GetComponent(Projectile).reloadTime;
				
				snowCosts = projectile.GetComponent(Projectile).snowCosts;
				if (snowCosts > 0) {
					player.SubtractSnowball(snowCosts);
				}
			} else {
				for (var child : Object in transform) {
					(child as Transform).gameObject.SendMessage("Fire", SendMessageOptions.DontRequireReceiver);
				}
			}
			
		}
	}
}

function SendFire ( bullet :Rigidbody ) {
	var netId :NetworkViewID = Network.AllocateViewID();
	bullet.networkView.viewID = netId;
	BufferShot(bullet.gameObject);
//	Debug.Log ("Send fire "+netId);
	this.networkView.RPC("NetFire", RPCMode.Others, netId,
					bullet.position+bullet.velocity*netExtrapolationTime, bullet.velocity);
}

@RPC
function NetFire ( netId :NetworkViewID, pos :Vector3, velo :Vector3 ) {
  	var projectile = GetProjectile();
  	var clone : Rigidbody;	
	clone = Instantiate(projectile, pos, transform.rotation);
	clone.networkView.viewID = netId;
	if (player) clone.GetComponent(Damage).shooter = player.gameObject;
	clone.velocity = velo;
	clone.MovePosition(pos + netExtrapolationTime * velo);
	SendMessageUpwards("OnBulletSpawnFired", this, SendMessageOptions.DontRequireReceiver);
//	Debug.Log ("Rcv fire "+netId);
}

function FireHeatSeekingRocket (target :GameObject) {
	if(player){
		if(CanFire()){
			var projectile = GetProjectile();
		  	var clone : Rigidbody;	
			clone = Instantiate(projectile, transform.position, transform.rotation);
			clone.GetComponent(HeatSeeking).missleTarget = target;
			clone.GetComponent(Damage).shooter = player.gameObject;
//			snowCosts = projectile.GetComponent(Projectile).snowCosts;
//			if (snowCosts > 0) {
//				player.SubtractSnowball(snowCosts);
//			}
			SendFireTarget(clone, target);
			player.SendMessage("OnBulletSpawnFired", this, SendMessageOptions.DontRequireReceiver);
			reloadProgress = clone.GetComponent(Projectile).reloadTime;
		}
	}
}

function SendFireTarget ( bullet :Rigidbody, target :GameObject ) {
	var netId :NetworkViewID = Network.AllocateViewID();
	var tarId :NetworkViewID = NetworkViewID.unassigned;
	bullet.networkView.viewID = netId;
	if (target && target.networkView) {
		tarId = target.networkView.viewID;
	}
	BufferShot(bullet.gameObject);
	networkView.RPC("NetFireTarget", RPCMode.Others, netId, bullet.position+bullet.transform.forward*netExtrapolationTime,
					bullet.rotation.eulerAngles.x, bullet.rotation.eulerAngles.y,tarId);
}

@RPC
function NetFireTarget ( netId :NetworkViewID, pos :Vector3, pitch :float, yaw :float, targetId :NetworkViewID ) {
  	var projectile = GetProjectile();
  	var clone : Rigidbody;	
	clone = Instantiate(projectile, pos, transform.rotation);
	clone.networkView.viewID = netId;
	if (player) clone.GetComponent(Damage).shooter = player.gameObject;
	clone.rotation.eulerAngles = Vector3(pitch, yaw, 0);
	player.SendMessage("OnBulletSpawnFired", this, SendMessageOptions.DontRequireReceiver);
	var tar :NetworkView = NetworkView.Find(targetId);
	if (tar) {
		clone.GetComponent(HeatSeeking).missleTarget = tar.gameObject;
	} else {
		Debug.LogWarning("Could not find Target with ID "+targetId);
	}
}

function BufferShot(shot :GameObject) {
	var bs :BufferedShot = new BufferedShot();
	bs.bullet = shot;
	bs.time = Time.time;
}

function OnPlayerConnected(newPlayer: NetworkPlayer) {
	var newBufferedShots = Array();
	for (var bs :BufferedShot in bufferedShots) {
		if (bs.bullet && bs.bullet.active) {
			newBufferedShots.Add(bs);
		}
	}
	bufferedShots = newBufferedShots;
	for (var bs :BufferedShot in bufferedShots) {
		var b :GameObject = bs.bullet;
		var hs :HeatSeeking = b.GetComponent(HeatSeeking);
		if (hs) {
			var tarId :NetworkViewID = NetworkViewID.unassigned;
			if (hs.GetTarget() && hs.GetTarget().networkView) {
				tarId = hs.GetTarget().networkView.viewID;
			}
			networkView.RPC("NetFireTarget", newPlayer, b.networkView.viewID, b.transform.position,
					b.rigidbody.rotation.eulerAngles.x, b.rigidbody.rotation.eulerAngles.y,tarId);
		} else {
			this.networkView.RPC("NetFire", newPlayer, b.networkView.viewID, b.rigidbody.position, b.rigidbody.velocity);
		}
	}
}

function GetProjectile(){
	return bullet;
}
 
function OnGUI() {
     if (player != null && player.IsMainPlayer() && GetProjectile()) {
		var texture : Texture2D = new Texture2D(1, 1);
		var style = new GUIStyle();
		var totalWidth = Screen.width/4; 
		var boxWidth : float= (Screen.width/8 + 10);
		var finalBoxWidth;
		
		var color :Color;
		var text :String;
		var projectile = GetProjectile().GetComponent(Projectile);
		var maxReload = projectile.reloadTime;
		
		var reloadPercent : float = reloadProgress / maxReload;
		if (reloadPercent < 0.0) {
			reloadPercent = 0.0;
		}
	    if(player.GetCurrentSnowballs() < projectile.snowCosts){
			finalBoxWidth = boxWidth;
			
			color = new Color(1, 0, 0,0.5);
			text = "Collect Snow";
		}else{
			if (reloadPercent == 0.0) {
				color = new Color(0, 1, 0,0.5);
				text = "Fire!";
				finalBoxWidth = boxWidth;
			}else{
				color = new Color(reloadPercent, 1-reloadPercent, 0,0.5);
				text = "Making "+ projectile.name;
				finalBoxWidth = reloadPercent * boxWidth;
			}
		}
		
		var boxHeight = 19;
		
		texture.SetPixel(0, 0, color);
		texture.Apply();
		style.normal.background = texture;
		
		if (reloadPercent > 0.0) {
			RadialProgress.SetRadialProgress(1-reloadPercent*1.02, 5, ammoIcon);
//			GUI.Box (Rect (Screen.width / 2 - boxWidth/2-1, Screen.height - 25, (Screen.width/8 + 12), boxHeight+2), "");
//			GUI.Box (Rect (Screen.width / 2 - boxWidth/2, Screen.height - 24, finalBoxWidth, boxHeight), "", style);
		}
	}
}


@script RequireComponent (NetworkView)