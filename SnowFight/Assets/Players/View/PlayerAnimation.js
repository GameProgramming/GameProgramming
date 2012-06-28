
var redDuration = 0.2;
var hideDuration = 0.1;

private var goRed : boolean = false;
private var redTime = 0.0;

private var anim : Animation;

private var playerState :PlayerState;
private var playerStatus :PlayerStatus;
private var motor :CharacterMotorSF;
private var camSetup :Transform;
private var throwPreview :ThrowPreview;
private var frost :Transform;

private var body :Transform;
private var meshRenderers :Component[];
private var skinnedRenderers :Component[];

enum PlayerViewMode {Default, AimUp}
private var viewMode :PlayerViewMode = PlayerViewMode.Default;

function Awake() {
	viewMode = PlayerViewMode.Default;
	
	playerStatus = GetComponent(PlayerStatus);
	motor = GetComponent(CharacterMotorSF);
	camSetup = transform.Find("CameraSetup");
	throwPreview = transform.Find("BulletSpawn").GetComponent(ThrowPreview);
	frost = transform.Find("Frost");
	
	anim = transform.Find("Model").GetComponent(Animation);
	
	anim["hit"].speed = 10;
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

	anim.enabled = true;
	
	body = transform.Find("Model");
	meshRenderers = body.GetComponentsInChildren (MeshRenderer);
	skinnedRenderers = body.GetComponentsInChildren (SkinnedMeshRenderer);

	//make sure the player is visible on start
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = true;
	}
	
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = true;
	}
}

function OnJoinTeam (t :Team) {
	team = t;
	if (team == null) {
		Debug.LogError("Could not determine Player team. (Player object has to be child of Team object!)");
	}

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
			//if(!rend.CompareTag("BigSnowball"))
				rend.material.color = Color.white;
		}

		for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
			//if(!rend.CompareTag("BigSnowball"))
				rend.material.color = Color.white;
		}
		goRed = false;
	}
	
	if (motor.grounded) {
		var speed = motor.inputMoveDirection.magnitude;
		if (speed > 0.01) {
			anim.CrossFade("walk");
			anim["walk"].speed = speed * 80;
		} else {
			anim.CrossFade("idle");
			anim["idle"].speed = 10;
		}
	} else {
		anim.CrossFade("jumping");
		anim["jumping"].speed = 10;
	}
	
//	if (throwPreview && throwPreview.IsActivated()) {
//		throwPreview.startYSpeed = 0.03+motor.rotationY*.015;
//	}
	
	if (motor.throwProgress == 0) {
		anim.Stop("throw1");
		
	}
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
}

function OnRespawn () {
	frost.renderer.enabled = false;
	//show player
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = true;
	}
	
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = true;
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
	playerState = newState;
	switch (playerState) {
	case PlayerState.Dead:
	case PlayerState.Alive:
	case PlayerState.InVehicle:
		if (frost) frost.renderer.enabled = false;
		break;
	case PlayerState.Frozen:
		if (frost) frost.renderer.enabled = true;
		break;
	}
}

function OnItemChange(itemManager :ItemManager) {
	var item :GameObject = itemManager.GetItem();
	if (item && item.GetComponent(RocketLauncher)){
		viewMode = PlayerViewMode.AimUp;
	} else {
		viewMode = PlayerViewMode.Default;
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
	anim.enabled = false;
}