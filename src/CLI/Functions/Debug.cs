using DotNet.Globbing;

namespace CLI.Functions
{
  public static class Debug
  {
    public static void Run(string[] args)
    {
      var glob = Glob.Parse("Blitz/Content/Tanks/**");

      Console.WriteLine(
        glob.IsMatch(
          "Blitz/Content/Tanks/China/Ch01_Type59/Attachments/ATC_Ch01_Type59_hull.uasset"
        )
      );
    }
  }
}
