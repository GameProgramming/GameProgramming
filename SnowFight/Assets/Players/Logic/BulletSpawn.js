private var projectile : Rigidbody;
var bullet : Rigidbody;

private var player : PlayerStatus;
private var motor :CharacterMotorSF;

var reloadProgress = 0;

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
	if(reloadProgress <= 0 && player.GetCurrentSnowballs() > 0){
		Spawnpoint = transform;
	  	projectile = GetProjectile();
	  	var clone : Rigidbody;	
		clone = Instantiate(projectile, Spawnpoint.position, Spawnpoint.rotation);
		if (!projectile.GetComponent(HeatSeeking)){
			clone.velocity = clone.GetComponent("Projectile").speed * Spawnpoint.TransformDirection (Vector3.forward
								+ new Vector3(0, startYSpeed, 0) );
		}
		
		snowCosts = projectile.GetComponent(Projectile).snowCosts;
//		Debug.Log(snowCosts);
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
     if (transform.parent.tag.Equals("Player")) {
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
			boxWidth = (Screen.width/4);
			color = new Color(1, 0, 0,0.5);
			text = "RELOAD";
		}else{
			boxWidth = reloadPercent * (Screen.width/4);
			color = new Color(reloadPercent, 1-reloadPercent, 0,0.5);
			text = "Loading";
		}
		
		var boxHeight = 20;
		
		
		texture.SetPixel(0, 0, color);
		texture.Apply();
		style.normal.background = texture;
		
		if (player.GetCurrentSnowballs() <= 0) {
			GUI.Box (Rect (Screen.width/2-31, Screen.height/2-1, totalWidth+2, boxHeight+2), "");
			GUI.Box (Rect (Screen.width/2-30, Screen.height/2, boxWidth, boxHeight), text,style);
		}
	
		//GUI.Box (Rect (Screen.width/1.4 + (totalWidth-boxWidth), 10, boxWidth, boxHeight), "",style);
	}
}