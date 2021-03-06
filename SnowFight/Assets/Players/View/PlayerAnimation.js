#pragma strict
#pragma downcast

private var team :Team;
private var teamColor :Color;

var redDuration = 0.2;
var hideDuration = 0.1;

private var lastPosition :Vector3;

private var goRed : boolean = false;
private var redTime = 0.0;

private var anim : Animation;

private var playerState :PlayerState = PlayerState.Dead;
private var playerStatus :PlayerStatus;
private var item :GameObject;
private var motor :CharacterMotorSF;
private var camSetup :Transform;
private var throwPreview :ThrowPreview;
private var frost :Transform;

private var healthParticles :ParticleSystem;
private var body :Transform;
private var meshRenderers :MeshRenderer[];
private var skinnedRenderers :SkinnedMeshRenderer[];
private var controller :CharacterController;

var healingSound : AudioClip;

enum PlayerViewMode {Default, AimUp}
private var viewMode :PlayerViewMode = PlayerViewMode.Default;

private var closestBase :TeamBase;

function Awake() {
	viewMode = PlayerViewMode.Default;
	
	playerStatus = GetComponent(PlayerStatus);
	motor = GetComponent(CharacterMotorSF);
	camSetup = transform.Find("CameraSetup");
	throwPreview = transform.Find("BulletSpawn").GetComponent(ThrowPreview);
	frost = transform.Find("Frost");
	healthParticles = transform.Find("HealthParticles").particleSystem;
	
	anim = transform.Find("Model").GetComponent(Animation);
	
	controller = GetComponent (CharacterController);
	
	anim["hit"].speed = 20;
	anim["hit"].layer = 2;
	anim["hit"].wrapMode = WrapMode.Once;
	anim["hit"].blendMode = AnimationBlendMode.Additive;
	
	anim["die"].speed = 20;
	anim["die"].layer = 3;
	anim["die"].wrapMode = WrapMode.ClampForever;
	anim["die"].weight = 100;
	
	anim["throw1"].layer = 1;
	anim["throw1"].blendMode = AnimationBlendMode.Additive;
	
	anim["throw2"].layer = 1;
	anim["throw2"].blendMode = AnimationBlendMode.Additive;
	
	anim["push"].layer = 0;
	anim["push"].speed = 20;
	anim["push"].weight = 10;
	
	anim["rocketlauncher"].layer = 0;
	anim["rocketlauncher"].speed = 20;
	anim["rocketlauncher"].weight = 10;
	
	anim["rocketfire"].layer = 1;
	anim["rocketfire"].speed = 14;
	anim["rocketfire"].weight = 10;
	anim["rocketfire"].blendMode = AnimationBlendMode.Additive;
	
	anim.enabled = true;
	
	body = transform.Find("Model");
	meshRenderers = body.GetComponentsInChildren.<MeshRenderer> ();
	skinnedRenderers = body.GetComponentsInChildren.<SkinnedMeshRenderer> ();
	
//	for (var rend : MeshRenderer in meshRenderers) {
//		rend.enabled = false;
//	}
//	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
//		rend.enabled = false;
//	}
}

function OnJoinTeam (t :Team) {
	team = t;
	if (team == null) {
		Debug.LogError("Could not determine Player team. (Player object has to be child of Team object!)");
	}
	
	teamColor = team.GetColor();
	transform.Find("Arrow").SendMessage("SetColor", teamColor);
	
	//make sure the player is visible on start
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = true;
		rend.material.SetTexture("_MainTex",team.playerSkin);
	}
	
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = true;
		rend.material.SetTexture("_MainTex",team.playerSkin);
	}
}

function Update () {
	if (goRed && Time.time > redTime + redDuration) {
		//color damaged player back to white
		for (var rend : MeshRenderer in meshRenderers) {
			rend.material.color = Color.white;
		}
		for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
			rend.material.color = Color.white;
		}
		goRed = false;
	}
	
	var posVelo = Vector3.Scale(Vector3(1,0,1),(transform.position - lastPosition))/Time.deltaTime;
	lastPosition = transform.position;
	
	var speed = 0.15 * posVelo.magnitude;
	
	if (item) {
		if (item.CompareTag("BigSnowball")) {
			anim.CrossFade("push");
			anim["push"].speed = speed * 60;
		} else if (item.CompareTag("Weapon")) {
			anim.CrossFade("rocketlauncher");
			anim["rocketlauncher"].speed = speed * 60;
		}
	} else if (motor.grounded) {
		if (speed > 0.01) {
			anim.CrossFade("walk");
			anim["walk"].speed = speed * 60;
		} else {
			anim.CrossFade("idle");
			anim["idle"].speed = 10;
		}
	} else {
		anim.CrossFade("jumping");
		anim["jumping"].speed = 10;
	}
	
	if (!closestBase || !closestBase.PlayerInRange(gameObject)) {
		closestBase = null;
		healthParticles.enableEmission = false;
	} else if (playerState != PlayerState.Dead && playerStatus.IsMainPlayer() &&
			closestBase.takeOverProgress > 0.001 && closestBase.takeOverCurrTeam) {
		RadialProgress.SetRadialProgress(closestBase.takeOverProgress, 3,
									closestBase.takeOverCurrTeam.teamBaseIcon);
	}
	
//	
//	if (motor.throwProgress == 0) {
//		anim.Stop("throw1");
//	}
	if (camSetup) {
		switch (viewMode) {
		case PlayerViewMode.AimUp:
			camSetup.localEulerAngles = Vector3(-10-1.3*motor.rotationY,0,0);
			break;
		default:
			camSetup.localEulerAngles = Vector3(-0.5*motor.rotationY,0,0);
			break;
		}
	}
}

function OnThrow () {
	anim.Stop("throw1");
	anim.Play("throw2");
	anim["throw2"].speed = 20;
	anim["throw2"].weight = 10;
	if (playerStatus.IsMainPlayer()) {
		throwPreview.Deactivate();
	}
}

function OnLoadThrow () {
	anim.Play("throw1");
	anim["throw1"].speed = 20;
	anim["throw1"].weight = 10;
	if (playerStatus.IsMainPlayer()) {
		throwPreview.Activate();
	}
}

function OnUnloadThrow () {
	anim.Stop("throw1");
	anim.Stop("throw2");
	if (playerStatus.IsMainPlayer()) {
		throwPreview.Deactivate();
	}
}

function OnDeath () {
	anim.CrossFade("die");
	anim.Stop("hit");
	anim.Stop("push");
	anim.Stop("throw1");
	anim.Stop("throw2");
	if (playerStatus.IsMainPlayer()) {
		throwPreview.Deactivate();
	}
}

function OnRespawn () {
	frost.renderer.enabled = false;
	anim.Stop();
	//show player
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = true;
	}
	
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = true;
	}
	
	if (playerStatus.IsMainPlayer()) {
		var overviewCam = GameObject.FindGameObjectWithTag("OverviewCam").GetComponent(MapOverview);
		overviewCam.ResetPlayerCam();
		overviewCam.SetMode(false);
	}
	
	anim.Stop("die");
	
	anim.CrossFade("idle");
	anim["idle"].speed = 10;
}

function OnHit () {
	anim.CrossFade("hit");
		
	goRed = true;
	redTime = Time.time;
	for (var rend : MeshRenderer in meshRenderers) {
	//	if(!rend.CompareTag("BigSnowball")) //avoid the ball from turning red
			rend.material.color = new Color(0.9,0.2,0.2,1);
	}
	
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
	//	if(!rend.CompareTag("BigSnowball")) //avoid the ball from turning red
			rend.material.color = new Color(0.9,0.2,0.2,1);
	}
}

//function Freeze (s: float) {
//	frost.renderer.enabled = true;
//}
//
//function OnDefrost () {
//	frost.renderer.enabled = false;
//}

function OnPlayerStateChange (newState :PlayerState) {
	healthParticles.enableEmission = false;
	var formerState = playerState;
	playerState = newState;
	switch (playerState) {
	case PlayerState.Dead:
		if (playerStatus.IsMainPlayer()) {
			var overviewCam = GameObject.FindGameObjectWithTag("OverviewCam").GetComponent(MapOverview);
			if (formerState != newState) yield WaitForSeconds(.3);
			overviewCam.SetPlayerCam(transform.Find("CameraSetup/CameraDeath"));
			if (formerState != newState) yield WaitForSeconds(1.3);
			overviewCam.ResetPlayerCam();
			transform.Find("Arrow").SendMessage("SetArrowMode", ArrowMode.UpOut);
			overviewCam.SetMode(true);
		}
		if (frost) frost.renderer.enabled = false;
		break;
	case PlayerState.Alive:
	case PlayerState.InVehicle:
		anim.Stop();
		if (frost) frost.renderer.enabled = false;
		if (playerStatus.IsMainPlayer()) {
			transform.Find("Arrow").SendMessage("SetArrowMode", ArrowMode.Jumping);
		}
		break;
	case PlayerState.Frozen:
		if (frost) frost.renderer.enabled = true;
		break;
	}
}

function OnItemChange(itemManager :ItemManager) {
	item = itemManager.GetItem();
	if (item && item.GetComponent(RocketLauncher)){
		viewMode = PlayerViewMode.AimUp;
	} else {
		viewMode = PlayerViewMode.Default;
	}
	if (anim) {
		anim.Stop("push");
		anim.Stop("rocketlauncher");
		anim.Stop("rocketfire");
		anim.Stop("throw1");
		anim.Stop("throw2");
		if (item && item.CompareTag("BigSnowball")) {
			anim.CrossFade("push");
		} else if (item && item.CompareTag("Weapon")) {
			anim.CrossFade("rocketlauncher");
		}
	}
	if (playerStatus.IsMainPlayer()) {
		var overview :MapOverview = GameObject.FindGameObjectWithTag("OverviewCam")
				.GetComponent(MapOverview);
		if (item == null) {
			overview.ResetPlayerCam();
		} else if (item.CompareTag("Ufo")) {
			overview.SetPlayerCam(item.transform.Find("UfoCam"));
		} else if (item.CompareTag("BigSnowball")) {
			overview.SetPlayerCam(transform.Find("CameraSetup/CameraTargetDistant"));
		} else {
			overview.ResetPlayerCam();
		}
	}
}

function GameOver () {
	yield WaitForSeconds(.7);
	anim.enabled = false;
}

function OnSetMainPlayer () {
	transform.Find("Arrow").SendMessage("SetArrowMode", ArrowMode.Jumping);
}

function OnSetBot () {
	transform.Find("Arrow").SendMessage("SetArrowMode", ArrowMode.Disabled);
}

function OnSetRemote () {
	transform.Find("Arrow").SendMessage("SetArrowMode", ArrowMode.Disabled);
}

function OnBulletSpawnFired (bs :BulletSpawn) {
	if (item && item.CompareTag("Weapon")) {
		anim.CrossFade("rocketfire");
	}
}

function SetClosestBase (base :TeamBase) {
	closestBase = base;
	healthParticles.enableEmission = base.team == team && !playerStatus.HasFullHp();
	if(healthParticles.enableEmission){
		PlayAudio(healingSound);
	}
}

function OnLand() {
	body.SendMessage("OnRightStep");
	body.SendMessage("OnLeftStep");
}

function PlayAudio(audio : AudioClip){
	transform.audio.clip=audio;
	if(!transform.audio.isPlaying){
	    	   	transform.audio.Play();
	}
}

@script RequireComponent (NetworkView)