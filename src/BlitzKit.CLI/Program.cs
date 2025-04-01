using System.Globalization;
using BlitzKit.CLI.Functions;
using BlitzKit.CLI.Utils;
using DotNetEnv;

namespace BlitzKit.CLI
{
  class Program
  {
    public static CultureInfo Culture = new("en-US");

    static async Task Main(string[] args)
    {
      Env.Load();
      await AgnosticHelpers.Initialize();

      switch (args[0])
      {
        case "unpack":
        {
          await Unpacker.Unpack(args);
          break;
        }

        case "api":
        {
          Api api = new(args);
          await api.Run();
          break;
        }

        default:
        {
          throw new ArgumentException("Invalid command");
        }
      }
    }
  }
}
