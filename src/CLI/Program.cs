using CLI.Functions;
using CLI.Models;

namespace CLI
{
  class Program
  {
    static void Main(string[] args)
    {
      Arguments arguments = new(args);

      switch (args[0])
      {
        case "dlc":
        {
          DLC.Run(arguments);
          break;
        }
      }
    }
  }
}
