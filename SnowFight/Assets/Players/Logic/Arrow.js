private var map : MapOverview;
private var status : PlayerStatus;
//False means downwards, true means upwards.
private var direction : boolean;

function Start () {
	map = GameObject.FindGameObjectWithTag("OverviewCam").GetComponent(MapOverview);
	transform.renderer.enabled = false;
	direction = false;
	status = transform.parent.GetComponent(PlayerStatus);
}

function Update () {
	if (map.GetMode() && status.IsMainPlayer()) {
		transform.renderer.enabled = true;
		if (transform.localPosition.y <= 14) {
			direction = true;
		}
		if (transform.localPosition.y >= 16) {
			direction = false;
		}
		if (direction) {
			transform.localPosition.y += 0.03;
		} else {
			transform.localPosition.y -= 0.03;
		}
	}
	if (!map.GetMode() && status.IsMainPlayer()) {
		transform.renderer.enabled = false;
	}
}