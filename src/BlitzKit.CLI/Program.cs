using BlitzKit.CLI.Functions;
using BlitzKit.CLI.Utils;

namespace BlitzKit.CLI
{
  class Program
  {
    static async Task Main(string[] args)
    {
      await AgnosticHelpers.Initialize();

      switch (args[0])
      {
        case "unpack":
        {
          await Unpacker.Unpack(args);
          break;
        }

        case "mangle":
        {
          Mangler.Mangle();
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
