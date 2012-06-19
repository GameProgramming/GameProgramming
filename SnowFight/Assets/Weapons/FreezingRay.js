@System.NonSerialized
var inputFire : boolean = false;

var energyMax : float = 5.0;
var energy : float = energyMax;

var freezingTime = 0.2f;
private var freezingProgress = 0.0f;
private var freezingCurr :Transform = null;

var freezingStrength = 2.5f;

function Start() {
	freezingCurr = null;
}

function Update () {
	energy += Time.deltaTime;
	if (inputFire) {
		energy -= Time.deltaTime * 2;
		this.transform.Rotate(0,Time.deltaTime * (5.0+energy) * 100.0,0);
	}
	if (energy <= 0) {
		SetActive(false);
	}
	energy = Mathf.Clamp(energy, 0,energyMax);
	
	if (freezingCurr && inputFire) {
		freezingProgress += Time.deltaTime;
		if (freezingProgress >= freezingTime) {
			var attack = new Attack();
			attack.damage = freezingStrength;
			freezingCurr.gameObject.SendMessage("Freeze", attack,
									SendMessageOptions.DontRequireReceiver);
		}
	}
}

function SetActive (a :boolean) :boolean {
	if (a != inputFire) {
		if (a) {
			if (energy > 0.25 * energyMax) { // nur aktivierbar, wenn halbwegs aufgeladen.
				// hier ggf noch diversen kram rein.
				// z.B. sound und eine art animation.
				this.renderer.enabled = true;
				inputFire = a;
			}
		} else {
			inputFire = a;
			freezingCurr = null;
			this.renderer.enabled = false;
		}
	}
	return inputFire;
}

function OnTriggerStay (other :Collider) {
	if (inputFire && (other.CompareTag("Player") || other.CompareTag("Bot"))) {
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

function OnGUI() {
	
}