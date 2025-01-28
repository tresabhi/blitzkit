using CLI.Models;

namespace CLI.Functions
{
  public static class Mangler
  {
    public static void Mangle()
    {
      BlitzProvider provider = new();

      foreach (var nation in provider.RootDirectory.GetDirectory("Blitz/Content/Tanks").Directories)
      {
        if (nation.Key == "TankStub")
          continue;

        foreach (var tank in nation.Value.Directories)
        {
          if (!tank.Value.HasFile($"DA_{tank.Key}_Attributes.uasset"))
          {
            Console.WriteLine($"{nation.Key}/{tank.Key}");
          }
        }
      }
    }
  }
}
