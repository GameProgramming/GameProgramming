@System.NonSerialized
var inputFire : boolean = false;

var energyMax : float = 5.0;
var energy : float = energyMax;
var onFreezingSound : AudioClip;

var freezingTime = 0.2f;
private var freezingProgress = 0.0f;
private var freezingCurr :Transform = null;

private var player :GameObject;

var freezingStrength = 2.5f;

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

function Start() {
	freezingCurr = null;
}

function Update () {
	energy += Time.deltaTime;
	if (inputFire) {
		PlayAudio(onFreezingSound);
		energy -= Time.deltaTime * 4;
		this.transform.Rotate(0,Time.deltaTime * (5.0+energy) * 100.0,0);
	}else{
		StopAudio();
	}
	if (energy <= 0) {
		SetActive(false);
	}
	energy = Mathf.Clamp(energy, 0,energyMax);
	
	if (freezingCurr && inputFire) {
		freezingProgress += Time.deltaTime;
		if (freezingProgress >= freezingTime && networkView.isMine) {
			var attack = new Attack();
			attack.damage = freezingStrength;
			attack.damageType = DamageType.Freeze;
			attack.attacker = player;
			freezingCurr.gameObject.SendMessage("ApplyDamage", attack);
		}
	}
}

function ConnectToPlayer (pT :Transform) {
	if (pT) {
		player = pT.gameObject;
	}
}

function SetActive (a :boolean) :boolean {
	if (a != inputFire) {
		if (a) {
			if (energy > 0.25 * energyMax) { // nur aktivierbar, wenn halbwegs aufgeladen.
				NetSetActive (true);
			}
		} else {
			NetSetActive (false);
		}
	}
	return inputFire;
}

private function NetSetActive (a :boolean) {
	if (a) {
		// hier ggf noch diversen kram rein.
		// z.B. sound und eine art animation.
		this.renderer.enabled = true;
	} else {
		freezingCurr = null;
		this.renderer.enabled = false;
	}
	inputFire = a;
}


function OnTriggerStay (other :Collider) {
	if (inputFire && (other.CompareTag("Player"))) {
		if (freezingCurr == null) {
			var p = other.GetComponent(PlayerStatus);
			if (!p.IsDead() && !p.IsFrozen()) {
				freezingCurr = other.transform;
				freezingProgress = 0.0;
			}
		}
	}
}

function OnTriggerExit (other :Collider) {
	if (other.transform == freezingCurr) {
		freezingCurr = null;
	}
}

function OnSerializeNetworkView(stream :BitStream, info :NetworkMessageInfo) {
	var inp :boolean = inputFire;
    stream.Serialize(inp);
    if (inp != inputFire) {
    	NetSetActive(inp);
    }
}

@script RequireComponent (NetworkView)