
var redDuration = 0.2;
var hideDuration = 0.1;

private var goRed : boolean = false;
private var redTime = 0.0;

private var anim : Animation;

private var playerStatus :PlayerStatus;
private var motor :CharacterMotorSF;
private var camSetup :Transform;
private var throwPreview :ThrowPreview;

function Start() {
	playerStatus = GetComponent(PlayerStatus);
	motor = GetComponent(CharacterMotorSF);
	camSetup = transform.FindChild("CameraSetup");
	throwPreview = transform.FindChild("BulletSpawn").GetComponent(ThrowPreview);
	
	anim = transform.Find("Model").GetComponent(Animation);
	
	anim["hit"].speed = 10;
	anim["hit"].layer = 2;
	anim["hit"].wrapMode = WrapMode.Once;
	anim["hit"].blendMode = AnimationBlendMode.Additive;
	
	anim["die"].speed = 10;
	anim["die"].layer = 3;
	anim["die"].wrapMode = WrapMode.ClampForever;
	anim["die"].weight = 100;
	
	anim["throw1"].layer = 1;
	anim["throw1"].blendMode = AnimationBlendMode.Additive;
	
	anim["throw2"].layer = 1;
	anim["throw2"].blendMode = AnimationBlendMode.Additive;

	anim.enabled = true;
	
	team = transform.parent.gameObject.GetComponent("Team");
	if (team == null) {
		Debug.LogError("Could not determine Player team. (Player object has to be child of Team object!)");
	}

	//make sure the player is visible on start
	var meshRenderers = GetComponentsInChildren (MeshRenderer);
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = true;
		rend.material.SetTexture("_MainTex",team.playerSkin);
	}
	
	var skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = true;
		rend.material.SetTexture("_MainTex",team.playerSkin);
	}
}

function Update () {
	if (goRed && Time.time > redTime + redDuration) {
		//get renderers for showing/hiding or coloring player and bots
		var meshRenderers = GetComponentsInChildren (MeshRenderer);
		var skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
	
		//color damaged player back to white
		for (var rend : MeshRenderer in meshRenderers) {
			if(!rend.CompareTag("BigSnowball"))
				rend.material.color = Color.white;
		}

		for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
			if(!rend.CompareTag("BigSnowball"))
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
		
	if (motor.throwProgress == 0) {
		anim.Stop("throw1");
		
	}
	if (camSetup) {
		camSetup.localEulerAngles = Vector3(-0.3*motor.rotationY,0,0);
	}
}

function OnThrow () {
	anim.Stop("throw1");
	anim.Play("throw2");
	anim["throw2"].speed = 20;
	anim["throw2"].weight = 10;
	if (throwPreview) {
		throwPreview.Deactivate();
	}
}

function OnLoadThrow () {
	anim.Play("throw1");
	anim["throw1"].speed = 20;
	anim["throw1"].weight = 10;
	if (throwPreview) {
		throwPreview.Activate();
	}
}

function OnUnloadThrow () {
	anim.Stop("throw1");
	anim.Stop("throw2");
	if (throwPreview) {
		throwPreview.Deactivate();
	}
}

function OnDeath () {
	anim.CrossFade("die");
}

function OnRespawn () {
	//show player
	var meshRenderers = GetComponentsInChildren (MeshRenderer);
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = true;
	}
	
	var skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = true;
	}
	
	anim.Stop("die");
	
	anim.CrossFade("idle");
	anim["idle"].speed = 10;
}

function OnHit () {
	anim.CrossFade("hit");
	
	//color player red when hit
	goRed = true;
	redTime = Time.time;
	var meshRenderers = GetComponentsInChildren (MeshRenderer);
	for (var rend : MeshRenderer in meshRenderers) {
		if(!rend.CompareTag("BigSnowball")) //avoid the ball from turning red
			rend.material.color = new Color(0.9,0.2,0.2,1);
	}
	
	var skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		if(!rend.CompareTag("BigSnowball")) //avoid the ball from turning red
			rend.material.color = new Color(0.9,0.2,0.2,1);
	}
}

function GameOver () {
	anim.enabled = false;
}