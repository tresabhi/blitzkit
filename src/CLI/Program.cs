using CLI.Functions;

namespace CLI
{
  class Program
  {
    static void Main(string[] args)
    {
      switch (args[0])
      {
        case "unpack":
        {
          Unpacker.Unpack(args);
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
