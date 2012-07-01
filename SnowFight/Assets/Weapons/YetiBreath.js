#pragma strict

var breathTime :float = 1.0f;
private var breathProgress = 0.0f;

var strength :int = 10;

function Start() {
}

function Update () {
	if (breathProgress > 0.0) {
		breathProgress -= Time.deltaTime;
	} else {
		particleSystem.Stop();
	}
}

function Fire () {
	breathProgress = breathTime;
	particleSystem.Play();
}

function OnTriggerStay (other :Collider) {
	if (breathProgress > 0 && other.CompareTag("Player")) {
		var attack = new Attack();
		attack.damageType = DamageType.Area;
		attack.damage = strength * 10 * Time.deltaTime;
		other.gameObject.SendMessage("ApplyDamage", attack,
									SendMessageOptions.DontRequireReceiver);
	}
}