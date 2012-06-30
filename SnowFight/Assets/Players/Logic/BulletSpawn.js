private var projectile : Rigidbody;
var bullet : Rigidbody;

private var player : PlayerStatus;
private var motor :CharacterMotorSF;

var reloadProgress : float = 0.0;

var startYSpeed :float = 0.0;

var snowCosts :int = 1;

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
}

function Update () {
	reloadProgress -= Time.deltaTime;
}

function Fire () {
	if(reloadProgress <= 0.0 && player && player.GetCurrentSnowballs() >= snowCosts){
		Spawnpoint = transform;
	  	projectile = GetProjectile();
	  	var clone : Rigidbody;	
		clone = Instantiate(projectile, Spawnpoint.position, Spawnpoint.rotation);
	  	clone.velocity = clone.GetComponent("Projectile").speed * Spawnpoint.TransformDirection (Vector3.forward
								+ new Vector3(0, startYSpeed, 0) );
		SendFire(clone);
		
		snowCosts = projectile.GetComponent(Projectile).snowCosts;
		if (snowCosts > 0) {
			player.SubtractSnowball(snowCosts);
		}
		
		reloadProgress = clone.GetComponent("Projectile").reloadTime;
	}
}

function SendFire ( bullet :Rigidbody ) {
	var netId :NetworkViewID = Network.AllocateViewID();
	bullet.networkView.viewID = netId;
	Debug.Log ("Send fire "+netId);
	this.networkView.RPC("NetFire", RPCMode.Others, netId, bullet.position, bullet.velocity);
}

@RPC
function NetFire ( netId :NetworkViewID, pos :Vector3, velo :Vector3 ) {
  	projectile = GetProjectile();
  	var clone : Rigidbody;	
	clone = Instantiate(projectile, pos, transform.rotation);
	clone.networkView.viewID = netId;
	clone.velocity = velo;
	Debug.Log ("Rcv fire "+netId);
}

function FireHeatSeekingRocket (target :GameObject) {
	if(reloadProgress <= 0.0 && player.GetCurrentSnowballs() > 0){
		Spawnpoint = transform;
	  	projectile = GetProjectile();
	  	var clone : Rigidbody;	
		clone = Instantiate(projectile, Spawnpoint.position, Spawnpoint.rotation);
		clone.GetComponent(HeatSeeking).missleTarget = target;
		
		snowCosts = projectile.GetComponent(Projectile).snowCosts;
		if (snowCosts > 0) {
			player.SubtractSnowball(snowCosts);
		}
		
		reloadProgress = clone.GetComponent("Projectile").reloadTime;
	}
}

function SendFireTarget ( bullet :Rigidbody, target :GameObject ) {
	var netId :NetworkViewID = Network.AllocateViewID();
	bullet.networkView.viewID = netId;
	networkView.RPC("NetFireTarget", RPCMode.Others, netId,
					bullet.position, bullet.velocity, target.networkView.viewID);
}

@RPC
function NetFireTarget ( netId :NetworkViewID, pos :Vector3, velo :Vector3, targetId :NetworkViewID ) {
  	projectile = GetProjectile();
  	var clone : Rigidbody;	
	clone = Instantiate(projectile, pos, transform.rotation);
	clone.networkView.viewID = netId;
	clone.velocity = velo;
	
	var tar :NetworkView = NetworkView.Find(targetId);
	if (tar) {
		clone.GetComponent(HeatSeeking).missleTarget = tar.gameObject;
	} else {
		Debug.LogWarning("Could not find Target with ID "+targetId);
	}
}


function GetProjectile(){
	return bullet;
}
 
function OnGUI() {
     if (player != null && player.IsMainPlayer()) {
		var texture : Texture2D = new Texture2D(1, 1);
		var style = new GUIStyle();
		var totalWidth = Screen.width/4; 
		var boxWidth : float= (Screen.width/8 + 10);
		var finalBoxWidth;
		
		var color;
		var text;
		var projectile = GetProjectile().GetComponent("Projectile");
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
			GUI.Box (Rect (Screen.width / 2 - boxWidth/2-1, Screen.height - 25, (Screen.width/8 + 12), boxHeight+2), "");
			GUI.Box (Rect (Screen.width / 2 - boxWidth/2, Screen.height - 24, finalBoxWidth, boxHeight), "", style);
		}
	}
}


@script RequireComponent (NetworkView)