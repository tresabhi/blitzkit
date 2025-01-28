using CLI.Functions;
using CLI.Utils;

namespace CLI
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
