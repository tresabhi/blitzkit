namespace BlitzKit.CLI.Utils
{
  public static class PrettyLog
  {
    public static void Log(string message)
    {
      Console.WriteLine(message);
    }

    public static void Warn(string message)
    {
      Console.ForegroundColor = ConsoleColor.Yellow;
      Console.WriteLine(message);
      Console.ResetColor();
    }

    public static void Error(string message)
    {
      Console.ForegroundColor = ConsoleColor.Red;
      Console.WriteLine(message);
      Console.ResetColor();
    }

    public static void Success(string message)
    {
      Console.ForegroundColor = ConsoleColor.Green;
      Console.WriteLine(message);
      Console.ResetColor();
    }
  }
}
