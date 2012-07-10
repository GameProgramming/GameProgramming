
private var player : PlayerStatus;
private var bulletSpawn :BulletSpawn;
private var line :LineRenderer;
private var activated = false;

var mat1 :Material;
var mat2 :Material;
private var matFade = 0.0;


function Start () {
	player = transform.parent.GetComponent(PlayerStatus);
	bulletSpawn = GetComponent(BulletSpawn);
	line = GetComponent(LineRenderer);
	line.material = mat1;
	activated = false;
}

function Update () {
	if (activated) {
		var speed = bulletSpawn.GetProjectile().GetComponent("Projectile").speed * 
					((matFade * Vector3.forward) + new Vector3(0, bulletSpawn.startYSpeed,0) );
		var curPos = Vector3(0,0,0);//-speed/8.0;
		for (var i = 0; i < 40; i++) {
			line.SetPosition(i,curPos);
			curPos += speed/20.0;
			speed += Physics.gravity/20.0;
		}
		matFade += 10 * Time.deltaTime;
	} else {
		matFade -= 10 * Time.deltaTime;
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

function IsActivated () :boolean {
	return activated;
}