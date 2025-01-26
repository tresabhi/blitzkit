using CLI.Functions;

namespace CLI
{
  class Program
  {
    static async Task Main(string[] args)
    {
      switch (args[0])
      {
        case "unpack":
        {
          await Unpacker.Unpack(args);
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
