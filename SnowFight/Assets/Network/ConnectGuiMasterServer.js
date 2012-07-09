DontDestroyOnLoad(this);

var gameName = "TUSnowFight";
var serverPort = 25002;
var serverName = "SomeServer";
var botCount = "10";

var playerName = "Player01";
var iPAdress = "0.0.0.0:0000";


private var timeoutHostList = 0.0;
private var lastHostListRequest = -1000.0;
private var hostListRefreshTimeout = 10.0;

private var connectionTestResult : ConnectionTesterStatus = ConnectionTesterStatus.Undetermined;
private var filterNATHosts = false;
private var probingPublicIP = false;
private var doneTesting = false;
private var timer : float = 0.0;
private var useNat = false;		// Should the server enabled NAT punchthrough feature

private var windowRect;
private var serverListRect;
private var creditRect;
private var instructionsRect;
private var hideTest = false;
private var testMessage = "Undetermined NAT capabilities";

private var levels :String[];
private var selectedLevelId = 0;

private var creditString : String[] = ["Benjamin Bisping", "Tiare Feuchtner", "Hannes Rammer", "Andreas Büscher"];
var skin : GUISkin;

private var credits = false;
private var instructions = false;
private var gameInstructions = false;
private var inputInstructions = false;

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
		windowRect = GUILayout.Window (0, windowRect, MakeWindow, "Server Controls");
		serverListRect = GUILayout.Window(1, serverListRect, MakeClientWindow, "Server List");
		if (GUI.Button (Rect (Screen.width - 110, Screen.height - 35, 100, 30), "Quit Game")) {
			Application.Quit();
		}
		if (GUI.Button (Rect (10, Screen.height - 35, 80, 30), "Credits")) {
			ShowCredits();
		}
		if (GUI.Button (Rect (100, Screen.height - 35, 110, 30), "Instructions")) {
			ShowInstructions();
		}
		if (credits) {
			creditRect = GUILayout.Window(2, creditRect, MakeCreditWindow, "Credits");
		}
		if (instructions) {
			instructionsRect = GUILayout.Window(3, instructionsRect, MakeInstructionsWindow, "Instructions");
		}
		if (gameInstructions) {
			instructionsRect = GUILayout.Window(4, instructionsRect, MakeGameInstructionsWindow, "Game Instructinons");
		}
		if (inputInstructions) {
			instructionsRect = GUILayout.Window(5, instructionsRect, MakeInputInstructionsWindow, "Input Instructinons");
		}
		// Start a new server
		if (GUI.Button (Rect (Screen.width - 250, Screen.height/2 - 150, 225, 30), "Start Server / Singleplayer"))
		{
			StartServer (serverName, levels[selectedLevelId]);
		}
	}
}

function ShowCredits() {
	if (instructions) instructions = false;
	if (gameInstructions) gameInstructions = false;
	if (inputInstructions) inputInstructions = false; 
	credits = !credits;
}

function ShowInstructions() {
	instructionsRect = Rect(Screen.width/2 - 300, Screen.height/2 - 125, 600, 100);
	if (gameInstructions) gameInstructions = false;
	if (credits) credits = false;
	if (inputInstructions) inputInstructions = false; 
	instructions = !instructions;
}

function ShowGameInstructions() {
	if (instructions) instructions = false;
	if (credits) credits = false;
	if (inputInstructions) inputInstructions = false; 
	gameInstructions = !gameInstructions;
}

function ShowInputInstructions() {
	if (instructions) instructions = false;
	if (credits) credits = false;
	if (gameInstructions) gameInstructions = false; 
	inputInstructions = !inputInstructions;
}

function Awake ()
{
	windowRect = Rect(Screen.width-300,0,300,100);
	serverListRect = Rect(0, 0, Screen.width - windowRect.width, 100);
	creditRect = Rect(Screen.width/2 - 100, Screen.height/2 - 50, 200, 100);
	instructionsRect = Rect(Screen.width/2 - 300, Screen.height/2 - 125, 600, 100);
	// Start connection test
	connectionTestResult = Network.TestConnection();
	
	// What kind of IP does this machine have? TestConnection also indicates this in the
	// test results
	if (Network.HavePublicAddress())
		Debug.Log("This machine has a public IP address");
	else
		Debug.Log("This machine has a private IP address");
	
	levels = GetComponent(NetworkLevelLoad).supportedNetworkLevels;
}



function Update()
{
	// If test is undetermined, keep running
	if (!doneTesting)
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

function MakeInputInstructionsWindow(id : int) {
	if (Network.peerType == NetworkPeerType.Disconnected) {
		GUILayout.Space(12);
		GUILayout.BeginHorizontal();
		GUILayout.Label("Move your character with arrow keys or WASD.");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("Press M to show/close map overview.");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("Press Esc to show/close ingame menu.");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("Press E to use items.");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("Hold left mouse button to aim and release to shoot.");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("Right click to burp.");
		GUILayout.EndHorizontal();
		GUILayout.Space(20);
		if (GUILayout.Button("Close")) {
			ShowInstructions();
		}
	}
}

function MakeGameInstructionsWindow(id : int) {
	if (Network.peerType == NetworkPeerType.Disconnected) {
		GUILayout.Space(12);
		GUILayout.BeginHorizontal();
		GUILayout.Label("The main goal is to decrease the ticket number of the enemy team to zero.");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("The actual tickets are shown in the upper left corner of your screen.");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("You can achieve this by killing other yetis with snowballs.");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("You can also capture flag points by standing near to them.");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("If you are standing inside a snow ressource hold E to create a big snowball.");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("Bring the ball back to a base to exchange it with an item (UFO, Rocket launcher).");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("You can also left click while rolling a big snowball to shoot it.");
		GUILayout.EndHorizontal();
		GUILayout.BeginHorizontal();
		GUILayout.Label("Right click to make a snow ressource out of a big snowball.");
		GUILayout.EndHorizontal();
		GUILayout.Space(20);
		if (GUILayout.Button("Close")) {
			ShowInstructions();
		}
	}
}

function MakeInstructionsWindow(id : int) {
	if (Network.peerType == NetworkPeerType.Disconnected) {
		GUILayout.Space(12);
		if (GUILayout.Button("Game Instructions")) {
			ShowGameInstructions();
		}
		if (GUILayout.Button("Input Instructions")) {
			ShowInputInstructions();
		}
		GUILayout.Space(20);
		if (GUILayout.Button("Close")) {
			instructions = false;
		}
	}
}

function MakeCreditWindow(id : int) {
	if (Network.peerType == NetworkPeerType.Disconnected) {
		GUILayout.Space(12);
		for (var name : String in creditString) {
			GUILayout.BeginHorizontal();
			GUILayout.Label(name);
			GUILayout.EndHorizontal();
		}
		GUILayout.Space(20);
		if (GUILayout.Button("Close")) {
			credits = false;
		}
	}
}

function MakeWindow (id : int)
{	
	if (Network.peerType == NetworkPeerType.Disconnected)
	{
		
		GUILayout.Space(12);
		
		GUILayout.BeginHorizontal();
		GUILayout.Label("Server Name");
		serverName = GUILayout.TextField(serverName);
		GUILayout.EndHorizontal();
		
		GUILayout.BeginHorizontal();
		GUILayout.Label("Map");
		selectedLevelId = GUILayout.SelectionGrid(selectedLevelId, levels, 1);
		GUILayout.EndHorizontal();
		
		GUILayout.BeginHorizontal();
		GUILayout.Label("Bot count");
		botCount = GUILayout.TextField(botCount);
		GUILayout.EndHorizontal();
		
		GUILayout.FlexibleSpace();
	}
	//GUI.DragWindow (Rect (0,0,1000,1000));
}

function StartServer (serverName :String, level :String) {
	Network.InitializeServer(32, serverPort, useNat);
	MasterServer.RegisterHost(gameName, serverName, "Map: "+level);
	GetComponent(NetworkLevelLoad).LoadNewLevel(level);
}

function MakeClientWindow(id : int)
{
	GUILayout.Space(12);
	GUILayout.BeginHorizontal();
	GUILayout.Label("Player name");
	playerName = GUILayout.TextField(playerName);
	GUILayout.EndHorizontal();

	GUILayout.BeginHorizontal();
	GUILayout.Label("IP-Adress of network server");
	iPAdress = GUILayout.TextField(iPAdress);
	GUILayout.EndHorizontal();

	// Refresh hosts
	if (GUILayout.Button ("Refresh available Servers") || Time.realtimeSinceStartup > lastHostListRequest + hostListRefreshTimeout)
	{
		MasterServer.RequestHostList (gameName);
		lastHostListRequest = Time.realtimeSinceStartup;
	}
	GUILayout.Space(5);

	var data : HostData[] = MasterServer.PollHostList();
	var count = 0;
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
			if (GUILayout.Button("Connect"))
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
	Network.Disconnect();
	MasterServer.UnregisterHost();
}