private var projectile : Rigidbody;
var bullet : Rigidbody;

private var player : PlayerStatus;
private var motor :CharacterMotorSF;

var reloadProgress : float = 0.0;

var startYSpeed :float = 0.0;

@System.NonSerialized
var inputFire : boolean = false;

var snowCosts :int = 1;

function Start() {
	ConnectToPlayer(transform.parent);
	startYSpeed = 0.0;
}

function ConnectToPlayer (t :Transform) {
	player = t.GetComponent(PlayerStatus);
	motor = t.GetComponent(CharacterMotorSF);
}

function Update () {
	reloadProgress -= Time.deltaTime;
}

function Fire () {
	if(reloadProgress <= 0.0 && player.GetCurrentSnowballs() > 0){
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
		
		inputFire = false;
		reloadProgress = clone.GetComponent("Projectile").reloadTime;
	}
}

function SendFire ( bullet :Rigidbody ) {
	var netId :NetworkViewID = Network.AllocateViewID();
	bullet.networkView.viewID = netId;
	networkView.RPC("NetFire", RPCMode.Others, netId, bullet.position, bullet.velocity);
}

@RPC
function NetFire ( netId :NetworkViewID, pos :Vector3, velo :Vector3 ) {
  	projectile = GetProjectile();
  	var clone : Rigidbody;	
	clone = Instantiate(projectile, pos, transform.rotation);
	clone.networkView.viewID = netId;
	clone.velocity = velo;
}

function FireHeatSeekingRocket (target) {
	//TODO: falls das hier benuttzt wird, muss hier auch noch netwerk rein.
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
		
		inputFire = false;
		reloadProgress = clone.GetComponent("Projectile").reloadTime;
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
		var boxWidth;
		var color;
		var text;
		var projectile = GetProjectile().GetComponent("Projectile");
		var maxReload = projectile.reloadTime;
		
		var reloadPercent : float = parseFloat(reloadProgress) / parseFloat(maxReload);
		
	    if(player.GetCurrentSnowballs() <= 0){
			boxWidth = (Screen.width/4 + 12);
			color = new Color(1, 0, 0,0.5);
			text = "RELOAD";
		}else{
			boxWidth = reloadPercent * (Screen.width/4);
			color = new Color(reloadPercent, 1-reloadPercent, 0,0.5);
			text = "Loading";
		}
		
		var boxHeight = 19;
		
		
		texture.SetPixel(0, 0, color);
		texture.Apply();
		style.normal.background = texture;
		
		if (player.GetCurrentSnowballs() <= 0) {
			GUI.Box (Rect (Screen.width - 231, Screen.height - 25, boxWidth, boxHeight), "");
			GUI.Box (Rect (Screen.width - 231, Screen.height - 25, boxWidth, boxHeight), "", style);
			
		}
	
		//GUI.Box (Rect (Screen.width/1.4 + (totalWidth-boxWidth), 10, boxWidth, boxHeight), "",style);
	}
}