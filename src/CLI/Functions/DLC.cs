using CLI.Models;

namespace CLI.Functions
{
  class DLC
  {
    public static void Run(Arguments args)
    {
      if (args.raw.Length < 2)
      {
        throw new ArgumentException("No directory provided");
      }

      string dlcPaksDirectory = args.raw[1];

      if (args.sanitize && Directory.Exists(dlcPaksDirectory))
      {
        Directory.Delete(dlcPaksDirectory, true);
      }

      Directory.CreateDirectory(dlcPaksDirectory);

      string testFilePath = Path.Combine(dlcPaksDirectory, "test.txt");
      File.WriteAllText(testFilePath, "test");
    }
  }
}
