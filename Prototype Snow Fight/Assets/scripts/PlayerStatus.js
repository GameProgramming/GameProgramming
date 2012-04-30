var teamNumber = 1;
var teamBase : Transform;
var fullHp : int = 10;
var stunDuration = 1.0;
var respawnTimeout = 5.0;
var hideDuration = 0.1;
var pushPower = 2.0;

private var hp : int = fullHp;
private var stunTime;
private var killTime = 0.0;
private var gameState : GameStatus;
private var died : boolean = false;
private var stunned : boolean = false;
private var respawning : boolean = false;
InvokeRepeating("Regenerate",5,10);
//var damageSound : AudioClip;

private var anim : Animation;
anim = transform.Find("Model").GetComponent(Animation);
anim["hit"].speed = 10;
anim["hit"].layer = 2;
anim["hit"].wrapMode = WrapMode.Once;

anim["die"].speed = 10;
anim["die"].layer = 3;
anim["die"].wrapMode = WrapMode.ClampForever;
anim["die"].weight = 100;

function Start() {
	//spawn the player at his base (not the bots)
	if (gameObject.CompareTag("Player"))
		Respawn();
		
	//make sure the player is visible on start
	var meshRenderers = GetComponentsInChildren (MeshRenderer);
		for (var rend : MeshRenderer in meshRenderers) {
			rend.enabled = true;
		}
		
		var skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
		for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
			rend.enabled = true;
		}
}

function Update () {
//  if(hp==0){
//  	//audio.PlayOneShot(damageSound);
//  	gameObject.GetComponent("Detonator").Explode();
//  }

  
  	if(!died && !respawning && stunned && Time.time > stunTime + stunDuration) {
	  	stunned = false;
	  	GetComponent(CharacterMotorSF).canControl = true;
	}
  	
	if (died && Time.time > killTime + respawnTimeout)
		Respawn();
		
	//upon respawn make visible after hide time and then stun for a bit
	if (respawning && Time.time > killTime + respawnTimeout + hideDuration) {
		var meshRenderers = GetComponentsInChildren (MeshRenderer);
		for (var rend : MeshRenderer in meshRenderers) {
			rend.enabled = true;
		}
		
		var skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
		for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
			rend.enabled = true;
		}
		respawning = false;
		
		Stun();
	}
}

function Regenerate () {
  hp += 10;
}

function OnCollisionEnter (collision : Collision) {
	if(collision.rigidbody && collision.rigidbody.tag.Equals("Projectile")){
		var ball = collision.transform.GetComponent("Damage");
		
		if (ball)
			hp -= ball.GetDamage();
		//audio.PlayOneShot(damageSound);
		
		anim.CrossFade("hit");
		
		if (hp > 0) {
			Stun();
		}
		else {
			Die(ball);
		}
	}
}

function OnControllerColliderHit (hit : ControllerColliderHit)
{
	var body : Rigidbody = hit.collider.attachedRigidbody;
	// no rigidbody
	if (body == null || body.isKinematic)
	return;
	
	// We dont want to push objects below us
	if (hit.moveDirection.y < -0.3) 
	return;

	// Calculate push direction from move direction, 
	// we only push objects to the sides never up and down
	var pushDir = Vector3 (hit.moveDirection.x, 0, hit.moveDirection.z);
	
	// If you know how fast your character is trying to move,
	// then you can also multiply the push velocity by that.
	
	// Apply the push
body.velocity = pushDir * pushPower;
} 

function OnGUI() {

 

        //GUI.Button (Rect (10,10,150,20), "Skinned Button"); 

        

    }

function Die (ball : Damage) {
	if (died) //we're already dead
		return;
	
	if (ball) {
		gameState = GameObject.FindWithTag("Game").GetComponent("GameStatus");
		gameState.IncreaseScore(ball.GetShootingTeam());
	}
	
	died = true;
	killTime = Time.time;
	
	if(GetComponent(CharacterMotorSF).canControl) {
		GetComponent(CharacterMotorSF).canControl = false;
	}
	
	anim.CrossFade("die");
}

function Stun () {
	if (died) return;
	if(GetComponent(CharacterMotorSF).canControl) {
		GetComponent(CharacterMotorSF).canControl = false;
	}
	stunned = true;
	stunTime = Time.time;
}

function Respawn () {
	respawning = true;
	//hide player for a while
	var meshRenderers = GetComponentsInChildren (MeshRenderer);
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = false;
	}
	
	var skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = false;
	}
	
	transform.position = teamBase.position;
	transform.position.y += 5;
	hp = fullHp;
	died = false;
	anim.Stop("die");	
	
	anim.CrossFade("idle");
	anim["idle"].speed = 10;
}

function IsDead () : boolean {
	return died;
}