#pragma strict
#pragma downcast

var breathTime :float = 1.0f;
private var breathProgress = 0.0f;

var strength :int = 10;

private var player :PlayerStatus;
private var targets :Array;

var onBreathSound1 : AudioClip;
var onBreathSound2 : AudioClip;
var onBreathSound3 : AudioClip;

function PlayBreathAudio(){
	var soundNumber : float = Random.Range(0.0,0.3);
	//Debug.Log(soundNumber);
	if(soundNumber <= 0.1){
		PlayAudio(onBreathSound1);
	}
	if(soundNumber > 0.1 && soundNumber <= 0.2){
		PlayAudio(onBreathSound2);
	}
	if(soundNumber > 0.2){
		PlayAudio(onBreathSound3);
	}
		
}

function PlayAudio(audio : AudioClip){
	transform.audio.clip=audio;
	if(!transform.audio.isPlaying){
	    	   	transform.audio.Play();
	}
}

function Awake() {
	targets = new Array();
}

function Update () {
	if (breathProgress > 0.0) {
		if (Network.isServer) {
			for (var tar :Collider in targets) {
				var attack = new Attack();
				attack.damageType = DamageType.Area;
				if (player) {
					attack.attacker = player.gameObject;
				}
				attack.damage = strength * 10 * Time.deltaTime;
				tar.gameObject.SendMessage("ApplyDamage", attack);
			}
		}
		if (networkView.isMine) {
			breathProgress -= Time.deltaTime;
		}
		if (breathProgress <= 0.0) {
			particleSystem.Stop();
		}
	}
}

function ConnectToPlayer (t :Transform) {
	if (t) {
		player = t.GetComponent(PlayerStatus);
	} else {
		player = null;
	}
}

function Fire () {
	if (networkView.isMine) {
		breathProgress = breathTime;
		particleSystem.Play();
	}
	PlayBreathAudio();
}

function OnTriggerEnter (other :Collider) {
	if (Network.isServer && other.CompareTag("Player")) {
		targets.Add(other);
	}
}

function OnTriggerExit (other :Collider) {
	if (Network.isServer && other.CompareTag("Player")) {
		targets.Remove(other);
	}
}

function OnSerializeNetworkView(stream :BitStream, info :NetworkMessageInfo) {
	var inp :boolean = (breathProgress > 0.0);
    stream.Serialize(inp);
    if (inp != (breathProgress > 0.0)) {
    	if (inp) {
    		breathProgress = breathTime;
    		particleSystem.Play();
    	} else {
    		breathProgress = 0;
    		particleSystem.Stop();
    	}
    }
}

@script RequireComponent (NetworkView)