// Mission script for mapscan.sh: dumps water sources, fuel pumps, road pieces, place names and terrain heights
// to $profile:mapscan.txt using the official script API, then shuts the server down.
// Note: Enforce forbids reusing a variable name anywhere in one function.
const float OBJ_STEP = 100;   // object query grid (m); circle radius covers the whole cell
const float H_STEP = 16;      // terrain height grid (m)

void main()
{
	string world = g_Game.GetWorldName();
	float size = g_Game.GetWorld().GetWorldSize();
	FileHandle f = OpenFile("$profile:mapscan.txt", FileMode.WRITE);
	FPrintln(f, string.Format("world %1 %2", world, size));

	// Water: every Well subclass (Nasdara brick wells count even before they are rebuilt), troughs
	// and Sakhal springs (plain models without a script class, written as their model path).
	// Roads: each road piece model as a segment along the long side of its bounding box.
	map<string, bool> seen = new map<string, bool>();
	array<Object> objects = new array<Object>();
	array<CargoBase> proxies = new array<CargoBase>();
	for (float x = OBJ_STEP / 2; x < size; x += OBJ_STEP)
	{
		for (float z = OBJ_STEP / 2; z < size; z += OBJ_STEP)
		{
			objects.Clear();
			g_Game.GetObjectsAtPosition(Vector(x, 0, z), OBJ_STEP * 0.75, objects, proxies);
			foreach (Object o : objects)
			{
				string shape = o.GetShapeName();
				shape.ToLower();
				string line = "";
				if (o.IsInherited(Well) || shape.Contains("waterspring") || o.GetWaterSourceObjectType() != EWaterSourceObjectType.NONE)
				{
					string kind = o.GetType();
					if (kind == "")
						kind = shape;
					vector p = o.GetPosition();
					line = string.Format("water %1 %2 %3", kind, Math.Round(p[0]), Math.Round(p[2]));
				}
				else if (o.IsInherited(FuelStation))
				{
					vector pump = o.GetPosition();
					line = string.Format("fuel %1 %2", Math.Round(pump[0]), Math.Round(pump[2]));
				}
				else if ((shape.Contains("\\roads\\parts\\") || shape.Contains("nst\\ns\\roads\\")) && !shape.Contains("centerline"))
				{
					vector box[2];
					o.ClippingInfo(box);
					vector a = (box[0] + box[1]) * 0.5;
					vector b = a;
					if (box[1][0] - box[0][0] > box[1][2] - box[0][2])
					{
						a[0] = box[0][0];
						b[0] = box[1][0];
					}
					else
					{
						a[2] = box[0][2];
						b[2] = box[1][2];
					}
					a = o.ModelToWorld(a);
					b = o.ModelToWorld(b);
					string surface = "dirt";
					if (shape.Contains("asf") || shape.Contains("taxiway"))
						surface = "asf";
					else if (shape.Contains("grav") || shape.Contains("snowroad") || shape.Contains("quarry"))
						surface = "grav";
					line = string.Format("road %1 %2 %3 %4 %5", surface, Math.Round(a[0]), Math.Round(a[2]), Math.Round(b[0]), Math.Round(b[2]));
				}
				if (line == "" || seen.Contains(line))
					continue;
				seen.Insert(line, true);
				FPrintln(f, line);
			}
		}
	}

	// Place names from the world config: "name <class> <type> <x> <z> <text>".
	string names = "CfgWorlds " + world + " Names";
	for (int i = 0; i < g_Game.ConfigGetChildrenCount(names); i++)
	{
		string cls, type, text;
		g_Game.ConfigGetChildName(names, i, cls);
		g_Game.ConfigGetText(names + " " + cls + " type", type);
		g_Game.ConfigGetText(names + " " + cls + " name", text);
		TFloatArray pos = new TFloatArray();
		g_Game.ConfigGetFloatArray(names + " " + cls + " position", pos);
		if (pos.Count() >= 2)
			FPrintln(f, string.Format("name %1 %2 %3 %4 %5", cls, type, Math.Round(pos[0]), Math.Round(pos[1]), text));
	}

	// Heights in decimetres and pond flags, one row per z (south to north).
	for (float hz = 0; hz <= size; hz += H_STEP)
	{
		string heights = "h";
		string ponds = "p ";
		for (float hx = 0; hx <= size; hx += H_STEP)
		{
			int dm = Math.Round(g_Game.SurfaceY(hx, hz) * 10);
			heights += " " + dm.ToString();
			if (g_Game.SurfaceIsPond(hx, hz))
				ponds += "1";
			else
				ponds += "0";
		}
		FPrintln(f, heights);
		FPrintln(f, ponds);
	}

	FPrintln(f, "end");
	CloseFile(f);
	Print("mapscan: done");
	g_Game.RequestExit(0);
}

Mission CreateCustomMission(string path)
{
	return new MissionServer();
}
