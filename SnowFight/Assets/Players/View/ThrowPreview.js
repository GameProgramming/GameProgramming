
private var player : PlayerStatus;
private var motor :CharacterMotorSF;
private var bulletSpawn :BulletSpawn;
private var line :LineRenderer;
private var activated = false;

var mat1 :Material;
var mat2 :Material;
private var matFade = 0.0;

function Start () {
	player = transform.parent.GetComponent(PlayerStatus);
	bulletSpawn = GetComponent(BulletSpawn);
	motor = transform.parent.GetComponent(CharacterMotorSF);
	line = GetComponent(LineRenderer);
	line.material = mat1;
	activated = false;
}

function Update () {
	if (activated) {
		var clone : Rigidbody;	
		clone = Instantiate(bulletSpawn.projectile);
		var speed = clone.GetComponent("Projectile").speed * 
					((matFade * Vector3.forward) + new Vector3(0, 0.03+motor.rotationY*.015,0) );
		var curPos = Vector3(0,0,0)-speed/8.0;
		for (var i = 0; i < 20; i++) {
			line.SetPosition(i,curPos);
			curPos += speed/20.0;
			speed += Physics.gravity/20.0;
		}
		matFade += 5 * Time.deltaTime;
	} else {
		matFade -= 5 * Time.deltaTime;
	}
	matFade = Mathf.Clamp01(matFade);
	line.material.Lerp(mat1, mat2, matFade);
}

function Activate () {
	activated = true;
}

function Deactivate () {
	activated = false;
}