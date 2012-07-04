#pragma strict

var breathTime :float = 1.0f;
private var breathProgress = 0.0f;

var strength :int = 10;

function Start() {
}

function Update () {
	if (breathProgress > 0.0) {
		if (networkView.isMine) {
			breathProgress -= Time.deltaTime;
		}
		if (breathProgress <= 0.0) {
			particleSystem.Stop();
		}
	}
}

function Fire () {
	if (networkView.isMine) {
		breathProgress = breathTime;
		particleSystem.Play();
	}
}

function OnTriggerStay (other :Collider) {
	if (Network.isServer && breathProgress > 0 && other.CompareTag("Player")) {
		var attack = new Attack();
		attack.damageType = DamageType.Area;
//		attack.attacker = 
		attack.damage = strength * 10 * Time.deltaTime;
		other.gameObject.SendMessage("ApplyDamage", attack,
									SendMessageOptions.DontRequireReceiver);
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