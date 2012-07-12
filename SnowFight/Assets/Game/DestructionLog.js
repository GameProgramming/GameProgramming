#pragma strict
#pragma downcast

private var destructionLog :Array = new Array();

function LogDestruction (viewId :NetworkViewID) {
	destructionLog.Add(viewId);
}

function OnPlayerConnected (player :NetworkPlayer) {
	for (var id :NetworkViewID in destructionLog) {
		networkView.RPC("NetSyncDestructions", player, id);
	}
}

@RPC
function NetSyncDestructions ( id :NetworkViewID ) {
	var view :NetworkView = NetworkView.Find(id);
	if (view) {
		Debug.LogWarning("[Network] For some strange reason the client instantiated the "
						+ "deleted entity with "+id+"... We'll remove it again.");
		Destroy(view.gameObject);
	}
}

function GameOver () {
	this.enabled = false;
}

@script RequireComponent (NetworkView)