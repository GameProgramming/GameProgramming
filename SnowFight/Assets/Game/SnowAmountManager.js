#pragma strict

// minimale anzahl an schneebaellen, die in den vorkommen und kugeln gelagert liegen soll.
var snowAmountBalance :int = 1000;
// tatsaechlich gerade verfuegbare ressourcen.
var snowAmount :int = 0;

private var distributionRound :int = 0;

InvokeRepeating("UpdateSnowManagement", 1.0, 1.0);

function UpdateSnowManagement () {
	if (!Network.isServer) return;
	
	snowAmount = 0;
	for (var res :GameObject in GameObject.FindGameObjectsWithTag("SnowballRessource")) {
		snowAmount += res.GetComponent(SnowRessource).GetCurrentSnowballs();
	}
	for (var res :GameObject in GameObject.FindGameObjectsWithTag("BigSnowball")) {
		snowAmount += res.GetComponent(BigSnowBall).GetCurrentSnowballs();
	}
	if (snowAmount < snowAmountBalance) {
		distributionRound++;
	}
}

function GetDistributionRound() : int {
	return distributionRound;
}