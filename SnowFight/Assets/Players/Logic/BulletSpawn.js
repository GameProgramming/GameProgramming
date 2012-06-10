private var projectile : Rigidbody;
var bullet : Rigidbody;

private var player : PlayerStatus;
private var motor :CharacterMotorSF;

var reloadProgress = 0;

@System.NonSerialized
var inputFire : boolean = false;

function Start() {
	ConnectToPlayer(transform.parent);
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
		player.SubtractSnowball();
	    Spawnpoint = transform;
	  	projectile = GetProjectile();
	  	var clone : Rigidbody;	
		clone = Instantiate(projectile, Spawnpoint.position, Spawnpoint.rotation);
		
		clone.velocity = clone.GetComponent("Projectile").speed * Spawnpoint.TransformDirection (Vector3.forward
								+ new Vector3(0, 0.03+motor.rotationY*.015,0) );
		//if(clone.GetComponent("Damage")) {
			//clone.GetComponent("Damage").dmg = clone.GetComponent("Projectile").dmg;
			//clone.GetComponent("Damage").team = player.team;
		//}
		
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
		
		
		GUI.Box (Rect (Screen.width/1.4-1, 29, totalWidth+2, boxHeight+2), "");
		GUI.Box (Rect (Screen.width/1.4, 30, boxWidth, boxHeight), text,style);
		//GUI.Box (Rect (Screen.width/1.4 + (totalWidth-boxWidth), 10, boxWidth, boxHeight), "",style);
	}
}