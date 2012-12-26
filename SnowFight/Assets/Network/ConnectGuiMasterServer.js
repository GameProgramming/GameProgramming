DontDestroyOnLoad(this);

var gameName = "TUYetiTournament";
var serverPort = 25002;
var serverName = "YetiServer";
var botCount = "10";

var playerName = "Player01";
var iPAdress = "0.0.0.0";
var iPort = serverPort.ToString();


private var timeoutHostList = 0.0;
private var lastHostListRequest = -1000.0;
private var hostListRefreshTimeout = 10.0;

private var connectionTestResult : ConnectionTesterStatus = ConnectionTesterStatus.Undetermined;
private var filterNATHosts = false;
private var probingPublicIP = false;
private var needTesting = false;
private var doneTesting = false;
private var timer : float = 0.0;
private var useNat = false;		// Should the server enabled NAT punchthrough feature

private var mainRect;
private var startJoinRect;

private var hideTest = false;
private var testMessage = "Undetermined NAT capabilities";

private var levels :String[];
private var selectedLevelId = 0;

var skin : GUISkin;

private var humanPlayers = "4";

private var origin :Vector2;
var logo :Texture;
var creditTime :float = 0;

enum GUIScreen {Default, Start, Join, Credits, Quit};

var currScreen :GUIScreen = GUIScreen.Default;

// Enable this if not running a client on the server machine
//MasterServer.dedicatedServer = true;

function OnFailedToConnectToMasterServer(info: NetworkConnectionError)
{
	Debug.Log(info);
}

function OnFailedToConnect(info: NetworkConnectionError)
{
	Debug.Log(info);
}

function OnGUI ()
{
	if (skin) {
		GUI.skin = skin;
	}
	if (Network.peerType == NetworkPeerType.Disconnected) {
		Screen.showCursor = true;
		Screen.lockCursor = false;
		//mainRect = GUILayout.Window (0, mainRect, MakeMainWindow, "");	
		
		var scale :float = Screen.width / 1024.0;
		
		GUI.DrawTexture(Rect(origin.x-100*scale,origin.y-100*scale, 200*scale,200*scale), logo);
		
		if (GUI.Button(Rect(origin.x-150*scale-100,origin.y-15*scale, 100,30),"start")) {
			currScreen = GUIScreen.Start;
		}
		if (GUI.Button(Rect(origin.x+150*scale,origin.y-15*scale, 100,30),"join")) {
			currScreen = GUIScreen.Join;
		}
		if (GUI.Button(Rect(origin.x-50,origin.y+100*scale, 100,30),"quit")) {
			currScreen = GUIScreen.Credits;
		}
		
		GUILayout.Window (1, new Rect(origin.x-.6*Screen.width-(100+500*scale), Screen.height*.2, (100+500*scale), Screen.height*.6), MakeStartWindow, "");
		GUILayout.Window(2, new Rect(origin.x+.6*Screen.width, Screen.height*.1, (100+500*scale), Screen.height*.8), MakeJoinWindow, "");
		GUILayout.Window(3, new Rect(origin.x-.3*Screen.width, origin.y+Screen.height*.6, .6*Screen.width, Screen.height*.8), MakeCreditWindow, "");
		
		switch (currScreen) {
		case GUIScreen.Start:
			origin = Vector2.MoveTowards(origin, Vector2(1.5*Screen.width, Screen.height/2), scale*1500*Time.deltaTime);
			break;
		case GUIScreen.Join:
			needTesting = true;
			origin = Vector2.MoveTowards(origin, Vector2(-Screen.width/2, Screen.height/2), scale*1500*Time.deltaTime);
			break;
		case GUIScreen.Credits:
			origin = Vector2.MoveTowards(origin, Vector2(Screen.width/2, -Screen.height/2), scale*1500*Time.deltaTime);
			creditTime += Time.deltaTime;
			if (creditTime > 3) {
				currScreen = GUIScreen.Quit;
			}
			break;
		case GUIScreen.Quit:
			origin = Vector2.MoveTowards(origin, Vector2(Screen.width/2, -1.5*Screen.height), scale*1500*Time.deltaTime);
			if (Vector2.Distance(origin, Vector2(Screen.width/2, -1.5*Screen.height)) < 10) {
				Application.Quit();
			}
			break;
		default:
			origin = Vector2.MoveTowards(origin, Vector2(Screen.width/2, Screen.height/2), scale*1500*Time.deltaTime);
		}

	}
}

//function ShowStartWindow() {
//	startJoinRect = Rect(Screen.width/4, 0, 3 * Screen.width/4, Screen.height/4);
//	if (joinGame) joinGame = false; 
//	startGame = true;
//}
//
//function ShowJoinWindow() {
//	startJoinRect = Rect(Screen.width/4, 0, 3 * Screen.width/4, Screen.height/4);
//	if (startGame) startGame = false;
//	joinGame = true;
//}

function Awake ()
{
	mainRect = Rect(0, 0, Screen.width/4 - 1, Screen.height);
	startJoinRect = Rect(Screen.width/4, 0, 3 * Screen.width/4, Screen.height/4);
//	connectionTestResult = Network.TestConnection();
	
	// What kind of IP does this machine have? TestConnection also indicates this in the
	// test results
	if (Network.HavePublicAddress())
		Debug.Log("This machine has a public IP address");
	else
		Debug.Log("This machine has a private IP address");
	
	levels = GetComponent(NetworkLevelLoad).supportedNetworkLevels;
	
	origin = Vector2(Screen.width/2, Screen.height*2);
}

function Update()
{
	// If test is undetermined, keep running
	if (!doneTesting && needTesting)
		TestConnection();
}

function TestConnection()
{
	// Start/Poll the connection test, report the results in a label and react to the results accordingly
	connectionTestResult = Network.TestConnection();
	switch (connectionTestResult)
	{
		case ConnectionTesterStatus.Error: 
			testMessage = "Problem determining NAT capabilities";
			doneTesting = true;
			break;
			
		case ConnectionTesterStatus.Undetermined: 
			testMessage = "Undetermined NAT capabilities";
			doneTesting = false;
			break;
						
		case ConnectionTesterStatus.PublicIPIsConnectable:
			testMessage = "Directly connectable public IP address.";
			useNat = false;
			doneTesting = true;
			break;
			
		// This case is a bit special as we now need to check if we can 
		// circumvent the blocking by using NAT punchthrough
		case ConnectionTesterStatus.PublicIPPortBlocked:
			testMessage = "Non-connectble public IP address (port " + serverPort +" blocked), running a server is impossible.";
			useNat = false;
			// If no NAT punchthrough test has been performed on this public IP, force a test
			if (!probingPublicIP)
			{
				Debug.Log("Testing if firewall can be circumvented");
				connectionTestResult = Network.TestConnectionNAT();
				probingPublicIP = true;
				timer = Time.time + 10;
			}
			// NAT punchthrough test was performed but we still get blocked
			else if (Time.time > timer)
			{
				probingPublicIP = false; 		// reset
				useNat = true;
				doneTesting = true;
			}
			break;
		case ConnectionTesterStatus.PublicIPNoServerStarted:
			testMessage = "Public IP address but server not initialized, it must be started to check server accessibility. Restart connection test when ready.";
			break;
			
		case ConnectionTesterStatus.LimitedNATPunchthroughPortRestricted:
			Debug.Log("LimitedNATPunchthroughPortRestricted");
			testMessage = "Limited NAT punchthrough capabilities. Cannot connect to all types of NAT servers.";
			useNat = true;
			doneTesting = true;
			break;
					
		case ConnectionTesterStatus.LimitedNATPunchthroughSymmetric:
			Debug.Log("LimitedNATPunchthroughSymmetric");
			testMessage = "Limited NAT punchthrough capabilities. Cannot connect to all types of NAT servers. Running a server is ill adviced as not everyone can connect.";
			useNat = true;
			doneTesting = true;
			break;
		
		case ConnectionTesterStatus.NATpunchthroughAddressRestrictedCone:
		case ConnectionTesterStatus.NATpunchthroughFullCone:
			Debug.Log("NATpunchthroughAddressRestrictedCone || NATpunchthroughFullCone");
			testMessage = "NAT punchthrough capable. Can connect to all servers and receive connections from all clients. Enabling NAT punchthrough functionality.";
			useNat = true;
			doneTesting = true;
			break;

		default: 
			testMessage = "Error in test routine, got " + connectionTestResult;
	}
	//Debug.Log(connectionTestResult + " " + probingPublicIP + " " + doneTesting);
}

//function MakeMainWindow(id : int) {
//	
//	if (Network.peerType == NetworkPeerType.Disconnected) {
//		GUILayout.Space(12);
//		
//		GUILayout.BeginHorizontal();
//		if (GUILayout.Button("Start")) {
//			ShowStartWindow();
//		}
//		GUILayout.EndHorizontal();
//		
//		GUILayout.BeginHorizontal();
//		if (GUILayout.Button("Join")) {
//			ShowJoinWindow();
//		}
//		GUILayout.EndHorizontal();
//		
//		GUILayout.Space(3 * Screen.height/4);
//		
//		GUILayout.BeginHorizontal();
//		if (GUILayout.Button("Exit Game")) {
//			Application.Quit();
//		}
//		GUILayout.EndHorizontal();
//	}
//	
//}

function MakeStartWindow (id : int) {	
	if (Network.peerType == NetworkPeerType.Disconnected) {
		GUILayout.Space(12);
		
		GUILayout.BeginHorizontal();
		GUILayout.Label("     ");
		if (GUILayout.Button("back  >>", GUILayout.ExpandWidth(false))){
			currScreen = GUIScreen.Default;
		}
		GUILayout.EndHorizontal();
		
		GUILayout.Space(10);
	
		GUILayout.BeginHorizontal();
		GUILayout.Label("player name");
		playerName = GUILayout.TextField(playerName);
		GUILayout.EndHorizontal();
		
		GUILayout.Space(10);
		
		GUILayout.BeginHorizontal();
		GUILayout.Label("map");
		selectedLevelId = GUILayout.SelectionGrid(selectedLevelId, levels, 1);
		GUILayout.EndHorizontal();
		
		GUILayout.BeginHorizontal();
		GUILayout.Label("bot count");
		botCount = GUILayout.TextField(botCount);
		GUILayout.EndHorizontal();
		
		GUILayout.BeginHorizontal();
		GUILayout.Label("     ");
		if (GUILayout.Button("start singleplayer")) {
			StartServer (serverName, levels[selectedLevelId], false);
		}
		GUILayout.EndHorizontal();
		
		GUILayout.Space(12);
		
		GUILayout.BeginHorizontal();
		GUILayout.Label("server name");
		serverName = GUILayout.TextField(serverName);
		GUILayout.EndHorizontal();
		
		GUILayout.BeginHorizontal();
		GUILayout.Label("maximum connections");
		humanPlayers = GUILayout.TextField(humanPlayers);
		GUILayout.EndHorizontal();
		
		GUILayout.BeginHorizontal();
		GUILayout.Label("     ");
		if (GUILayout.Button ("start server")) {
			StartServer (serverName, levels[selectedLevelId], true);
		}
		GUILayout.EndHorizontal();
	}
}

function MakeCreditWindow (id : int) {	
	GUILayout.Space(12);
	
	GUILayout.Button("YETI TOURNAMENT", GUILayout.ExpandWidth(false));
	GUILayout.Space(22);
	GUILayout.Label("benjamin bisping  -  ben@mrkeks.net");
	GUILayout.Label("tiare feuchtner  -  tiaref26@gmail.com");
	GUILayout.Label("andreas büscher  -  andi_buescher0404@gmx.de");
	GUILayout.Label("hannes rammer  -  hannes.rammer@gmail.com");
	GUILayout.Space(22);
	GUILayout.Label("Game Dev Class");
	GUILayout.Label("SoSe2012 @ TU Berlin");
	GUILayout.Space(22);
	GUILayout.Label("Happy new year!");
}

function StartServer (serverName :String, level :String, global :boolean) {
	if (global) needTesting = true;
	Network.InitializeServer(global ? parseInt(humanPlayers) : 0, serverPort, useNat);
	if (global) MasterServer.RegisterHost(gameName, serverName, "Map: "+level);
	GetComponent(NetworkLevelLoad).LoadNewLevel(level);
}

function MakeJoinWindow(id : int)
{
	if (!needTesting) return;
	GUILayout.Space(12);
	GUILayout.BeginHorizontal();
	if (GUILayout.Button("<<  back", GUILayout.ExpandWidth(false))) {
		currScreen = GUIScreen.Default;
	}
	GUILayout.Label("     ");
	GUILayout.EndHorizontal();
	
	GUILayout.Space(10);
	
	GUILayout.BeginHorizontal();
	GUILayout.Label("player name");
	playerName = GUILayout.TextField(playerName);
	GUILayout.EndHorizontal();
	
	GUILayout.Space(10);

	GUILayout.BeginHorizontal();
	GUILayout.Label("server IP");
	iPAdress = GUILayout.TextField(iPAdress);
	GUILayout.Label("port");
	iPort = GUILayout.TextField(iPort);
	if (GUILayout.Button("connect")) {
		Debug.Log ("Trying to connect to "+iPAdress);
		var error :NetworkConnectionError = Network.Connect(iPAdress, parseInt(iPort));
		if (error && error != NetworkConnectionError.NoError) {
			Debug.Log ("Connection failed "+error);
		} else {
			Debug.Log ("Connection successfull "+error);
		}
	}
	GUILayout.EndHorizontal();

	// Refresh hosts
	if (GUILayout.Button ("refresh available servers") || Time.realtimeSinceStartup > lastHostListRequest + hostListRefreshTimeout)
	{
		MasterServer.RequestHostList (gameName);
		lastHostListRequest = Time.realtimeSinceStartup;
	}
	GUILayout.Space(5);

	var data : HostData[] = MasterServer.PollHostList();
	var count = 0;
	if (data.Length == 0) {
		GUILayout.Space(25);
		GUILayout.BeginHorizontal();
		GUILayout.Label(" --| no servers found. :( |-- ");
		GUILayout.EndHorizontal();
		GUILayout.Space(25);
	}
	for (var element in data)
	{
		GUILayout.BeginHorizontal();

		// Do not display NAT enabled games if we cannot do NAT punchthrough
		if ( !(filterNATHosts && element.useNat) )
		{
			var connections = element.connectedPlayers + "/" + element.playerLimit;
			GUILayout.Label(element.gameName);
			GUILayout.Space(5);
			GUILayout.Label(connections);
			GUILayout.Space(5);
			var hostInfo = "";
			
			// Indicate if NAT punchthrough will be performed, omit showing GUID
			if (element.useNat)
			{
				GUILayout.Label("NAT");
				GUILayout.Space(5);
			}
			// Here we display all IP addresses, there can be multiple in cases where
			// internal LAN connections are being attempted. In the GUI we could just display
			// the first one in order not confuse the end user, but internally Unity will
			// do a connection check on all IP addresses in the element.ip list, and connect to the
			// first valid one.
			for (var host in element.ip)
				hostInfo = hostInfo + host + ":" + element.port + " ";
			
			//GUILayout.Label("[" + element.ip + ":" + element.port + "]");	
			GUILayout.Label(hostInfo);	
			GUILayout.Space(5);
			GUILayout.Label(element.comment);
			GUILayout.Space(5);
			GUILayout.FlexibleSpace();
			if (GUILayout.Button("connect"))
				Network.Connect(element);
		}
		GUILayout.EndHorizontal();	
		
		
	}
}

function OnApplicationQuit () {
	MasterServer.UnregisterHost();
}

function GetBotCount () : int {
	return parseInt(botCount);
}

function Disconnect () {
	if (Network.isServer) {
		Debug.Log("Closing down Server.");
	} else {
		Debug.Log("Disconnect from Server.");
	}
	Network.Disconnect();
	MasterServer.UnregisterHost();
}